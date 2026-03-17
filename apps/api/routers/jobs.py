"""Jobs router."""
from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, Query
from prisma import Prisma

from auth_utils import get_current_user_id

router = APIRouter()


@router.get("", response_model=List[Dict[str, Any]])
async def list_jobs(
    page: int = Query(1, ge=1),
    limit: int = Query(20, le=100),
    _user_id: str = Depends(get_current_user_id),
):
    db = Prisma()
    await db.connect()
    try:
        jobs = await db.job.find_many(
            skip=(page - 1) * limit,
            take=limit,
            order={"createdAt": "desc"},
        )
        return [j.dict() for j in jobs]
    finally:
        await db.disconnect()


@router.get("/{job_id}", response_model=Dict[str, Any])
async def get_job(
    job_id: str,
    _user_id: str = Depends(get_current_user_id),
):
    db = Prisma()
    await db.connect()
    try:
        job = await db.job.find_unique(where={"id": job_id})
        if not job:
            from fastapi import HTTPException
            raise HTTPException(status_code=404, detail="Job not found")
        return job.dict()
    finally:
        await db.disconnect()
