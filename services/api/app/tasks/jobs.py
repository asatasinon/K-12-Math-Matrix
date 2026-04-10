from app.tasks.celery_app import celery_app


@celery_app.task
def refresh_search_index() -> dict[str, str]:
    return {"status": "queued", "task": "refresh_search_index"}


@celery_app.task
def run_ai_draft_generation() -> dict[str, str]:
    return {"status": "queued", "task": "run_ai_draft_generation"}

