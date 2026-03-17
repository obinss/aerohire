"""AI router — CV parsing, cover letter generation, and match scoring."""
from typing import Any, Dict
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from prisma import Prisma

from auth_utils import get_current_user_id
from services.llm_pipeline import parse_cv_text, generate_cover_letter_markdown
from services.match_scorer import compute_match_score

router = APIRouter()


# ── CV Parsing ────────────────────────────────────────────────────────────

class ParseCVBody(BaseModel):
    cv_text: str


@router.post("/parse-cv")
async def parse_cv(
    body: ParseCVBody,
    user_id: str = Depends(get_current_user_id),
) -> Dict[str, Any]:
    if not body.cv_text.strip():
        raise HTTPException(status_code=422, detail="cv_text cannot be empty")

    result = await parse_cv_text(body.cv_text)

    # Persist to user profile
    db = Prisma()
    await db.connect()
    try:
        await db.profile.upsert(
            where={"userId": user_id},
            data={
                "create": {
                    "userId": user_id,
                    "baseResumeText": body.cv_text,
                    "parsedSkills": result.get("skills", []),
                    "experienceYears": result.get("experience_years"),
                },
                "update": {
                    "baseResumeText": body.cv_text,
                    "parsedSkills": result.get("skills", []),
                    "experienceYears": result.get("experience_years"),
                },
            },
        )
    finally:
        await db.disconnect()

    return result


# ── Cover Letter Generation ───────────────────────────────────────────────

class GenerateCoverLetterBody(BaseModel):
    application_id: str


@router.post("/generate-cover-letter")
async def generate_cover_letter(
    body: GenerateCoverLetterBody,
    user_id: str = Depends(get_current_user_id),
) -> Dict[str, Any]:
    db = Prisma()
    await db.connect()
    try:
        app = await db.application.find_first(
            where={"id": body.application_id, "userId": user_id},
            include={"job": True},
        )
        if not app:
            raise HTTPException(status_code=404, detail="Application not found")

        profile = await db.profile.find_unique(where={"userId": user_id})
        if not profile or not profile.baseResumeText:
            raise HTTPException(
                status_code=422,
                detail="Please upload your CV before generating documents",
            )

        content_md = await generate_cover_letter_markdown(
            job_title=app.job.title,
            company=app.job.company,
            job_description=app.job.description,
            resume_text=profile.baseResumeText,
        )

        # Persist document
        doc = await db.document.create(
            data={
                "applicationId": body.application_id,
                "type": "Cover_Letter",
                "contentMarkdown": content_md,
            }
        )
        return {"document_id": doc.id, "content_markdown": content_md}
    finally:
        await db.disconnect()


# ── Match Scoring ─────────────────────────────────────────────────────────

class MatchScoreBody(BaseModel):
    job_id: str


@router.post("/match-score")
async def match_score(
    body: MatchScoreBody,
    user_id: str = Depends(get_current_user_id),
) -> Dict[str, Any]:
    db = Prisma()
    await db.connect()
    try:
        job = await db.job.find_unique(where={"id": body.job_id})
        if not job:
            raise HTTPException(status_code=404, detail="Job not found")

        profile = await db.profile.find_unique(where={"userId": user_id})
        if not profile or not profile.baseResumeText:
            raise HTTPException(status_code=422, detail="Upload your CV first")

        score, explanation = await compute_match_score(
            resume_text=profile.baseResumeText,
            job_description=job.description,
        )

        # Update application record if one exists
        existing_app = await db.application.find_first(
            where={"userId": user_id, "jobId": body.job_id}
        )
        if existing_app:
            await db.application.update(
                where={"id": existing_app.id},
                data={"matchScore": score},
            )

        return {"score": round(score * 100, 1), "explanation": explanation}
    finally:
        await db.disconnect()
