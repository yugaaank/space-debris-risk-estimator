# Page Dependency Trees

## `/` — LandingPage
Entry: `src/pages/LandingPage.tsx`
Dependencies:
- `src/components/three/Earth.tsx`
- `src/components/three/Starfield.tsx`
- `src/hooks/useSimulation.ts`
  - `src/store/simulationStore.ts`
  - `src/api/client.ts`
  - `src/types/index.ts`
- `src/components/layout/SystemStatus.tsx`
  - `src/api/client.ts`
  - `src/types/index.ts`
- `src/store/simulationStore.ts`
  - `src/types/index.ts`

## `/simulation` — SimulationPage
Entry: `src/pages/SimulationPage.tsx`
Dependencies:
- `src/components/three/Scene.tsx` (OrbitalScene)
  - `src/components/three/Earth.tsx`
  - `src/components/three/Starfield.tsx`
  - `src/components/three/SatelliteObject.tsx`
  - `src/components/three/DebrisObject.tsx`
  - `src/components/three/OrbitPath.tsx`
  - `src/components/three/ApproachLine.tsx`
  - `src/components/three/EquatorialGrid.tsx`
  - `src/store/simulationStore.ts`
- `src/components/three/HUD.tsx`
  - `src/store/simulationStore.ts`
- `src/store/simulationStore.ts`
- `src/hooks/useSimulation.ts`
  - `src/store/simulationStore.ts`
  - `src/api/client.ts`
  - `src/types/index.ts`

## `/risk` — RiskAnalysisPage
Entry: `src/pages/RiskAnalysisPage.tsx`
Dependencies:
- `src/store/simulationStore.ts`
- `src/hooks/useSimulation.ts`
- `src/components/dashboard/KpiCards.tsx`
  - `src/types/index.ts`
- `src/components/dashboard/RiskDistributionChart.tsx`
  - `src/types/index.ts`
- `src/components/dashboard/ApproachTimeline.tsx`
  - `src/types/index.ts`
  - `src/store/simulationStore.ts`
- `src/components/dashboard/DistanceGraph.tsx`
  - `src/types/index.ts`
- `src/components/risk/RiskTable.tsx`
  - `src/types/index.ts`
  - `src/store/simulationStore.ts`
  - `src/components/risk/RiskBadge.tsx`
- `src/components/forms/SatelliteForm.tsx`
  - `src/store/simulationStore.ts`
- `src/components/forms/SimulationConfig.tsx`
  - `src/store/simulationStore.ts`
- `src/components/forms/CsvUpload.tsx`
  - `src/api/client.ts`
  - `src/types/index.ts`

## `/objects` — ObjectsPage
Entry: `src/pages/ObjectsPage.tsx`
Dependencies:
- `src/api/client.ts`
- `src/types/index.ts`
- `src/store/simulationStore.ts`
- `src/components/forms/CsvUpload.tsx`
  - `src/api/client.ts`
  - `src/types/index.ts`

## `/methodology` — MethodologyPage
Entry: `src/pages/MethodologyPage.tsx`
Dependencies:
- (none — static content page, only uses `react-router-dom` Link)
