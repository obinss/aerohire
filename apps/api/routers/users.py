"""Users router — profile management."""
from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from prisma import Prisma

from auth_utils import get_current_user_id

router = APIRouter()


class ProfileUpdate(BaseModel):
    base_resume_text: Optional[str] = None
    experience_years: Optional[int] = None
    target_roles: Optional[List[str]] = None
    parsed_skills: Optional[List[str]] = None


@router.get("/me")
async def get_me(user_id: str = Depends(get_current_user_id)) -> Dict[str, Any]:
    db = Prisma()
    await db.connect()
    try:
        user = await db.user.find_unique(
            where={"id": user_id},
            include={"profile": True},
        )
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        return {
            "id": user.id,
            "email": user.email,
            "subscriptionTier": user.subscriptionTier,
            "profile": {
                "baseResumeText": user.profile.baseResumeText if user.profile else None,
                "parsedSkills": user.profile.parsedSkills if user.profile else None,
                "experienceYears": user.profile.experienceYears if user.profile else None,
                "targetRoles": user.profile.targetRoles if user.profile else [],
            },
        }
    finally:
        await db.disconnect()


@router.put("/me/profile")
async def update_profile(
    body: ProfileUpdate,
    user_id: str = Depends(get_current_user_id),
) -> Dict[str, Any]:
    db = Prisma()
    await db.connect()
    try:
        update_data: Dict[str, Any] = {}
        if body.base_resume_text is not None:
            update_data["baseResumeText"] = body.base_resume_text
        if body.experience_years is not None:
            update_data["experienceYears"] = body.experience_years
        if body.target_roles is not None:
            update_data["targetRoles"] = body.target_roles
        if body.parsed_skills is not None:
            update_data["parsedSkills"] = body.parsed_skills

        profile = await db.profile.upsert(
            where={"userId": user_id},
            data={
                "create": {"userId": user_id, **update_data},
                "update": update_data,
            },
        )
        return {"success": True, "profile": profile.dict()}
    finally:
        await db.disconnect()
