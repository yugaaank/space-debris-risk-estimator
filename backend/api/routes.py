"""
FastAPI Route Definitions
"""
import io
import csv
import json
from typing import List, Optional
from fastapi import APIRouter, HTTPException, UploadFile, File, Query

from api.schemas import (
    SimulationRequest, SimulationResult, HealthResponse,
    OrbitalObjectInput, SimulationConfig
)
from simulation.simulator import run_simulation, DISCLAIMER

router = APIRouter()

# ── In-memory simulation cache (last 10 results) ──────────────────────────────
_sim_cache: dict = {}
_DEMO_OBJECTS: Optional[list] = None


def _get_demo_objects() -> list:
    """Load sample_debris.csv into a list of OrbitalObjectInput."""
    global _DEMO_OBJECTS
    if _DEMO_OBJECTS is not None:
        return _DEMO_OBJECTS

    import os
    csv_path = os.path.join(os.path.dirname(__file__), "..", "..", "data", "sample_debris.csv")
    csv_path = os.path.abspath(csv_path)

    objects = []
    with open(csv_path, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            if row.get("type", "").upper() == "SATELLITE":
                continue   # satellite handled separately
            try:
                objects.append(OrbitalObjectInput(
                    object_id=row["object_id"],
                    name=row["name"],
                    altitude_km=float(row["altitude_km"]),
                    inclination_deg=float(row["inclination_deg"]),
                    phase_deg=float(row.get("phase_deg", 0)),
                    raan_deg=float(row.get("raan_deg", 0)),
                    eccentricity=float(row.get("eccentricity", 0)),
                    object_type="DEBRIS",
                ))
            except Exception:
                continue   # skip malformed rows

    _DEMO_OBJECTS = objects
    return _DEMO_OBJECTS


# ── Health ────────────────────────────────────────────────────────────────────

@router.get("/health", response_model=HealthResponse)
async def health():
    demo = _get_demo_objects()
    return HealthResponse(
        status="operational",
        orbital_engine="online",
        risk_engine="online",
        tracked_objects=len(demo),
        version="1.0.0",
    )


# ── Objects ───────────────────────────────────────────────────────────────────

@router.get("/objects")
async def get_objects():
    """Return all demo debris objects."""
    demo = _get_demo_objects()
    return {"objects": [obj.model_dump() for obj in demo], "count": len(demo)}


# ── Simulate ──────────────────────────────────────────────────────────────────

@router.post("/simulate", response_model=SimulationResult)
async def simulate(request: SimulationRequest):
    """Run full orbital simulation and risk analysis."""
    if not request.debris_objects:
        raise HTTPException(status_code=400, detail="At least one debris object required")

    try:
        result = run_simulation(request)
        # Cache result
        _sim_cache[result.simulation_id] = result
        if len(_sim_cache) > 10:
            oldest = next(iter(_sim_cache))
            del _sim_cache[oldest]
        return result
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Simulation failed: {str(e)}")


# ── Demo Simulation ───────────────────────────────────────────────────────────

@router.post("/simulate/demo", response_model=SimulationResult)
async def simulate_demo(window_hours: float = 24.0, timestep_seconds: float = 60.0):
    """Run the default demo scenario immediately."""
    satellite = OrbitalObjectInput(
        object_id="SAT-001",
        name="SATELLITE-ALPHA",
        altitude_km=550.0,
        inclination_deg=51.6,
        phase_deg=0.0,
        raan_deg=0.0,
        eccentricity=0.0,
        object_type="SATELLITE",
    )
    debris = _get_demo_objects()
    config = SimulationConfig(
        window_hours=min(max(window_hours, 1.0), 168.0),
        timestep_seconds=min(max(timestep_seconds, 10.0), 3600.0),
    )
    request = SimulationRequest(satellite=satellite, debris_objects=debris, config=config)
    return await simulate(request)


# ── Get Simulation By ID ──────────────────────────────────────────────────────

@router.get("/simulation/{sim_id}", response_model=SimulationResult)
async def get_simulation(sim_id: str):
    if sim_id not in _sim_cache:
        raise HTTPException(status_code=404, detail="Simulation not found")
    return _sim_cache[sim_id]


# ── Risk Analysis (standalone) ────────────────────────────────────────────────

@router.post("/risk-analysis")
async def risk_analysis(request: SimulationRequest):
    """Alias for /simulate that returns only risk results."""
    result = await simulate(request)
    return {
        "simulation_id": result.simulation_id,
        "risk_results": result.risk_results,
        "stats": result.stats,
        "disclaimer": DISCLAIMER,
    }


# ── CSV Upload ────────────────────────────────────────────────────────────────

@router.post("/upload-debris")
async def upload_debris(file: UploadFile = File(...)):
    """Parse an uploaded CSV of debris objects. Returns validated object list."""
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files accepted")

    content = await file.read()
    try:
        text = content.decode("utf-8")
    except UnicodeDecodeError:
        raise HTTPException(status_code=400, detail="File must be UTF-8 encoded")

    reader = csv.DictReader(io.StringIO(text))
    required = {"object_id", "name", "altitude_km", "inclination_deg"}
    if not required.issubset(set(reader.fieldnames or [])):
        raise HTTPException(
            status_code=422,
            detail=f"CSV must contain columns: {required}. Found: {reader.fieldnames}"
        )

    objects = []
    errors = []
    for i, row in enumerate(reader, start=2):
        try:
            obj = OrbitalObjectInput(
                object_id=row["object_id"],
                name=row["name"],
                altitude_km=float(row["altitude_km"]),
                inclination_deg=float(row["inclination_deg"]),
                phase_deg=float(row.get("phase_deg", 0) or 0),
                raan_deg=float(row.get("raan_deg", 0) or 0),
                eccentricity=float(row.get("eccentricity", 0) or 0),
                object_type=row.get("type", "DEBRIS").upper(),
            )
            objects.append(obj.model_dump())
        except Exception as e:
            errors.append({"row": i, "error": str(e)})

    return {
        "parsed": len(objects),
        "errors": errors,
        "objects": objects,
    }
