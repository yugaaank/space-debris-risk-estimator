import { create } from 'zustand';
import type {
  SimulationResult,
  SimulationStatus,
  PlayState,
  RiskEntry,
  OrbitalObjectInput,
  SimulationConfig,
} from '../types';

// Default satellite (SAT-001 ISS-like orbit)
export const DEFAULT_SATELLITE: OrbitalObjectInput = {
  object_id: 'SAT-001',
  name: 'SATELLITE-ALPHA',
  altitude_km: 550,
  inclination_deg: 51.6,
  phase_deg: 0,
  raan_deg: 0,
  eccentricity: 0,
  object_type: 'SATELLITE',
};

export const DEFAULT_CONFIG: SimulationConfig = {
  window_hours: 24,
  timestep_seconds: 60,
};

interface SimulationStore {
  // Simulation state
  status: SimulationStatus;
  result: SimulationResult | null;
  error: string | null;

  // Input configuration
  satellite: OrbitalObjectInput;
  config: SimulationConfig;

  // Animation state
  playState: PlayState;
  simulationTime: number;   // seconds into simulation
  playbackSpeed: number;    // 1x, 10x, 100x, 1000x

  // Selection
  selectedObjectId: string | null;
  hoveredObjectId: string | null;

  // UI toggles
  showOrbits: boolean;
  showGrid: boolean;
  showLabels: boolean;
  showApproachLines: boolean;

  // Actions
  setStatus: (s: SimulationStatus) => void;
  setResult: (r: SimulationResult | null) => void;
  setError: (e: string | null) => void;
  setSatellite: (s: OrbitalObjectInput) => void;
  setConfig: (c: SimulationConfig) => void;
  setPlayState: (p: PlayState) => void;
  setSimulationTime: (t: number) => void;
  setPlaybackSpeed: (speed: number) => void;
  setSelectedObject: (id: string | null) => void;
  setHoveredObject: (id: string | null) => void;
  toggleOrbits: () => void;
  toggleGrid: () => void;
  toggleLabels: () => void;
  toggleApproachLines: () => void;
  resetSimulation: () => void;

  // Derived helpers
  getSelectedRisk: () => RiskEntry | null;
  getHighestRisk: () => RiskEntry | null;
  getWindowSeconds: () => number;
}

export const useSimulationStore = create<SimulationStore>((set, get) => ({
  status: 'idle',
  result: null,
  error: null,
  satellite: DEFAULT_SATELLITE,
  config: DEFAULT_CONFIG,
  playState: 'stopped',
  simulationTime: 0,
  playbackSpeed: 100,
  selectedObjectId: null,
  hoveredObjectId: null,
  showOrbits: true,
  showGrid: false,
  showLabels: true,
  showApproachLines: true,

  setStatus: (s) => set({ status: s }),
  setResult: (r) => set({ result: r }),
  setError: (e) => set({ error: e }),
  setSatellite: (s) => set({ satellite: s }),
  setConfig: (c) => set({ config: c }),
  setPlayState: (p) => set({ playState: p }),
  setSimulationTime: (t) => set({ simulationTime: t }),
  setPlaybackSpeed: (speed) => set({ playbackSpeed: speed }),
  setSelectedObject: (id) => set({ selectedObjectId: id }),
  setHoveredObject: (id) => set({ hoveredObjectId: id }),
  toggleOrbits: () => set((s) => ({ showOrbits: !s.showOrbits })),
  toggleGrid: () => set((s) => ({ showGrid: !s.showGrid })),
  toggleLabels: () => set((s) => ({ showLabels: !s.showLabels })),
  toggleApproachLines: () => set((s) => ({ showApproachLines: !s.showApproachLines })),

  resetSimulation: () =>
    set({
      status: 'idle',
      result: null,
      error: null,
      playState: 'stopped',
      simulationTime: 0,
      selectedObjectId: null,
    }),

  getSelectedRisk: () => {
    const { result, selectedObjectId } = get();
    if (!result || !selectedObjectId) return null;
    return result.risk_results.find(r => r.object_id === selectedObjectId) ?? null;
  },

  getHighestRisk: () => {
    const { result } = get();
    if (!result || !result.risk_results.length) return null;
    return result.risk_results[0]; // Already ranked #1
  },

  getWindowSeconds: () => get().config.window_hours * 3600,
}));
