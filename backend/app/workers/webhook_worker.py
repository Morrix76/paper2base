from arq.connections import RedisSettings

from app.services.webhook_sender import DEFAULT_REDIS_URL, send_webhook_job


class WorkerSettings:
    functions = [send_webhook_job]
    redis_settings = RedisSettings.from_dsn(DEFAULT_REDIS_URL)

