"""
AeroHire FastAPI Application — Entry Point
"""
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware

from routers import auth, users, jobs, applications, documents, ai, scraper
from config import settings


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup / shutdown lifecycle."""
    print("🚀 AeroHire API starting up…")
    yield
    print("✈️  AeroHire API shutting down…")


app = FastAPI(
    title="AeroHire API",
    description="Executive career intelligence platform — REST API",
    version="1.0.0",
    docs_url="/docs" if settings.DEBUG else None,
    redoc_url="/redoc" if settings.DEBUG else None,
    lifespan=lifespan,
)

# ── Middleware ────────────────────────────────────────────────────────────

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

if not settings.DEBUG:
    app.add_middleware(
        TrustedHostMiddleware,
        allowed_hosts=settings.ALLOWED_HOSTS,
    )

# ── Routers ───────────────────────────────────────────────────────────────

app.include_router(auth.router, prefix="/auth", tags=["Authentication"])
app.include_router(users.router, prefix="/users", tags=["Users"])
app.include_router(jobs.router, prefix="/jobs", tags=["Jobs"])
app.include_router(applications.router, prefix="/applications", tags=["Applications"])
app.include_router(documents.router, prefix="/documents", tags=["Documents"])
app.include_router(ai.router, prefix="/ai", tags=["AI"])
app.include_router(scraper.router, prefix="/scraper", tags=["Scraper"])


@app.get("/health", tags=["System"])
async def health_check():
    return {"status": "operational", "service": "AeroHire API", "version": "1.0.0"}
