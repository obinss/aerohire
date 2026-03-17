"""
Playwright-based job board scraper.

Features:
- Randomized delays (1–4s) to avoid detection
- Rotating user agents across a pool of realistic browser strings
- Extracts job listings from LinkedIn-style board HTML
- Feeds parsed jobs to the Celery queue for persistence
"""
import asyncio
import json
import random
import re
from datetime import datetime
from typing import Any, Dict, List, Optional
from urllib.parse import urljoin, urlparse

from playwright.async_api import async_playwright, BrowserContext, Page

# ── User Agent Pool ───────────────────────────────────────────────────────

USER_AGENTS = [
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_2_1) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.2 Safari/605.1.15",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0",
]

VIEWPORT_SIZES = [
    {"width": 1920, "height": 1080},
    {"width": 1440, "height": 900},
    {"width": 1536, "height": 864},
    {"width": 2560, "height": 1440},
]

# ── Delay Utilities ───────────────────────────────────────────────────────

async def human_delay(min_s: float = 1.0, max_s: float = 4.0) -> None:
    """Simulate human-like navigation delay."""
    delay = random.uniform(min_s, max_s)
    await asyncio.sleep(delay)


async def micro_delay() -> None:
    """Short delay between micro-interactions (clicking, scrolling)."""
    await asyncio.sleep(random.uniform(0.2, 0.8))


# ── Browser Context Factory ───────────────────────────────────────────────

async def create_browser_context(playwright_instance) -> tuple:
    """Create a fresh browser context with randomised fingerprint."""
    ua = random.choice(USER_AGENTS)
    viewport = random.choice(VIEWPORT_SIZES)

    browser = await playwright_instance.chromium.launch(
        headless=True,
        args=[
            "--no-sandbox",
            "--disable-blink-features=AutomationControlled",
            "--disable-infobars",
        ],
    )

    context = await browser.new_context(
        user_agent=ua,
        viewport=viewport,
        locale="en-GB",
        timezone_id="Europe/London",
        java_script_enabled=True,
        extra_http_headers={
            "Accept-Language": "en-GB,en;q=0.9",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        },
    )

    # Mask webdriver property
    await context.add_init_script("""
        Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
        Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3, 4, 5] });
    """)

    return browser, context


# ── Scrape a Single Job Board URL ─────────────────────────────────────────

async def scrape_job_board(url: str, source: str = "web") -> List[Dict[str, Any]]:
    """
    Navigate to a job board URL and extract job listings.

    Returns a list of job dicts with keys:
    title, company, description, url, source, postedDate
    """
    jobs: List[Dict[str, Any]] = []

    async with async_playwright() as pw:
        browser, context = await create_browser_context(pw)
        page: Page = await context.new_page()

        try:
            print(f"[Scraper] Navigating to {url}")
            await page.goto(url, wait_until="domcontentloaded", timeout=30_000)
            await human_delay(2.0, 4.0)

            # Scroll to trigger lazy loading
            for _ in range(3):
                await page.mouse.wheel(0, random.randint(400, 800))
                await micro_delay()

            # Extract job cards (generic selectors — adapt per board)
            html_content = await page.content()
            jobs = _parse_job_html(html_content, base_url=url, source=source)

        except Exception as e:
            print(f"[Scraper] Error scraping {url}: {e}")
        finally:
            await browser.close()

    return jobs


def _parse_job_html(html: str, base_url: str, source: str) -> List[Dict[str, Any]]:
    """
    Parse job listings from HTML using BeautifulSoup.
    Generic selectors — customise per job board.
    """
    from bs4 import BeautifulSoup

    soup = BeautifulSoup(html, "lxml")
    jobs = []

    # Generic job card selectors (LinkedIn-style)
    card_selectors = [
        "li.jobs-search-results__list-item",
        "div.job-search-card",
        "[data-job-id]",
        "article.job-card",
    ]

    cards = []
    for selector in card_selectors:
        cards = soup.select(selector)
        if cards:
            break

    for card in cards[:20]:  # Limit per page
        title_el = card.select_one("h3, h2, .job-card-list__title, [data-tracking-control-name]")
        company_el = card.select_one(".job-card-container__primary-description, .company-name, h4")
        link_el = card.select_one("a[href]")
        date_el = card.select_one("time, .job-search-card__listdate")

        if not title_el or not link_el:
            continue

        href = link_el.get("href", "")
        if href.startswith("/"):
            parsed = urlparse(base_url)
            href = f"{parsed.scheme}://{parsed.netloc}{href}"

        posted_date = None
        if date_el and date_el.get("datetime"):
            try:
                posted_date = datetime.fromisoformat(date_el["datetime"].replace("Z", "+00:00"))
            except ValueError:
                pass

        jobs.append({
            "title": title_el.get_text(strip=True),
            "company": company_el.get_text(strip=True) if company_el else "Unknown",
            "description": "",  # Full description fetched separately
            "url": href,
            "source": source,
            "postedDate": posted_date.isoformat() if posted_date else None,
            "requiredQualifications": None,
        })

    return jobs


# ── Full Description Scraper ──────────────────────────────────────────────

async def scrape_job_description(job_url: str) -> str:
    """Scrape the full job description from an individual job listing page."""
    async with async_playwright() as pw:
        browser, context = await create_browser_context(pw)
        page = await context.new_page()
        try:
            await page.goto(job_url, wait_until="domcontentloaded", timeout=30_000)
            await human_delay(1.5, 3.0)

            description_selectors = [
                ".job-view-layout",
                ".description__text",
                "#job-details",
                "[data-automation-id='jobPostingDescription']",
                "article",
            ]

            for selector in description_selectors:
                el = await page.query_selector(selector)
                if el:
                    return await el.inner_text()

            # Fallback: full body text
            return await page.inner_text("body")
        except Exception as e:
            return f"[Scraper error: {e}]"
        finally:
            await browser.close()
