"""Applications router — Kanban pipeline management."""
from typing import Any, Dict, List
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from prisma import Prisma

from auth_utils import get_current_user_id

router = APIRouter()


class CreateApplicationBody(BaseModel):
    job_id: str


class UpdateStatusBody(BaseModel):
    status: str  # validated against enum values


VALID_STATUSES = {"Saved", "Auto_Applied", "Interviewing", "Rejected", "Offer"}


@router.get("", response_model=List[Dict[str, Any]])
async def list_applications(user_id: str = Depends(get_current_user_id)):
    db = Prisma()
    await db.connect()
    try:
        apps = await db.application.find_many(
            where={"userId": user_id},
            include={"job": True},
            order={"createdAt": "desc"},
        )
        return [
            {
                "id": a.id,
                "jobId": a.jobId,
                "status": a.status,
                "matchScore": a.matchScore,
                "appliedDate": a.appliedDate.isoformat() if a.appliedDate else None,
                "createdAt": a.createdAt.isoformat(),
                "job": a.job.dict() if a.job else None,
            }
            for a in apps
        ]
    finally:
        await db.disconnect()


@router.post("", status_code=201)
async def create_application(
    body: CreateApplicationBody,
    user_id: str = Depends(get_current_user_id),
):
    db = Prisma()
    await db.connect()
    try:
        # Check job exists
        job = await db.job.find_unique(where={"id": body.job_id})
        if not job:
            raise HTTPException(status_code=404, detail="Job not found")

        # Prevent duplicates
        existing = await db.application.find_first(
            where={"userId": user_id, "jobId": body.job_id}
        )
        if existing:
            raise HTTPException(status_code=409, detail="Application already exists")

        app = await db.application.create(
            data={"userId": user_id, "jobId": body.job_id, "status": "Saved"}
        )
        return app.dict()
    finally:
        await db.disconnect()


@router.patch("/{application_id}/status")
async def update_status(
    application_id: str,
    body: UpdateStatusBody,
    user_id: str = Depends(get_current_user_id),
):
    if body.status not in VALID_STATUSES:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Invalid status. Must be one of: {VALID_STATUSES}",
        )
    db = Prisma()
    await db.connect()
    try:
        app = await db.application.find_first(
            where={"id": application_id, "userId": user_id}
        )
        if not app:
            raise HTTPException(status_code=404, detail="Application not found")

        updated = await db.application.update(
            where={"id": application_id},
            data={"status": body.status},  # type: ignore[arg-type]
        )
        return updated.dict()
    finally:
        await db.disconnect()
