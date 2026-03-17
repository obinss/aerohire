"""Auth router — register & login."""
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, EmailStr
from prisma import Prisma

from auth_utils import create_access_token, hash_password, verify_password

router = APIRouter()


class RegisterBody(BaseModel):
    email: EmailStr
    password: str


class LoginBody(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


@router.post("/register", response_model=TokenResponse, status_code=201)
async def register(body: RegisterBody):
    db = Prisma()
    await db.connect()
    try:
        existing = await db.user.find_unique(where={"email": body.email})
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Email already registered",
            )
        user = await db.user.create(
            data={"email": body.email, "passwordHash": hash_password(body.password)}
        )
        # Create empty profile
        await db.profile.create(data={"userId": user.id})
        token = create_access_token(subject=user.id)
        return TokenResponse(access_token=token)
    finally:
        await db.disconnect()


@router.post("/login", response_model=TokenResponse)
async def login(body: LoginBody):
    db = Prisma()
    await db.connect()
    try:
        user = await db.user.find_unique(where={"email": body.email})
        if not user or not user.passwordHash:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials",
            )
        if not verify_password(body.password, user.passwordHash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials",
            )
        token = create_access_token(subject=user.id)
        return TokenResponse(access_token=token)
    finally:
        await db.disconnect()

class OAuthBody(BaseModel):
    email: EmailStr
    provider: str
    provider_id: str

@router.post("/oauth", response_model=TokenResponse)
async def oauth_login(body: OAuthBody):
    db = Prisma()
    await db.connect()
    try:
        user = await db.user.find_unique(where={"email": body.email})
        if not user:
            # Create user
            data = {"email": body.email}
            if body.provider == "google":
                data["googleId"] = body.provider_id
            elif body.provider == "apple":
                data["appleId"] = body.provider_id
                
            user = await db.user.create(data=data)
            await db.profile.create(data={"userId": user.id})
        else:
            # If user exists, but logs in with OAuth, we could link the provider ID here
            # For brevity, we just issue the token if the emails match.
            update_data = {}
            if body.provider == "google" and not user.googleId:
                update_data["googleId"] = body.provider_id
            elif body.provider == "apple" and not user.appleId:
                update_data["appleId"] = body.provider_id
                
            if update_data:
                user = await db.user.update(where={"id": user.id}, data=update_data)
                
        token = create_access_token(subject=user.id)
        return TokenResponse(access_token=token)
    finally:
        await db.disconnect()
