# Routes

## Router Configuration
- **File**: `src/App.tsx` (React Router v7, config-based routing)

| Path | Component | Description |
|------|-----------|-------------|
| `/` | `LandingPage` | Landing page with 3D Earth scene, hero section, feature pills, CTA buttons |
| `/simulation` | `SimulationPage` | 3D orbital visualization with control panel, playback controls, object selection |
| `/risk` | `RiskAnalysisPage` | Risk analysis dashboard with KPIs, charts, risk table, configuration tabs |
| `/objects` | `ObjectsPage` | Orbital object catalogue with search, filters, sortable table, add/import |
| `/methodology` | `MethodologyPage` | Engineering white paper with math formulas, risk scoring docs, disclaimers |

## Route Details

### `/` — LandingPage
- Full-screen 3D Earth background (Three.js Canvas)
- Gradient overlays for text readability
- System status pills (operational, hackathon badge, RSO count)
- Title "ORBITAL SHIELD" with gradient text
- Feature pills (Keplerian Propagation, 3D Visualization, Risk Scoring, etc.)
- "Launch Simulation" and "Methodology" CTA buttons
- Last simulation stats panel (if available)
- System status overlay (bottom-right floating dock)

### `/simulation` — SimulationPage
- Left sidebar (280px): playback controls, speed selector, scenario loading, view toggles, selected object info
- Main area: 3D orbital scene (Three.js) with HUD overlay
- Loading/error/empty state overlays
- CSV export functionality

### `/risk` — RiskAnalysisPage
- KPI cards row (5 metrics)
- Tabbed interface: Overview (charts), Table (risk ranking), Configure (satellite params, sim config, CSV upload)
- Risk distribution chart, approach timeline, distance graph
- Auto-loads demo simulation on mount

### `/objects` — ObjectsPage
- Quick KPI stats (4 cards)
- Search bar with type/altitude/sort filters
- Full data table with all orbital parameters
- Add Object modal, CSV upload drawer
- Actions: Track in 3D, Set as Primary satellite

### `/methodology` — MethodologyPage
- Static content page with glass-panel sections
- Mathematical formulas for orbital mechanics
- Risk scoring formula breakdown (distance, velocity, time weights)
- Threshold table for risk levels
- Operational limitations & disclaimers
- Navigation links to Simulation and Risk pages
