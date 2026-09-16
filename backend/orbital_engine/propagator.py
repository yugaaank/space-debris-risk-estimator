"""
Keplerian Orbital Propagator
============================
Implements simplified circular/Keplerian orbit propagation.
All calculations use Earth-Centered Inertial (ECI) coordinates.

Constants:
    MU   : Earth's standard gravitational parameter (km³/s²)
    R_E  : Earth's mean radius (km)
"""
import numpy as np
from dataclasses import dataclass, field
from typing import Optional

# ── Physical Constants ──────────────────────────────────────────────────────
MU = 398_600.4418   # km³/s²  — Earth's gravitational parameter
R_E = 6_371.0       # km      — Earth's mean radius


@dataclass
class OrbitalObject:
    """Represents any orbiting object (satellite or debris)."""
    object_id: str
    name: str
    altitude_km: float
    inclination_deg: float
    phase_deg: float = 0.0
    raan_deg: float = 0.0
    eccentricity: float = 0.0   # Reserved; simplified model uses 0
    object_type: str = "DEBRIS"

    # ── Derived quantities (auto-computed) ───────────────────────────────
    @property
    def radius_km(self) -> float:
        """Orbital radius from Earth centre (km)."""
        return R_E + self.altitude_km

    @property
    def angular_velocity_rad_s(self) -> float:
        """Mean motion ω = √(μ/r³) (rad/s)."""
        return np.sqrt(MU / self.radius_km ** 3)

    @property
    def period_s(self) -> float:
        """Orbital period T = 2π/ω (s)."""
        return 2.0 * np.pi / self.angular_velocity_rad_s

    @property
    def period_min(self) -> float:
        """Orbital period in minutes."""
        return self.period_s / 60.0

    @property
    def orbital_velocity_km_s(self) -> float:
        """Circular orbital speed v = √(μ/r) (km/s)."""
        return np.sqrt(MU / self.radius_km)


def propagate_orbit(
    obj: OrbitalObject,
    time_array_s: np.ndarray,
) -> np.ndarray:
    """
    Propagate a circular Keplerian orbit and return ECI position vectors.

    Algorithm
    ---------
    1. True anomaly θ(t) = θ₀ + ω·t
    2. Orbital-plane position (perifocal frame):
           x' = r·cos(θ)
           y' = r·sin(θ)
           z' = 0
    3. Apply inclination rotation (Rx by i) then RAAN rotation (Rz by Ω)
       to transform into ECI:
           [x]   [Rz(Ω)] · [Rx(i)] · [x']
           [y] =                         [y']
           [z]                            [z']

    Parameters
    ----------
    obj          : OrbitalObject containing orbital elements
    time_array_s : 1-D array of simulation times [seconds]

    Returns
    -------
    positions : ndarray of shape (N, 3) in km (ECI)
    """
    r = obj.radius_km
    omega = obj.angular_velocity_rad_s
    theta_0 = np.deg2rad(obj.phase_deg)
    inc = np.deg2rad(obj.inclination_deg)
    raan = np.deg2rad(obj.raan_deg)

    # True anomaly at each timestep
    theta = theta_0 + omega * time_array_s   # shape (N,)

    # Perifocal (orbital-plane) coordinates
    x_peri = r * np.cos(theta)              # shape (N,)
    y_peri = r * np.sin(theta)              # shape (N,)
    z_peri = np.zeros_like(theta)

    # ── Rotation 1: inclination about x-axis ────────────────────────────
    # Rx(i) applied to perifocal vector
    x_inc = x_peri
    y_inc = y_peri * np.cos(inc) - z_peri * np.sin(inc)
    z_inc = y_peri * np.sin(inc) + z_peri * np.cos(inc)

    # ── Rotation 2: RAAN about z-axis ───────────────────────────────────
    # Rz(Ω) applied to inclination-rotated vector
    x_eci = x_inc * np.cos(raan) - y_inc * np.sin(raan)
    y_eci = x_inc * np.sin(raan) + y_inc * np.cos(raan)
    z_eci = z_inc

    # Stack into (N, 3) array
    return np.column_stack([x_eci, y_eci, z_eci])


def generate_orbit_path(obj: OrbitalObject, n_points: int = 360) -> np.ndarray:
    """
    Generate one complete orbit as a closed 3D polyline.

    Returns
    -------
    path : ndarray of shape (n_points, 3) in km (ECI)
    """
    # One full period sampled evenly
    t = np.linspace(0.0, obj.period_s, n_points, endpoint=False)
    return propagate_orbit(obj, t)
