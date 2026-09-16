import { useCallback } from 'react';
import { OrbitalScene } from '../components/three/Scene';
import { HUD } from '../components/three/HUD';
import { useSimulationStore } from '../store/simulationStore';
import { useSimulation } from '../hooks/useSimulation';

const SPEED_OPTIONS = [1, 10, 100, 1000];

function formatTime(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function SimulationPage() {
  const {
    status, result, playState, simulationTime, playbackSpeed, config,
    setPlayState, setSimulationTime, setPlaybackSpeed,
    showOrbits, showLabels, showApproachLines, showGrid,
    toggleOrbits, toggleLabels, toggleApproachLines, toggleGrid,
    getSelectedRisk,
  } = useSimulationStore();
  const { runDemo } = useSimulation();

  const windowSeconds = config.window_hours * 3600;
  const selectedRisk = getSelectedRisk();

  // Export CSV
  const handleExport = useCallback(() => {
    if (!result) return;
    const headers = ['rank', 'object_id', 'name', 'min_distance_km', 'tca_label', 'relative_velocity_km_s', 'risk_score', 'risk_level'];
    const rows = result.risk_results.map(r =>
      [r.rank, r.object_id, `"${r.name}"`, r.min_distance_km, r.tca_label, r.relative_velocity_km_s, r.risk_score, r.risk_level].join(',')
    );
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'orbital_shield_risk_report.csv'; a.click();
    URL.revokeObjectURL(url);
  }, [result]);

  return (
    <div className="h-screen flex flex-col pt-14">
      <div className="flex flex-1 overflow-hidden">
        {/* Left panel */}
        <div className="w-72 flex-shrink-0 bg-gray-950/80 border-r border-blue-900/30 flex flex-col overflow-y-auto">
          <div className="p-4 space-y-4">
            {/* Simulation controls */}
            <div className="glass-panel">
              <h3 className="section-label mb-3">Simulation Controls</h3>

              {/* Play/Pause/Reset */}
              <div className="flex gap-2 mb-3">
                <button
                  id="play-pause-btn"
                  onClick={() => setPlayState(playState === 'playing' ? 'paused' : 'playing')}
                  disabled={status !== 'complete'}
                  className={`flex-1 py-2 rounded text-sm font-mono border transition-all ${playState === 'playing' ? 'bg-yellow-500/20 border-yellow-500/50 text-yellow-300' : 'bg-green-500/20 border-green-500/50 text-green-300'} disabled:opacity-40 disabled:cursor-not-allowed`}
                >
                  {playState === 'playing' ? '⏸ Pause' : '▶ Play'}
                </button>
                <button
                  id="reset-btn"
                  onClick={() => { setSimulationTime(0); setPlayState('stopped'); }}
                  disabled={status !== 'complete'}
                  className="px-3 py-2 rounded text-sm font-mono border border-gray-700 text-gray-400 hover:border-gray-500 transition-all disabled:opacity-40"
                >
                  ⏮
                </button>
              </div>

              {/* Timeline scrubber */}
              <div className="mb-2">
                <div className="flex justify-between text-xs font-mono text-gray-500 mb-1">
                  <span>{formatTime(simulationTime)}</span>
                  <span>{formatTime(windowSeconds)}</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={windowSeconds}
                  step={config.timestep_seconds}
                  value={simulationTime}
                  onChange={e => setSimulationTime(parseFloat(e.target.value))}
                  disabled={status !== 'complete'}
                  className="w-full h-1 accent-blue-400"
                />
              </div>

              {/* Speed selector */}
              <div>
                <p className="text-xs text-gray-500 font-mono mb-2">Playback Speed</p>
                <div className="flex gap-1.5">
                  {SPEED_OPTIONS.map(s => (
                    <button
                      key={s}
                      onClick={() => setPlaybackSpeed(s)}
                      className={`flex-1 py-1 rounded text-xs font-mono border transition-all ${playbackSpeed === s ? 'bg-blue-600/30 border-blue-500/50 text-blue-300' : 'border-gray-700 text-gray-500 hover:border-gray-600'}`}
                    >
                      {s}×
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Demo / Run */}
            <div className="glass-panel">
              <h3 className="section-label mb-3">Scenario</h3>
              <button
                id="load-demo-btn"
                onClick={() => runDemo()}
                disabled={status === 'running'}
                className="btn-primary w-full mb-2 text-sm"
              >
                {status === 'running' ? '⟳ Simulating...' : '🎯 Load Demo Scenario'}
              </button>
              {result && (
                <button
                  id="export-csv-btn"
                  onClick={handleExport}
                  className="btn-secondary w-full text-sm"
                >
                  📥 Export Risk Report CSV
                </button>
              )}
            </div>

            {/* View toggles */}
            <div className="glass-panel">
              <h3 className="section-label mb-3">View Toggles</h3>
              <div className="space-y-2">
                {[
                  { label: 'Orbit Paths', state: showOrbits, toggle: toggleOrbits },
                  { label: 'Approach Lines', state: showApproachLines, toggle: toggleApproachLines },
                  { label: 'Labels', state: showLabels, toggle: toggleLabels },
                  { label: 'Equatorial Grid', state: showGrid, toggle: toggleGrid },
                ].map(({ label, state, toggle }) => (
                  <button key={label} onClick={toggle} className={`flex items-center justify-between w-full px-3 py-2 rounded border text-xs font-mono transition-all ${state ? 'bg-blue-600/10 border-blue-600/30 text-blue-300' : 'border-gray-700 text-gray-500'}`}>
                    {label}
                    <span>{state ? '✓' : '○'}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Selected object info */}
            {selectedRisk && (
              <div className="glass-panel">
                <h3 className="section-label mb-3">Selected: {selectedRisk.object_id}</h3>
                <div className="space-y-2 text-xs font-mono">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Min Distance</span>
                    <span className="text-gray-200">{selectedRisk.min_distance_km.toFixed(2)} km</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">TCA</span>
                    <span className="text-gray-200">{selectedRisk.tca_label}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Rel. Velocity</span>
                    <span className="text-gray-200">{selectedRisk.relative_velocity_km_s.toFixed(2)} km/s</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Risk Score</span>
                    <span className="text-gray-200">{selectedRisk.risk_score}/100</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Risk Level</span>
                    <span className={
                      selectedRisk.risk_level === 'CRITICAL' ? 'text-red-400' :
                      selectedRisk.risk_level === 'HIGH' ? 'text-orange-400' :
                      selectedRisk.risk_level === 'MODERATE' ? 'text-yellow-400' : 'text-green-400'
                    }>{selectedRisk.risk_level}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Disclaimer */}
            <div className="px-2 py-2 bg-yellow-900/10 border border-yellow-900/30 rounded text-xs font-mono text-yellow-700 leading-relaxed">
              ⚠ APPROXIMATE MODEL — Simplified Keplerian propagation. Not for operational use.
            </div>
          </div>
        </div>

        {/* 3D View (center) */}
        <div className="flex-1 relative">
          <OrbitalScene />

          {/* HUD overlay */}
          <HUD />

          {/* Loading overlay */}
          {status === 'running' && (
            <div className="absolute inset-0 bg-gray-950/60 flex items-center justify-center">
              <div className="glass-panel text-center px-12 py-8">
                <div className="text-4xl mb-4 animate-spin">⟳</div>
                <p className="text-blue-300 font-mono text-lg">Simulation Running...</p>
                <p className="text-gray-500 font-mono text-sm mt-2">Propagating orbits & calculating closest approaches</p>
              </div>
            </div>
          )}

          {/* Empty state */}
          {status === 'idle' && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <p className="text-gray-600 font-mono text-lg mb-2">No simulation loaded</p>
                <p className="text-gray-700 font-mono text-sm">Click "Load Demo Scenario" to begin</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
