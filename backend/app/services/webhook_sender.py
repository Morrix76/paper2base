import logging

import httpx

logger = logging.getLogger(__name__)


async def send_webhook(url: str, payload: dict) -> None:
    """
    POST JSON payload to the given URL. Logs failures and never raises —
    callers can fire-and-forget without affecting the API response.
    """
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.post(url, json=payload)
            response.raise_for_status()
    except Exception as e:
        logger.error(
            "webhook: POST failed url=%r error=%s",
            url,
            e,
            exc_info=True,
        )
