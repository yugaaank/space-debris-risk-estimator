# Space Debris Collision Risk Estimator

**Department of Space — ISRO Hackathon 2026**  
*Project Name: Orbital Shield*

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?logo=fastapi)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/Frontend-React%2019-61DAFB?logo=react)](https://react.dev)
[![Three.js](https://img.shields.io/badge/3D-Three.js%20%2F%20R3F-black?logo=three.js)](https://threejs.org)
[![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind%20CSS%20v4-38B2AC?logo=tailwind-css)](https://tailwindcss.com)
[![TypeScript](https://img.shields.io/badge/Language-TypeScript-3178C6?logo=typescript)](https://www.typescriptlang.org)
[![Python](https://img.shields.io/badge/Language-Python%203.10%2B-3776AB?logo=python)](https://python.org)

---

## Problem Statement

With the rapid expansion of megaconstellations and legacy space debris in Low Earth Orbit (LEO), orbital congestion poses severe collision hazards. Satellite operators need a fast, explainable, and accessible screening tool to flag close approaches between an operational spacecraft and resident space objects (RSOs) without requiring the massive compute clusters needed for full numerical perturbation modeling.

---

## Solution

**Orbital Shield** is a high-performance full-stack web platform for rapid satellite–debris conjunction screening and 3D visualization. It couples vectorized analytical Keplerian orbital propagation with sub-step parabolic interpolation to pinpoint the Time of Closest Approach (TCA), calculate minimum separation, and assign an explainable multi-factor heuristic risk score ($0\text{--}100$) across configurable forward-time windows.

---

## Key Features

- 🌍 **Photorealistic 3D Earth & Atmosphere**: High-resolution NASA satellite surface textures, 3D normal relief map, specular ocean reflections, independent cloud weather layer, nocturnal city lights, and Rayleigh scattering Fresnel glow.
- ⏱️ **Interactive Time Scrubber & Controls**: Forward/backward temporal scrubber across configurable horizons ($1\text{h}\text{--}168\text{h}$) with $1\times, 10\times, 100\times, 1000\times$ speed multipliers.
- 🚨 **Real-Time Dynamic Conjunction Line**: High-visibility 3D conjunction line connecting the satellite to its closest threat, pulsing red when critical thresholds are breached.
- 📊 **Telemetry HUD**: Real-time heads-up display showing satellite velocity, altitude, tracked object counts, and peak encounter metrics.
- 📈 **Separation Distance Graph**: Interactive Recharts plot showing distance vs. time for any selected object with explicit TCA markers.
- 🍩 **Risk Distribution Breakdown**: Donut chart classifying conjunctions into CRITICAL, HIGH, MODERATE, and LOW risk categories.
- 📋 **Sortable Risk Ranking Table**: Interactive table with sorting by rank, distance, relative velocity, and score, featuring expandable plain-English explanation rationales.
- 🛰️ **Orbital Object Catalogue**: Filterable registry by altitude regime (LEO, MEO, GEO) and object type, with support for promoting any debris object to primary satellite.
- 📤 **Custom Debris CSV Upload & Report Export**: Ingest custom CSV files with schema validation; export full risk assessment reports in CSV format.
- 📖 **Built-in Engineering White Paper**: Mathematical methodology page documenting all physics formulas, coordinate frames, and scoring logic.

---

## System Architecture

```
┌───────────────────────────────────────────────────────────────────────────┐
│                          ORBITAL SHIELD ARCHITECTURE                      │
└───────────────────────────────────────────────────────────────────────────┘

   ┌─────────────────────────────────────────────────────────────────────┐
   │                     REACT 19 + THREE.JS FRONTEND                    │
   │                                                                     │
   │  ┌───────────────┐  ┌──────────────────┐  ┌──────────────────────┐  │
   │  │ 3D Orbit View │  │ Real-Time Scrubber│ │ Live HUD Telemetry   │  │
   │  │ (R3F + Drei)  │  │ & Playback Speed │  │ & Risk Overlays      │  │
   │  └───────┬───────┘  └────────┬─────────┘  └──────────┬───────────┘  │
   │          │                   │                       │              │
   │  ┌───────┴───────────────────┴───────────────────────┴───────────┐  │
   │  │                   Zustand State Store                         │  │
   │  │   (Simulation Results, Time Progress, Selected Target)         │  │
   │  └───────────────────────────────┬───────────────────────────────┘  │
   └──────────────────────────────────┼──────────────────────────────────┘
                                      │ REST API / Axios
                                      ▼
   ┌─────────────────────────────────────────────────────────────────────┐
   │                         FASTAPI BACKEND                             │
   │                                                                     │
   │  ┌──────────────────────┐  ┌─────────────────────────────────────┐  │
   │  │   Orbital Engine     │  │            Risk Engine              │  │
   │  │                      │  │                                     │  │
   │  │ • Keplerian Motion   │  │ • Discrete Conjunction Search       │  │
   │  │ • Perifocal to ECI   │  │ • Sub-Step TCA Parabolic Refinement │  │
   │  │ • 3D Rotation Matrix │  │ • Multi-Component Risk Scoring (0-100)│ │
   │  └──────────┬───────────┘  └──────────────────┬──────────────────┘  │
   │             │                                 │                     │
   │  ┌──────────┴─────────────────────────────────┴──────────────────┐  │
   │  │                    Simulation Orchestrator                    │  │
   │  │      (Vectorized NumPy Pipeline, In-Memory LRU Cache)         │  │
   │  └───────────────────────────────┬───────────────────────────────┘  │
   └──────────────────────────────────┼──────────────────────────────────┘
                                      │
                                      ▼
   ┌─────────────────────────────────────────────────────────────────────┐
   │                          DATA LAYER                                 │
   │  • data/sample_debris.csv (50 curated synthetic objects)            │
   │  • data/sample_debris.json                                          │
   │  • User CSV Upload Parser & Schema Validator                        │
   └─────────────────────────────────────────────────────────────────────┘
```

---

## Technology Stack

- **Backend**: Python 3.10+, FastAPI, NumPy, Pandas, Pydantic v2, Uvicorn
- **Frontend**: React 19, TypeScript, Vite, Three.js, React Three Fiber (R3F), Drei, Zustand, Tailwind CSS v4, Recharts, Axios
- **Data & Textures**: NASA Blue Marble 2K surface map, topography normal map, specular ocean mask, cloud layer, and city night lights

---

## Orbital Propagation Method

Orbital Shield uses analytical two-body Keplerian circular orbit propagation:
- **Standard Gravitational Parameter**: $\mu = 398,600.4418 \text{ km}^3/\text{s}^2$
- **Earth Radius**: $R_E = 6,378.137 \text{ km}$
- **Orbital Radius**: $r = R_E + h$
- **Mean Motion (Angular Velocity)**:
  $$\omega = \sqrt{\frac{\mu}{r^3}} \quad (\text{rad/s})$$
- **Orbital Period**:
  $$T = 2\pi\sqrt{\frac{r^3}{\mu}} \quad (\text{seconds})$$
- **Perifocal to Earth-Centered Inertial (ECI) Transformation**:
  At elapsed time $t$, true anomaly is $\theta(t) = \theta_0 + \omega \cdot t$. In the perifocal orbital frame:
  $$x_{\text{orb}} = r \cos(\theta(t)), \quad y_{\text{orb}} = r \sin(\theta(t)), \quad z_{\text{orb}} = 0$$
  Transforming to ECI coordinates via inclination $i$ and Right Ascension of Ascending Node (RAAN) $\Omega$:
  $$\begin{bmatrix} X \\ Y \\ Z \end{bmatrix} = \begin{bmatrix} \cos\Omega & -\sin\Omega\cos i & \sin\Omega\sin i \\ \sin\Omega & \cos\Omega\cos i & -\sin\Omega\sin i \\ 0 & \sin i & \cos i \end{bmatrix} \begin{bmatrix} x_{\text{orb}} \\ y_{\text{orb}} \\ 0 \end{bmatrix}$$

---

## Closest Approach Calculation

1. **Discrete Coarse Sweep**: The satellite and debris position vectors are computed at uniform timesteps ($\Delta t$, default $60\text{ s}$) over the configured horizon:
   $$d(t_k) = \|\vec{r}_{\text{sat}}(t_k) - \vec{r}_{\text{deb}}(t_k)\|$$
2. **Local Minima Identification**: Identifies bracket points where $d(t_k) < d(t_{k-1})$ and $d(t_k) < d(t_{k+1})$.
3. **Sub-Step Parabolic Refinement**: Constructs a 3-point quadratic polynomial through $(t_{k-1}, d_{k-1})$, $(t_k, d_k)$, and $(t_{k+1}, d_{k+1})$ to compute sub-second Time of Closest Approach (TCA) and true minimum separation $d_{\min}$.
4. **Relative Velocity at Conjunction**:
   $$\vec{v}_{\text{rel}} = \vec{v}_{\text{sat}}(t_{\text{TCA}}) - \vec{v}_{\text{deb}}(t_{\text{TCA}})$$

---

## Risk Scoring Methodology

Because covariance matrices are not part of approximate circular propagation, a weighted multi-factor heuristic risk score ($S \in [0, 100]$) is computed:

$$S = 0.55 \cdot S_{\text{dist}} + 0.25 \cdot S_{\text{vel}} + 0.20 \cdot S_{\text{time}}$$

- **Distance Factor ($55\%$)**:
  - $d_{\min} \le 5\text{ km} \rightarrow 100\text{ pts}$
  - $5\text{ km} < d_{\min} \le 20\text{ km} \rightarrow 70\text{--}99\text{ pts}$
  - $20\text{ km} < d_{\min} \le 50\text{ km} \rightarrow 40\text{--}69\text{ pts}$
  - $50\text{ km} < d_{\min} \le 100\text{ km} \rightarrow 10\text{--}39\text{ pts}$
  - $d_{\min} > 100\text{ km} \rightarrow 0\text{ pts}$
- **Relative Velocity Factor ($25\%$)**:
  Scales with kinetic energy potential ($E_k \propto v_{\text{rel}}^2$):
  - $>12\text{ km/s} \rightarrow 100\text{ pts}$ (head-on conjunction)
  - $8\text{--}12\text{ km/s} \rightarrow 75\text{ pts}$
  - $4\text{--}8\text{ km/s} \rightarrow 50\text{ pts}$
  - $<4\text{ km/s} \rightarrow 25\text{ pts}$ (co-orbital)
- **Time Urgency Factor ($20\%$)**:
  Warning time remaining until encounter:
  - $<2\text{ h} \rightarrow 100\text{ pts}$ (immediate action required)
  - $2\text{--}6\text{ h} \rightarrow 75\text{ pts}$
  - $6\text{--}12\text{ h} \rightarrow 50\text{ pts}$
  - $>12\text{ h} \rightarrow 25\text{ pts}$

### Risk Classification Thresholds
- **CRITICAL**: Score $\ge 75$ or $d_{\min} \le 5\text{ km}$
- **HIGH**: $50 \le \text{Score} < 75$ or $5\text{ km} < d_{\min} \le 20\text{ km}$
- **MODERATE**: $25 \le \text{Score} < 50$ or $20\text{ km} < d_{\min} \le 50\text{ km}$
- **LOW**: $\text{Score} < 25$ ($d_{\min} > 50\text{ km}$)

---

## Dataset

- Curated synthetic benchmark dataset of **50 debris objects** representing real-world orbital fragmentation events, derelict rocket stages, and payload debris:
  - `data/sample_debris.csv`: Structured CSV with columns `object_id, name, altitude_km, inclination_deg, period_min, phase_deg, raan_deg, eccentricity, type, notes`
  - `data/sample_debris.json`: Validated JSON equivalent
- High-risk encounters intentionally engineered (e.g., Breeze-M fragment, Cosmos-1408, Iridium-33) to exercise critical conjunction alerting.

---

## API

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/health` | GET | Operational health, engine status, and tracked RSO count |
| `/api/objects` | GET | Returns all tracked debris objects from the catalogue |
| `/api/simulate/demo` | POST | Executes the 50-object demonstration simulation scenario |
| `/api/simulate` | POST | Runs propagation and risk analysis on custom satellite & debris payload |
| `/api/simulation/{id}` | GET | Fetches cached simulation results by ID |
| `/api/risk-analysis` | POST | Runs simulation and returns concise risk ranking summary |
| `/api/upload-debris` | POST | Validates and parses uploaded user CSV files |

---

## Installation

### Prerequisites
- Python 3.10+
- Node.js 18+ and npm

### 1. Clone & Set Up Backend
```powershell
cd backend
pip install -r requirements.txt
```

### 2. Set Up Frontend
```powershell
cd ../frontend
npm install
```

---

## Running Locally

### 1. Launch FastAPI Backend Server
```powershell
cd backend
python -m uvicorn main:app --reload --host 127.0.0.1 --port 8000
```
Swagger UI Documentation: `http://127.0.0.1:8000/docs`

### 2. Launch Vite Frontend Server
```powershell
cd frontend
npm run dev
```
Open your browser at: `http://localhost:5173`

---

## Demo

1. Open `http://localhost:5173` and click **"🚀 Launch Simulation"**.
2. Observe the photorealistic 3D Earth, 50 orbiting debris objects, and primary satellite `SAT-001`.
3. Click **"▶ Play"** to watch the orbital progression and dynamic approach line.
4. Navigate to **Risk Analysis** to inspect the KPI cards, donut chart, distance graph, and sortable risk ranking table.
5. Visit **Objects** to search, filter by LEO/MEO/GEO, or upload your own CSV file.
6. Review the **Methodology** page for in-depth mathematical formulations.

---

## Limitations

> **CRITICAL DISCLAIMER FOR HACKATHON EVALUATORS:**  
> This application implements a simplified, approximate screening model. It is designed for demonstration and rapid identification of potential close approaches and is **NOT** intended for operational satellite collision avoidance.

Specifically, the current model does **not** include:
- **Atmospheric Drag**: Variable thermospheric density deceleration (NRLMSISE-00 / JB2008 models).
- **Earth Geopotential Harmonics**: $J_2, J_3, J_4$ oblateness causing nodal precession and apsidal drift.
- **Third-Body Gravitational Perturbations**: Lunar and solar gravitational pull.
- **Solar Radiation Pressure (SRP)**: Solar photon flux and variable spacecraft area-to-mass ratios.
- **Covariance Propagation & Probability of Collision ($P_c$)**: Foster-1992 3D error ellipsoid integration.
- **High-Fidelity SGP4/SDP4 TLE Modeling**: Full analytical general perturbations.
- **Automated Maneuver Planning**: Delta-V ($\Delta v$) optimal thruster burn trajectory synthesis.

---

## Future Enhancements

1. **SGP4 / TLE Ingestion**: Direct integration with Space-Track.org and CelesTrak live Two-Line Element feeds.
2. **Numerical Perturbation Integrator**: Cowell integration incorporating $J_2\text{--}J_4$ gravity and Harris-Priester atmospheric drag.
3. **Formal $P_c$ Calculation**: Integration of position covariance ellipsoids into Foster/Akella collision probability computation.
4. **Collision Avoidance Maneuver Optimization**: Automated recommendation of impulsive $\Delta v$ maneuvers to achieve safe miss distance with minimal fuel expenditure.
5. **Multi-Satellite Constellation Screening**: Simultaneous all-on-all screening across entire satellite constellations.
