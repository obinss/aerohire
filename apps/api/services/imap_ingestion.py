"""
IMAP email ingestion service.

Connects to the user's email inbox, searches for job alert emails,
parses the HTML body with BeautifulSoup to extract job links,
and feeds URLs into the scraping queue.
"""
import asyncio
import email
import imaplib
import re
from email.header import decode_header
from typing import List, Optional

from bs4 import BeautifulSoup

from config import settings


# ── Email Subject Patterns ────────────────────────────────────────────────

JOB_ALERT_SUBJECTS = [
    "job alert",
    "new positions",
    "new jobs",
    "jobs for you",
    "recommended jobs",
    "career opportunities",
    "job matches",
    "your weekly jobs",
    "daily job digest",
    "new openings",
]

# ── URL Extraction ────────────────────────────────────────────────────────

JOB_BOARD_DOMAINS = [
    "linkedin.com/jobs",
    "indeed.com/viewjob",
    "glassdoor.com/job-listing",
    "reed.co.uk/jobs",
    "totaljobs.com/job",
    "jobs.lever.co",
    "greenhouse.io",
    "workday.com",
    "smartrecruiters.com",
]


def _extract_job_urls(html_body: str) -> List[str]:
    """Extract job listing URLs from an email HTML body."""
    soup = BeautifulSoup(html_body, "lxml")
    links = soup.find_all("a", href=True)
    job_urls = []

    for link in links:
        href: str = link["href"]
        if any(domain in href for domain in JOB_BOARD_DOMAINS):
            # Clean tracking parameters from URLs
            clean_url = href.split("?")[0] if "?" in href else href
            if clean_url not in job_urls:
                job_urls.append(clean_url)

    return job_urls


def _decode_header_value(value: str) -> str:
    """Decode RFC 2047 encoded email headers."""
    decoded_parts = decode_header(value)
    parts = []
    for part, charset in decoded_parts:
        if isinstance(part, bytes):
            parts.append(part.decode(charset or "utf-8", errors="replace"))
        else:
            parts.append(part)
    return "".join(parts)


def _is_job_alert(subject: str) -> bool:
    """Check if an email subject matches our job alert patterns."""
    subject_lower = subject.lower()
    return any(pattern in subject_lower for pattern in JOB_ALERT_SUBJECTS)


# ── IMAP Listener ─────────────────────────────────────────────────────────

class IMAPJobIngestionService:
    """
    Polls the user's IMAP inbox at regular intervals,
    finds job alert emails, and extracts listing URLs.
    """

    def __init__(
        self,
        host: str = settings.IMAP_HOST,
        port: int = settings.IMAP_PORT,
        username: str = settings.IMAP_USER,
        password: str = settings.IMAP_PASSWORD,
        poll_interval_seconds: int = 300,  # 5 minutes
    ):
        self.host = host
        self.port = port
        self.username = username
        self.password = password
        self.poll_interval = poll_interval_seconds

    def _connect(self) -> imaplib.IMAP4_SSL:
        """Establish a secure IMAP connection."""
        mail = imaplib.IMAP4_SSL(self.host, self.port)
        mail.login(self.username, self.password)
        return mail

    def fetch_job_urls(self) -> List[str]:
        """
        Connect to inbox, search for job alert emails,
        and return all unique job listing URLs found.
        """
        all_urls: List[str] = []

        try:
            mail = self._connect()
            mail.select("INBOX")

            # Search for UNSEEN job alert emails
            status, messages = mail.search(None, "UNSEEN")
            if status != "OK":
                return all_urls

            email_ids = messages[0].split()
            print(f"[IMAP] Found {len(email_ids)} unread emails to process")

            for email_id in email_ids[-50:]:  # Process last 50 unread max
                try:
                    _, msg_data = mail.fetch(email_id, "(RFC822)")
                    raw_email = msg_data[0][1]
                    msg = email.message_from_bytes(raw_email)

                    subject = _decode_header_value(msg.get("Subject", ""))

                    if not _is_job_alert(subject):
                        continue

                    print(f"[IMAP] Processing job alert: {subject}")

                    # Extract HTML body
                    html_body: Optional[str] = None
                    if msg.is_multipart():
                        for part in msg.walk():
                            if part.get_content_type() == "text/html":
                                html_body = part.get_payload(decode=True).decode(
                                    part.get_content_charset() or "utf-8",
                                    errors="replace",
                                )
                                break
                    else:
                        payload = msg.get_payload(decode=True)
                        if payload:
                            html_body = payload.decode(
                                msg.get_content_charset() or "utf-8",
                                errors="replace",
                            )

                    if html_body:
                        urls = _extract_job_urls(html_body)
                        all_urls.extend(urls)
                        print(f"[IMAP] Extracted {len(urls)} job URLs from: {subject}")

                    # Mark as seen
                    mail.store(email_id, "+FLAGS", "\\Seen")

                except Exception as e:
                    print(f"[IMAP] Error processing email {email_id}: {e}")
                    continue

            mail.logout()

        except Exception as e:
            print(f"[IMAP] Connection error: {e}")

        # Deduplicate
        return list(dict.fromkeys(all_urls))

    async def run_forever(self) -> None:
        """Async polling loop — runs indefinitely as a background task."""
        print(f"[IMAP] Starting ingestion service, polling every {self.poll_interval}s")
        while True:
            try:
                loop = asyncio.get_event_loop()
                urls = await loop.run_in_executor(None, self.fetch_job_urls)

                if urls:
                    print(f"[IMAP] Dispatching {len(urls)} URLs to scraper queue")
                    # Import here to avoid circular dep
                    from worker import scrape_url_task
                    for url in urls:
                        scrape_url_task.delay(url, source="email-alert")  # type: ignore

            except Exception as e:
                print(f"[IMAP] Poll cycle error: {e}")

            await asyncio.sleep(self.poll_interval)
