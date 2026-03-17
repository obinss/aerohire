"""Scraper router — manual trigger and status check."""
from fastapi import APIRouter, Depends, BackgroundTasks
from pydantic import BaseModel

from auth_utils import get_current_user_id
from worker import scrape_url_task

router = APIRouter()

DEFAULT_JOB_BOARDS = [
    "https://www.linkedin.com/jobs/search/?keywords=software+engineer&location=Remote",
    "https://www.linkedin.com/jobs/search/?keywords=product+designer&location=Remote",
    "https://www.indeed.com/jobs?q=senior+engineer&sort=date",
]


class TriggerResponse(BaseModel):
    task_count: int
    status: str
    message: str


@router.post("/trigger", response_model=TriggerResponse)
async def trigger_scraper(
    background_tasks: BackgroundTasks,
    user_id: str = Depends(get_current_user_id),
):
    """Manually trigger a scraping run against the default job boards."""
    for url in DEFAULT_JOB_BOARDS:
        scrape_url_task.delay(url, source="manual-trigger")

    return TriggerResponse(
        task_count=len(DEFAULT_JOB_BOARDS),
        status="queued",
        message=f"Dispatched {len(DEFAULT_JOB_BOARDS)} scraping tasks to the queue",
    )
