"""Application settings using Pydantic BaseSettings."""
from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    # App
    DEBUG: bool = True
    ALLOWED_HOSTS: List[str] = ["*"]
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:3000", 
        "http://localhost:3001", 
        "http://localhost:3002", 
        "http://127.0.0.1:3000", 
        "http://127.0.0.1:3001", 
        "http://127.0.0.1:3002",
        "http://localhost:8081",
        "http://127.0.0.1:8081",
        "https://aerohire.app"
    ]

    # Database
    DATABASE_URL: str = "postgresql://aerohire:secret@localhost:5432/aerohire"

    # Auth
    JWT_SECRET: str = "change-me-in-production"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_MINUTES: int = 10080  # 7 days

    # OpenAI
    OPENAI_API_KEY: str = ""

    # AWS S3
    AWS_ACCESS_KEY_ID: str = ""
    AWS_SECRET_ACCESS_KEY: str = ""
    AWS_S3_BUCKET: str = "aerohire-documents"
    AWS_REGION: str = "eu-west-1"

    # Redis / Celery
    REDIS_URL: str = "redis://localhost:6379/0"

    # IMAP
    IMAP_HOST: str = "imap.gmail.com"
    IMAP_PORT: int = 993
    IMAP_USER: str = ""
    IMAP_PASSWORD: str = ""

    # Resend
    RESEND_API_KEY: str = ""

    class Config:
        env_file = "../../.env"
        extra = "ignore"


settings = Settings()
