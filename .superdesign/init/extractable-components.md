# Extractable Components

## Layout Components

### Navbar
- **Source**: `src/components/layout/Navbar.tsx`
- **Category**: layout
- **Description**: Fixed top navigation with logo, glass-morphism pill nav links, mission clock, simulation status indicator, and system status popover
- **Extractable props**: N/A (reads `location` and `useSimulationStore` internally)
- **Hardcoded**: NAV_LINKS array (5 routes), Orbitron font, glass gradient styles, `⊕` logo symbol

### LoadingScreen
- **Source**: `src/components/layout/LoadingScreen.tsx`
- **Category**: layout
- **Description**: Full-screen animated boot sequence with step indicators, progress bar, and orbital ring decorations
- **Extractable props**: `onComplete: () => void`
- **Hardcoded**: 4 loading steps, corner brackets, Orbital Shield branding, v1.0.0 disclaimer

### SystemStatusCompact
- **Source**: `src/components/layout/SystemStatus.tsx`
- **Category**: layout
- **Description**: Compact status dot + label for navbar (online/offline/waking/checking)
- **Extractable props**: none (uses internal singleton state)
- **Hardcoded**: status colors, dot classes, "ONLINE"/"OFFLINE"/"WAKING" labels

### SystemStatusPanel
- **Source**: `src/components/layout/SystemStatus.tsx`
- **Category**: layout
- **Description**: Full status panel popover showing backend API, orbital engine, risk engine, tracked objects
- **Extractable props**: none (uses internal singleton state)
- **Hardcoded**: mission-panel styling, status labels, retry button

## Basic Components

### RiskBadge
- **Source**: `src/components/risk/RiskBadge.tsx`
- **Category**: basic
- **Description**: Colored pill badge for CRITICAL/HIGH/MODERATE/LOW risk levels with animated dot and glow
- **Extractable props**: `level: RiskLevel`, `score?: number`, `size?: 'sm'|'md'|'lg'`, `showScore?: boolean`
- **Hardcoded**: 4 color schemes with bg/text/border/glow/dot classes

### KpiCard
- **Source**: `src/components/dashboard/KpiCards.tsx`
- **Category**: basic
- **Description**: Single KPI tile with animated number, accent color bar, icon, and subtitle
- **Extractable props**: `label`, `value`, `displayValue?`, `sub?`, `accent?: 'blue'|'red'|'orange'|'green'|'purple'|'teal'`, `icon?`, `decimals?`, `suffix?`, `alert?`
- **Hardcoded**: 6 accent color schemes, Orbitron font family

### RiskTable
- **Source**: `src/components/risk/RiskTable.tsx`
- **Category**: basic
- **Description**: Sortable/filterable risk ranking table with inline explanation expansion
- **Extractable props**: `results: RiskEntry[]`
- **Hardcoded**: 5 filter buttons (ALL/CRITICAL/HIGH/MODERATE/LOW), sort keys, glass-panel styling

### SatelliteForm
- **Source**: `src/components/forms/SatelliteForm.tsx`
- **Category**: basic
- **Description**: Form for satellite orbital parameters (altitude, inclination, phase, RAAN, eccentricity)
- **Extractable props**: `onClose?: () => void`
- **Hardcoded**: 5 numeric fields with min/max/step, validation rules (altitude 0-50000)

### SimulationConfig
- **Source**: `src/components/forms/SimulationConfig.tsx`
- **Category**: basic
- **Description**: Dropdowns for simulation window (1-168h) and timestep (10-600s) with optional run button
- **Extractable props**: `onRun?: () => void`, `isLoading?: boolean`
- **Hardcoded**: window options [1,6,12,24,48,72,168], timestep options [10,30,60,120,300,600]

### CsvUpload
- **Source**: `src/components/forms/CsvUpload.tsx`
- **Category**: basic
- **Description**: Drag-and-drop CSV upload zone for custom debris objects
- **Extractable props**: `onLoaded: (objects: OrbitalObjectInput[]) => void`
- **Hardcoded**: file type restriction (.csv), column requirements text

### Glass Panel Variants (CSS-only)
- **Source**: `src/index.css` (`.glass-panel`, `.mission-panel`, `.danger-panel`)
- **Category**: basic
- **Description**: Reusable glassmorphism panel styles with different tints (default, mission console, danger red)
- **Extractable props**: N/A — pure CSS classes applied via `className`
- **Hardcoded**: blur(24px), gradient layers, border styles, hover states
