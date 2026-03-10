"""MetFin Backend — FastAPI entry point."""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.routers import investments, banking, crypto, dashboard, wellness, insights, scenarios

app = FastAPI(
    title="MetFin API",
    description="Personal financial planning API — public investments, bank deposits & digital assets",
    version="1.0.0",
)

# CORS — allow frontend dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register all routers
app.include_router(dashboard.router)
app.include_router(investments.router)
app.include_router(banking.router)
app.include_router(crypto.router)
app.include_router(wellness.router)
app.include_router(insights.router)
app.include_router(scenarios.router)


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
