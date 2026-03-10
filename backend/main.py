"""MetFin Backend — FastAPI entry point."""
from pathlib import Path
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

load_dotenv(Path(__file__).resolve().parent.parent / ".env")

from core.routers import investments, banking, crypto, dashboard, wellness, insights, scenarios, auth, debt, advisor, private, profile

app = FastAPI(
    title="MetFin API",
    description="Personal financial planning API — public investments, bank deposits & digital assets",
    version="1.0.0",
)

# CORS — allow frontend dev server and Vercel deployments
app.add_middleware(
    CORSMiddleware,
    # IMPORTANT: Browsers reject `allow_credentials=True` with wildcard origins.
    # Use explicit dev origins + a regex for Vercel preview/prod deployments.
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register all routers
app.include_router(auth.router)
app.include_router(profile.router)
app.include_router(dashboard.router)
app.include_router(investments.router)
app.include_router(banking.router)
app.include_router(crypto.router)
app.include_router(private.router)
app.include_router(debt.router)
app.include_router(wellness.router)
app.include_router(insights.router)
app.include_router(scenarios.router)
app.include_router(advisor.router)


@app.get("/")
def root():
    return {
        "name": "MetFin API",
        "version": "1.0.0",
        "docs": "/docs",
        "endpoints": [
            "GET  /api/dashboard",
            "GET  /api/investments",
            "GET  /api/investments/{id}",
            "GET  /api/banking",
            "GET  /api/banking/{id}",
            "GET  /api/crypto",
            "GET  /api/crypto/{id}",
            "GET  /api/wellness",
            "GET  /api/insights",
            "GET  /api/scenarios",
            "POST /api/scenarios/{id}",
        ],
    }
