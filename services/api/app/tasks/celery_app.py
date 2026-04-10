from celery import Celery

from app.core.config import settings

celery_app = Celery("k12_math_matrix")
celery_app.conf.broker_url = settings.redis_url
celery_app.conf.result_backend = settings.redis_url
celery_app.conf.task_default_queue = "default"
celery_app.conf.task_routes = {
    "app.tasks.jobs.refresh_search_index": {"queue": "search"},
    "app.tasks.jobs.run_ai_draft_generation": {"queue": "ai"},
}

celery_app.autodiscover_tasks(["app.tasks"])

