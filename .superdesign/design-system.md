# Orbital Shield — Design System

## Product Context
Space debris collision risk estimator built for ISRO Hackathon 2026. A rapid, explainable orbital simulation platform that ingests orbital parameters, propagates trajectories using circular Keplerian mechanics, detects close approaches, and ranks conjunction risk on a 0-100 scale.

## Key Pages
- **Landing** (`/`): 3D Earth hero, feature pills, CTA buttons, system status overlay
- **3D Simulation** (`/simulation`): Three.js orbital scene with control sidebar, playback, view toggles
- **Risk Analysis** (`/risk`): KPI dashboard, charts, risk ranking table, configuration tabs
- **Objects Catalogue** (`/objects`): Searchable/filterable table of tracked orbital objects
- **Methodology** (`/methodology`): Engineering white paper with formulas and disclaimers

## Brand & Visual Identity
- **Name**: Orbital Shield
- **Tagline**: Space Debris Collision Risk Estimator
- **Context**: ISRO Hackathon 2026, Dept. of Space
- **Tone**: Aerospace mission control, technical but accessible, urgent (risk-focused)

## Color Palette
- **Backgrounds**: `#020813` (space), `#010610` (deep), `rgba(6,14,30,0.82)` (panels)
- **Primary Accent**: `#38bdf8` (sky blue) — used for active states, borders, glows
- **Secondary Accent**: `#06b6d4` (cyan), `#14b8a6` (teal)
- **Text**: `#e2e8f0` (primary), `#94a3b8` (secondary), `#475569` (dim)
- **Risk Colors**: `#ff2244` (critical), `#ff8800` (high), `#ffd700` (moderate), `#00e87b` (low)
- **Borders**: `rgba(56,189,248,0.12)` (subtle), `rgba(56,189,248,0.35)` (active)

## Typography
- **Display/HUD**: Orbitron — uppercase, wide tracking, for titles and KPI values
- **Body/Labels**: Exo 2 — clean sans-serif for body text and descriptions
- **Mono/Data**: JetBrains Mono — all data values, labels, codes, technical readouts
- All loaded from Google Fonts

## Spacing & Layout
- **Nav height**: 56px (h-14), fixed top
- **Sidebar width**: 288px (w-72) on simulation page
- **Border radius**: 14px (panels), 9999px (pills/buttons), 12px (mission panels), 10px (inputs)
- **Panel padding**: 1rem default

## Component Patterns
- **Glass panels**: Multi-layer gradient backgrounds with `backdrop-filter: blur(24px) saturate(190%)`, inset highlights, and top border glow line
- **Buttons**: Pill-shaped (9999px radius), glass backgrounds, uppercase mono text, glow on hover
- **Status dots**: 6px circles with colored box-shadows and pulse animations
- **KPI cards**: Left border accent (4px), glass background, Orbitron values, animated number counters
- **Section labels**: 0.68rem mono, uppercase, 0.15em tracking, blue dot prefix
- **Corner brackets**: 8px borders on pseudo-elements for aerospace accents

## Motion
- **Transitions**: `cubic-bezier(0.16, 1, 0.3, 1)` — snappy ease-out
- **Page transitions**: Framer Motion fade/slide (AnimatePresence)
- **Loading**: Orbital ring spin (20s CW, 30s CCW), pulse animations, progress bars
- **Hover**: `translateY(-2px)` lift on panels, `scale(1.02)` on buttons

## Risk-Level Visual Language
- CRITICAL: Red glow, pulsing border, `animate-critical-pulse`
- HIGH: Orange, static glow
- MODERATE: Amber/Yellow
- LOW: Emerald/Green

## Data Visualization
- **Charts**: Recharts library, dark theme matching glass panels
- **Risk bars**: 4px height, rounded, colored fill with `box-shadow: 0 0 8px currentColor`
- **Timeline**: Approach timeline with risk-colored markers

## Disclaimers
All pages include: "APPROXIMATE MODEL — Simplified Keplerian propagation. Not intended for operational collision avoidance."
