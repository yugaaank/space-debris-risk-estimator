"""
Pydantic Schemas — Request / Response Models
"""
from __future__ import annotations
from pydantic import BaseModel, Field, field_validator
from typing import List, Optional, Dict, Any, Union


# ── Input Models ─────────────────────────────────────────────────────────────

class OrbitalObjectInput(BaseModel):
    object_id: str
    name: str
    altitude_km: float = Field(..., gt=0, lt=100_000, description="Altitude above Earth surface (km)")
    inclination_deg: float = Field(..., ge=0, le=180)
    phase_deg: float = Field(0.0, ge=0, lt=360)
    raan_deg: float = Field(0.0, ge=0, lt=360)
    eccentricity: float = Field(0.0, ge=0, lt=1)
    object_type: str = "DEBRIS"
    period_min: Optional[float] = None   # If provided, validated against calculated

    @field_validator("altitude_km")
    @classmethod
    def altitude_must_be_positive(cls, v: float) -> float:
        if v <= 0:
            raise ValueError("Altitude must be positive")
        return v


class SimulationConfig(BaseModel):
    window_hours: float = Field(24.0, gt=0, le=168, description="Simulation time window (hours)")
    timestep_seconds: float = Field(60.0, gt=1, le=3600, description="Timestep (seconds)")

    @field_validator("timestep_seconds")
    @classmethod
    def reasonable_timestep(cls, v: float) -> float:
        if v < 1:
            raise ValueError("Timestep must be at least 1 second")
        return v


class SimulationRequest(BaseModel):
    satellite: OrbitalObjectInput
    debris_objects: List[OrbitalObjectInput] = Field(..., min_length=1)
    config: SimulationConfig = SimulationConfig()


# ── Output Models ─────────────────────────────────────────────────────────────

class TimeseriesPoint(BaseModel):
    t: float   # seconds
    d: float   # km


class RiskEntry(BaseModel):
    rank: int
    object_id: str
    name: str
    risk_level: str
    risk_score: float
    min_distance_km: float
    time_of_ca_s: float
    tca_label: str              # Human-friendly "HH:MM:SS"
    relative_velocity_km_s: float
    dist_score: float
    vel_score: float
    time_score: float
    explanation: str
    satellite_pos_at_ca: List[float]
    debris_pos_at_ca: List[float]
    separation_timeseries: List[TimeseriesPoint]


class ObjectInfo(BaseModel):
    object_id: str
    name: str
    object_type: str
    altitude_km: float
    inclination_deg: float
    phase_deg: float
    raan_deg: float
    radius_km: float
    period_min: float
    angular_velocity_deg_s: float
    orbital_velocity_km_s: float


class OrbitPath(BaseModel):
    object_id: str
    points: List[List[float]]   # List of [x, y, z]


class SimulationStats(BaseModel):
    total_objects: int
    critical_count: int
    high_count: int
    moderate_count: int
    low_count: int
    closest_approach_km: Optional[float] = None
    highest_risk_object: Optional[str] = None
    next_critical_s: Optional[float] = None
    simulation_window_h: float
    timestep_s: float
    n_timesteps: int
    generated_at: str


class SimulationResult(BaseModel):
    simulation_id: str
    satellite: ObjectInfo
    debris_objects: List[ObjectInfo]
    risk_results: List[RiskEntry]
    orbit_paths: List[OrbitPath]
    stats: Union[SimulationStats, Dict[str, Any]]
    config: Dict[str, Any]
    disclaimer: str


class HealthResponse(BaseModel):
    status: str
    orbital_engine: str
    risk_engine: str
    tracked_objects: int
    version: str
