"""
Rule-Based Risk Scorer
=======================
Implements a transparent, explainable risk classification system.

IMPORTANT: This is a demonstration risk classification based on configurable
approximate thresholds. It does NOT represent official ISRO/NASA operational
conjunction assessment thresholds.

Risk Score Formula
------------------
The final score (0–100) is a composite of three normalized sub-scores:

    S_dist  = distance sub-score      (weight: 0.60)
    S_vel   = velocity sub-score      (weight: 0.25)
    S_time  = time-proximity sub-score (weight: 0.15)

    total_score = 100 × (0.60×S_dist + 0.25×S_vel + 0.15×S_time)

Distance sub-score (inverse logistic):
    S_dist = 1 / (1 + exp((d_min - D_REF) / D_SCALE))

    where D_REF  = 100 km  (reference transition distance)
          D_SCALE = 50 km  (logistic steepness)

Velocity sub-score (logistic):
    S_vel = 1 / (1 + exp(-(v_rel - V_REF) / V_SCALE))

    where V_REF  = 5.0 km/s
          V_SCALE = 2.5 km/s

Time-proximity sub-score:
    S_time = 1 - (t_CA / T_MAX)   (clamped to [0, 1])

Risk Categories (demo thresholds):
    CRITICAL  : score ≥ 85
    HIGH      : 60 ≤ score < 85
    MODERATE  : 30 ≤ score < 60
    LOW       : score < 30
"""
import math
from dataclasses import dataclass
from typing import List

# ── Scoring constants ────────────────────────────────────────────────────────
D_REF    = 100.0   # km — logistic centre for distance sub-score
D_SCALE  =  50.0   # km — logistic steepness
V_REF    =   5.0   # km/s
V_SCALE  =   2.5   # km/s
W_DIST   =   0.60
W_VEL    =   0.25
W_TIME   =   0.15

# ── Risk category thresholds ─────────────────────────────────────────────────
THRESHOLDS = {"CRITICAL": 85, "HIGH": 60, "MODERATE": 30, "LOW": 0}


@dataclass
class RiskResult:
    object_id: str
    name: str
    rank: int
    risk_level: str
    risk_score: float
    min_distance_km: float
    time_of_ca_s: float
    relative_velocity_km_s: float
    dist_score: float
    vel_score: float
    time_score: float
    explanation: str


def _logistic(x: float, centre: float, scale: float) -> float:
    """Standard logistic sigmoid."""
    return 1.0 / (1.0 + math.exp((x - centre) / scale))


def _time_score(t_ca_s: float, sim_duration_s: float) -> float:
    """Earlier TCA → higher urgency score."""
    if sim_duration_s <= 0:
        return 0.5
    return max(0.0, 1.0 - t_ca_s / sim_duration_s)


def score_approach(
    object_id: str,
    name: str,
    min_distance_km: float,
    time_of_ca_s: float,
    relative_velocity_km_s: float,
    sim_duration_s: float,
) -> dict:
    """
    Compute an explainable risk score for a single closest-approach event.

    Returns a dict containing all sub-scores, total score, risk level,
    and a human-readable explanation.
    """
    # ── Sub-scores ────────────────────────────────────────────────────────
    s_dist = _logistic(min_distance_km, D_REF, D_SCALE)      # 0→1 (high = risky)
    s_vel  = _logistic(-relative_velocity_km_s, -V_REF, V_SCALE)  # 0→1 (high = risky)
    s_time = _time_score(time_of_ca_s, sim_duration_s)

    # ── Composite score (0–100) ───────────────────────────────────────────
    composite = W_DIST * s_dist + W_VEL * s_vel + W_TIME * s_time
    total_score = round(composite * 100.0, 1)
    total_score = max(0.0, min(100.0, total_score))

    # ── Category ──────────────────────────────────────────────────────────
    if total_score >= THRESHOLDS["CRITICAL"]:
        level = "CRITICAL"
    elif total_score >= THRESHOLDS["HIGH"]:
        level = "HIGH"
    elif total_score >= THRESHOLDS["MODERATE"]:
        level = "MODERATE"
    else:
        level = "LOW"

    # ── Human-readable explanation ────────────────────────────────────────
    tca_hr  = int(time_of_ca_s // 3600)
    tca_min = int((time_of_ca_s % 3600) // 60)
    tca_sec = int(time_of_ca_s % 60)

    explanation = (
        f"Risk Score: {total_score}/100 ({level})\n"
        f"• Distance sub-score: {s_dist:.3f} (weight {int(W_DIST*100)}%) "
        f"— Closest approach {min_distance_km:.2f} km "
        f"[{'below' if min_distance_km < D_REF else 'above'} {D_REF} km reference]\n"
        f"• Velocity sub-score: {s_vel:.3f} (weight {int(W_VEL*100)}%) "
        f"— Relative velocity {relative_velocity_km_s:.2f} km/s\n"
        f"• Time sub-score: {s_time:.3f} (weight {int(W_TIME*100)}%) "
        f"— TCA at {tca_hr:02d}h{tca_min:02d}m{tca_sec:02d}s into simulation\n"
        f"Formula: 100×(0.60×S_dist + 0.25×S_vel + 0.15×S_time)\n"
        f"Demo classification — NOT an operational ISRO/NASA threshold."
    )

    return {
        "object_id": object_id,
        "name": name,
        "risk_level": level,
        "risk_score": total_score,
        "min_distance_km": min_distance_km,
        "time_of_ca_s": time_of_ca_s,
        "relative_velocity_km_s": relative_velocity_km_s,
        "dist_score": round(s_dist, 4),
        "vel_score": round(s_vel, 4),
        "time_score": round(s_time, 4),
        "explanation": explanation,
    }


def rank_risks(scored_list: list) -> list:
    """Sort by risk_score descending and assign rank."""
    ranked = sorted(scored_list, key=lambda x: x["risk_score"], reverse=True)
    for i, item in enumerate(ranked):
        item["rank"] = i + 1
    return ranked
