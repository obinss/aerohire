"""Documents router."""
from typing import Any, Dict, List
from fastapi import APIRouter, Depends, HTTPException, Query
from prisma import Prisma

from auth_utils import get_current_user_id

router = APIRouter()


@router.get("/{document_id}", response_model=Dict[str, Any])
async def get_document(
    document_id: str,
    user_id: str = Depends(get_current_user_id),
):
    db = Prisma()
    await db.connect()
    try:
        doc = await db.document.find_unique(
            where={"id": document_id},
            include={"application": True},
        )
        if not doc:
            raise HTTPException(status_code=404, detail="Document not found")
        # Auth check — ensure document belongs to requesting user
        if doc.application and doc.application.userId != user_id:
            raise HTTPException(status_code=403, detail="Access denied")
        return doc.dict()
    finally:
        await db.disconnect()


@router.get("", response_model=List[Dict[str, Any]])
async def list_documents_for_application(
    application_id: str = Query(..., description="Filter by application ID"),
    user_id: str = Depends(get_current_user_id),
):
    db = Prisma()
    await db.connect()
    try:
        # Verify application ownership
        app = await db.application.find_first(
            where={"id": application_id, "userId": user_id}
        )
        if not app:
            raise HTTPException(status_code=404, detail="Application not found")

        docs = await db.document.find_many(
            where={"applicationId": application_id},
            order={"createdAt": "desc"},
        )
        return [d.dict() for d in docs]
    finally:
        await db.disconnect()
