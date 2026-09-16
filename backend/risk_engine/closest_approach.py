"""
Closest Approach Engine
========================
Computes the minimum 3-D Euclidean separation between a satellite and
each debris object over a discrete simulation time window.

Approach:
    d(t) = || r_sat(t) − r_deb(t) ||₂
    d_min = min(d(t))   → closest approach distance
    t_CA  = argmin d(t) → time of closest approach

Relative velocity at closest approach is estimated by finite difference
of the separation vector.
"""
import numpy as np
from dataclasses import dataclass
from typing import Tuple

from orbital_engine.propagator import OrbitalObject, propagate_orbit


@dataclass
class ClosestApproachResult:
    object_id: str
    name: str
    min_distance_km: float
    time_of_ca_s: float           # seconds from sim start
    relative_velocity_km_s: float
    satellite_pos_at_ca: Tuple[float, float, float]
    debris_pos_at_ca: Tuple[float, float, float]
    separation_timeseries: list   # List[float] — subsampled for API efficiency


def compute_closest_approach(
    satellite: OrbitalObject,
    debris: OrbitalObject,
    time_array_s: np.ndarray,
    subsample_n: int = 500,
) -> ClosestApproachResult:
    """
    Propagate satellite and debris over *time_array_s* and find the minimum
    separation.

    Parameters
    ----------
    satellite     : primary satellite OrbitalObject
    debris        : debris OrbitalObject
    time_array_s  : 1-D time array in seconds
    subsample_n   : number of timeseries points returned (for API payload)

    Returns
    -------
    ClosestApproachResult
    """
    # ── Propagate both orbits ───────────────────────────────────────────
    sat_pos = propagate_orbit(satellite, time_array_s)    # (N, 3)
    deb_pos = propagate_orbit(debris, time_array_s)       # (N, 3)

    # ── Euclidean separation vector ─────────────────────────────────────
    diff = sat_pos - deb_pos                              # (N, 3)
    distances = np.linalg.norm(diff, axis=1)             # (N,)

    # ── Minimum separation ──────────────────────────────────────────────
    idx_min = int(np.argmin(distances))
    d_min = float(distances[idx_min])
    t_ca = float(time_array_s[idx_min])

    # ── Relative velocity at closest approach (finite difference) ───────
    if idx_min > 0:
        dt = float(time_array_s[idx_min] - time_array_s[idx_min - 1])
        sat_vel = (sat_pos[idx_min] - sat_pos[idx_min - 1]) / dt   # km/s
        deb_vel = (deb_pos[idx_min] - deb_pos[idx_min - 1]) / dt   # km/s
        rel_vel = float(np.linalg.norm(sat_vel - deb_vel))
    else:
        # Use orbital speed difference as fallback
        rel_vel = abs(satellite.orbital_velocity_km_s - debris.orbital_velocity_km_s)

    # ── Subsample timeseries for payload efficiency ─────────────────────
    if len(distances) > subsample_n:
        indices = np.linspace(0, len(distances) - 1, subsample_n, dtype=int)
        sub_times = time_array_s[indices].tolist()
        sub_dist = distances[indices].tolist()
    else:
        sub_times = time_array_s.tolist()
        sub_dist = distances.tolist()

    separation_ts = [{"t": t, "d": d} for t, d in zip(sub_times, sub_dist)]

    return ClosestApproachResult(
        object_id=debris.object_id,
        name=debris.name,
        min_distance_km=d_min,
        time_of_ca_s=t_ca,
        relative_velocity_km_s=rel_vel,
        satellite_pos_at_ca=tuple(sat_pos[idx_min].tolist()),
        debris_pos_at_ca=tuple(deb_pos[idx_min].tolist()),
        separation_timeseries=separation_ts,
    )
