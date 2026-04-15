import logging

import httpx

logger = logging.getLogger(__name__)

DEFAULT_REDIS_URL = "redis://127.0.0.1:6379/0"

async def send_webhook_http(url: str, payload: dict) -> None:
    async with httpx.AsyncClient(timeout=10.0) as client:
        response = await client.post(url, json=payload)
        response.raise_for_status()


async def enqueue_webhook(url: str, payload: dict, *, redis_url: str = DEFAULT_REDIS_URL) -> None:
    """
    Enqueue a webhook delivery job.
    If Redis/queue is unavailable, logs and returns without raising.
    """
    try:
        from arq import create_pool
        from arq.connections import RedisSettings
    except Exception as e:
        logger.error("webhook: queue dependencies missing error=%s", e, exc_info=True)
        return

    try:
        redis = await create_pool(RedisSettings.from_dsn(redis_url))
        try:
            await redis.enqueue_job("send_webhook_job", url, payload)
        finally:
            redis.close()
            await redis.wait_closed()
    except Exception as e:
        logger.error("webhook: enqueue failed url=%r error=%s", url, e, exc_info=True)


async def send_webhook_job(ctx, url: str, payload: dict) -> None:
    """
    Worker job: send webhook with exponential backoff retries.
    Retries: 3 (total attempts). Backoff: 2s, 4s, 8s.
    """
    from arq import Retry

    job_try = int(ctx.get("job_try", 1))
    try:
        await send_webhook_http(url, payload)
    except httpx.TimeoutException as e:
        if job_try < 4:
            raise Retry(defer=2 ** (job_try)) from e
        raise
    except httpx.HTTPStatusError as e:
        status = e.response.status_code
        if 500 <= status <= 599 and job_try < 4:
            raise Retry(defer=2 ** (job_try)) from e
        raise
