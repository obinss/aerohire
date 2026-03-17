"""
Celery worker — manages the scraping task queue and CRON-based auto-match alerts.

Queue architecture:
  - Redis as broker + result backend
  - scrape_url_task: fetches and stores job listings
  - auto_match_task: runs match scoring for all users with saved profiles
  - imap_ingestion_task: periodic IMAP poll (every 5 minutes)
"""
import asyncio
from typing import Optional

from celery import Celery
from celery.schedules import crontab

from config import settings

# ── Celery App ────────────────────────────────────────────────────────────

celery_app = Celery(
    "aerohire",
    broker=settings.REDIS_URL,
    backend=settings.REDIS_URL,
    include=["worker"],
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
    task_soft_time_limit=120,  # 2 min soft kill
    task_time_limit=300,       # 5 min hard kill
    worker_prefetch_multiplier=1,
    task_acks_late=True,
)

# ── Beat Schedule (CRON) ──────────────────────────────────────────────────

celery_app.conf.beat_schedule = {
    "scrape-job-boards-every-hour": {
        "task": "worker.scheduled_scrape_task",
        "schedule": crontab(minute="0"),  # Top of every hour
    },
    "auto-match-every-30mins": {
        "task": "worker.auto_match_task",
        "schedule": crontab(minute="*/30"),
    },
    "imap-poll-every-5mins": {
        "task": "worker.imap_poll_task",
        "schedule": crontab(minute="*/5"),
    },
}


# ── Tasks ─────────────────────────────────────────────────────────────────

@celery_app.task(bind=True, name="worker.scrape_url_task", max_retries=3)
def scrape_url_task(self, url: str, source: str = "web"):
    """Scrape a single job board URL and persist results to DB."""
    try:
        from services.scraper import scrape_job_board
        from prisma import Prisma

        async def _run():
            jobs = await scrape_job_board(url, source=source)
            db = Prisma()
            await db.connect()
            saved = 0
            try:
                for job_data in jobs:
                    # Upsert by URL to avoid duplicates
                    existing = await db.job.find_unique(where={"url": job_data["url"]})
                    if not existing and job_data["url"]:
                        await db.job.create(data={
                            "title": job_data["title"],
                            "company": job_data["company"],
                            "description": job_data.get("description", ""),
                            "url": job_data["url"],
                            "source": source,
                        })
                        saved += 1
            finally:
                await db.disconnect()
            return saved

        count = asyncio.run(_run())
        print(f"[Worker] Scraped {url}: saved {count} new jobs")
        return {"status": "ok", "saved": count}

    except Exception as exc:
        print(f"[Worker] scrape_url_task error: {exc}")
        raise self.retry(exc=exc, countdown=60)


@celery_app.task(name="worker.scheduled_scrape_task")
def scheduled_scrape_task():
    """Hourly CRON — trigger scrapes for default job boards."""
    from routers.scraper import DEFAULT_JOB_BOARDS
    for url in DEFAULT_JOB_BOARDS:
        scrape_url_task.delay(url, source="cron")
    return {"queued": len(DEFAULT_JOB_BOARDS)}


@celery_app.task(name="worker.auto_match_task")
def auto_match_task():
    """
    Every 30 mins — run match scoring for all users with a CV uploaded.
    If score > 85%, dispatch email notification via Resend.
    """
    from prisma import Prisma
    from services.match_scorer import compute_match_score
    import resend

    resend.api_key = settings.RESEND_API_KEY

    async def _run():
        db = Prisma()
        await db.connect()
        try:
            profiles = await db.profile.find_many(
                where={"baseResumeText": {"not": None}},
                include={"user": True},
            )
            recent_jobs = await db.job.find_many(
                order={"createdAt": "desc"},
                take=50,
            )

            for profile in profiles:
                if not profile.baseResumeText:
                    continue
                for job in recent_jobs:
                    if not job.description:
                        continue
                    score, _ = await compute_match_score(
                        resume_text=profile.baseResumeText,
                        job_description=job.description,
                    )
                    if score >= 0.85:
                        # Create application record if doesn't exist
                        existing = await db.application.find_first(
                            where={"userId": profile.userId, "jobId": job.id}
                        )
                        if not existing:
                            await db.application.create(
                                data={
                                    "userId": profile.userId,
                                    "jobId": job.id,
                                    "status": "Saved",
                                    "matchScore": score,
                                }
                            )
                            # Send email alert
                            if profile.user and profile.user.email:
                                _send_match_alert(
                                    email=profile.user.email,
                                    job_title=job.title,
                                    company=job.company,
                                    score=round(score * 100, 1),
                                )

        finally:
            await db.disconnect()

    asyncio.run(_run())


def _send_match_alert(email: str, job_title: str, company: str, score: float):
    """Send a high-match job alert email via Resend."""
    try:
        import resend
        resend.Emails.send({
            "from": "alerts@aerohire.app",
            "to": email,
            "subject": f"✈ New {score}% Match: {job_title} at {company}",
            "html": f"""
            <div style="font-family: Inter, sans-serif; background: #0A0A0A; color: #fff; padding: 32px; border-radius: 12px;">
              <h2 style="color: #D4AF37; font-family: 'Playfair Display', serif;">AeroHire Alert</h2>
              <p>A new high-match opportunity has been detected:</p>
              <div style="background: rgba(212,175,55,0.1); border: 1px solid rgba(212,175,55,0.3); border-radius: 8px; padding: 16px; margin: 16px 0;">
                <h3 style="color: #fff; margin: 0 0 8px 0;">{job_title}</h3>
                <p style="color: #8D96A8; margin: 0 0 8px 0;">{company}</p>
                <p style="color: #D4AF37; font-size: 28px; font-weight: bold; margin: 0;">{score}% Match</p>
              </div>
              <a href="https://aerohire.app/pipeline" style="background: #D4AF37; color: #000; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 600;">View in Pipeline →</a>
            </div>
            """,
        })
    except Exception as e:
        print(f"[Worker] Email send failed: {e}")


@celery_app.task(name="worker.imap_poll_task")
def imap_poll_task():
    """Every 5 mins — poll IMAP inbox for new job alert emails."""
    from services.imap_ingestion import IMAPJobIngestionService

    async def _run():
        service = IMAPJobIngestionService()
        urls = service.fetch_job_urls()
        for url in urls:
            scrape_url_task.delay(url, source="email-alert")
        return len(urls)

    count = asyncio.run(_run())
    print(f"[Worker] IMAP poll: dispatched {count} URLs")
    return {"dispatched": count}
