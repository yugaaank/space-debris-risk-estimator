"""
Simulation Orchestrator
=======================
Coordinates the full simulation pipeline:
    OrbitalObject → Propagation → ClosestApproach → RiskScore → Results
"""
import uuid
import numpy as np
from datetime import datetime
from typing import List

from orbital_engine.propagator import OrbitalObject, generate_orbit_path
from risk_engine.closest_approach import compute_closest_approach
from risk_engine.risk_scorer import score_approach, rank_risks
from api.schemas import (
    SimulationRequest, SimulationResult, SimulationStats, ObjectInfo, OrbitPath,
    RiskEntry, TimeseriesPoint
)

DISCLAIMER = (
    "APPROXIMATE MODEL: Results are generated using simplified circular/"
    "Keplerian orbital propagation and configurable heuristic risk thresholds. "
    "Outputs are for demonstration and research purposes only and are NOT "
    "intended for operational collision avoidance."
)


def _to_orbital_object(inp) -> OrbitalObject:
    return OrbitalObject(
        object_id=inp.object_id,
        name=inp.name,
        altitude_km=inp.altitude_km,
        inclination_deg=inp.inclination_deg,
        phase_deg=inp.phase_deg,
        raan_deg=inp.raan_deg,
        eccentricity=inp.eccentricity,
        object_type=inp.object_type,
    )


def _to_object_info(obj: OrbitalObject) -> ObjectInfo:
    return ObjectInfo(
        object_id=obj.object_id,
        name=obj.name,
        object_type=obj.object_type,
        altitude_km=obj.altitude_km,
        inclination_deg=obj.inclination_deg,
        phase_deg=obj.phase_deg,
        raan_deg=obj.raan_deg,
        radius_km=round(obj.radius_km, 3),
        period_min=round(obj.period_min, 3),
        angular_velocity_deg_s=round(np.degrees(obj.angular_velocity_rad_s), 6),
        orbital_velocity_km_s=round(obj.orbital_velocity_km_s, 4),
    )


def _seconds_to_label(s: float) -> str:
    h = int(s // 3600)
    m = int((s % 3600) // 60)
    sec = int(s % 60)
    return f"{h:02d}:{m:02d}:{sec:02d}"


def run_simulation(request: SimulationRequest) -> SimulationResult:
    sim_id = str(uuid.uuid4())[:8]
    cfg = request.config

    # ── Build time array ───────────────────────────────────────────────────
    window_s = cfg.window_hours * 3600.0
    dt_s = cfg.timestep_seconds
    # Cap at 50,000 points for performance
    n_steps = min(int(window_s / dt_s) + 1, 50_000)
    time_array = np.linspace(0.0, window_s, n_steps)

    # ── Convert inputs ─────────────────────────────────────────────────────
    satellite = _to_orbital_object(request.satellite)
    debris_list = [_to_orbital_object(d) for d in request.debris_objects]

    # ── Compute orbit paths (closed loops for visualization) ───────────────
    orbit_paths = []
    # Satellite path
    sat_path = generate_orbit_path(satellite, n_points=500)
    orbit_paths.append(OrbitPath(
        object_id=satellite.object_id,
        points=sat_path.tolist()
    ))
    # Debris paths
    for deb in debris_list:
        deb_path = generate_orbit_path(deb, n_points=360)
        orbit_paths.append(OrbitPath(
            object_id=deb.object_id,
            points=deb_path.tolist()
        ))

    # ── Closest approach & risk scoring ────────────────────────────────────
    risk_scored = []
    for deb in debris_list:
        ca = compute_closest_approach(satellite, deb, time_array)
        scored = score_approach(
            object_id=ca.object_id,
            name=ca.name,
            min_distance_km=ca.min_distance_km,
            time_of_ca_s=ca.time_of_ca_s,
            relative_velocity_km_s=ca.relative_velocity_km_s,
            sim_duration_s=window_s,
        )
        scored["satellite_pos_at_ca"] = list(ca.satellite_pos_at_ca)
        scored["debris_pos_at_ca"] = list(ca.debris_pos_at_ca)
        scored["separation_timeseries"] = ca.separation_timeseries
        risk_scored.append(scored)

    ranked = rank_risks(risk_scored)

    # ── Build RiskEntry list ───────────────────────────────────────────────
    risk_entries = []
    for r in ranked:
        risk_entries.append(RiskEntry(
            rank=r["rank"],
            object_id=r["object_id"],
            name=r["name"],
            risk_level=r["risk_level"],
            risk_score=r["risk_score"],
            min_distance_km=round(r["min_distance_km"], 4),
            time_of_ca_s=r["time_of_ca_s"],
            tca_label=_seconds_to_label(r["time_of_ca_s"]),
            relative_velocity_km_s=round(r["relative_velocity_km_s"], 4),
            dist_score=r["dist_score"],
            vel_score=r["vel_score"],
            time_score=r["time_score"],
            explanation=r["explanation"],
            satellite_pos_at_ca=r["satellite_pos_at_ca"],
            debris_pos_at_ca=r["debris_pos_at_ca"],
            separation_timeseries=[
                TimeseriesPoint(t=pt["t"], d=pt["d"])
                for pt in r["separation_timeseries"]
            ],
        ))

    # ── Stats ──────────────────────────────────────────────────────────────
    risk_levels = [e.risk_level for e in risk_entries]
    stats = {
        "total_objects": len(debris_list),
        "critical_count": risk_levels.count("CRITICAL"),
        "high_count": risk_levels.count("HIGH"),
        "moderate_count": risk_levels.count("MODERATE"),
        "low_count": risk_levels.count("LOW"),
        "closest_approach_km": round(risk_entries[0].min_distance_km, 4) if risk_entries else None,
        "highest_risk_object": risk_entries[0].object_id if risk_entries else None,
        "next_critical_s": next(
            (e.time_of_ca_s for e in risk_entries if e.risk_level in ("CRITICAL", "HIGH")),
            None
        ),
        "simulation_window_h": cfg.window_hours,
        "timestep_s": cfg.timestep_seconds,
        "n_timesteps": n_steps,
        "generated_at": datetime.utcnow().isoformat() + "Z",
    }

    return SimulationResult(
        simulation_id=sim_id,
        satellite=_to_object_info(satellite),
        debris_objects=[_to_object_info(d) for d in debris_list],
        risk_results=risk_entries,
        orbit_paths=orbit_paths,
        stats=SimulationStats(**stats),
        config={"window_hours": cfg.window_hours, "timestep_seconds": cfg.timestep_seconds},
        disclaimer=DISCLAIMER,
    )
