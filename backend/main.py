"""
ORBITAL SHIELD — FastAPI Application Entry Point
================================================
Space Debris Collision Risk Estimator
Department of Space / ISRO Hackathon

Run with:
    uvicorn main:app --reload --port 8000
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.routes import router

app = FastAPI(
    title="Orbital Shield — Space Debris Collision Risk Estimator",
    description=(
        "Approximate orbital simulation platform for identifying satellite–debris "
        "close approaches. Uses simplified circular/Keplerian orbital propagation. "
        "NOT intended for operational collision avoidance."
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# ── CORS — allow frontend dev server ─────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # Restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Mount API routes ──────────────────────────────────────────────────────────
app.include_router(router, prefix="/api")


@app.get("/")
async def root():
    return {
        "application": "Orbital Shield",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/api/health",
        "disclaimer": (
            "Approximate simulation — simplified circular/Keplerian orbital model. "
            "Not intended for operational collision avoidance."
        ),
    }
