import { useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { OrbitalScene } from '../components/three/Scene';
import { HUD } from '../components/three/HUD';
import { useSimulationStore } from '../store/simulationStore';
import { useSimulation } from '../hooks/useSimulation';

const SPEED_OPTIONS = [1, 10, 100, 1000, 10000];

function formatTime(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function SimClock({ simulationTime }: { simulationTime: number }) {
  const hours = Math.floor(simulationTime / 3600);
  const minutes = Math.floor((simulationTime % 3600) / 60);
  const secs = Math.floor(simulationTime % 60);

  return (
    <div className="text-center px-4 py-2.5 rounded-2xl"
      style={{
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.02) 100%), rgba(4, 18, 38, 0.55)',
        border: '1px solid rgba(255, 255, 255, 0.16)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        boxShadow: 'inset 0 1px 1px rgba(255, 255, 255, 0.25), 0 8px 24px rgba(0, 0, 0, 0.35)',
      }}>
      <p className="text-[9px] font-mono text-cyan-400/70 tracking-widest uppercase mb-0.5">Simulation T+</p>
      <p className="text-2xl font-mono font-black text-cyan-200 leading-none tracking-wider"
        style={{ fontFamily: "'Orbitron', monospace", textShadow: '0 0 14px rgba(6, 182, 212, 0.7)' }}>
        {String(hours).padStart(2, '0')}
        <span className="text-cyan-500/60">:</span>
        {String(minutes).padStart(2, '0')}
        <span className="text-cyan-500/60">:</span>
        {String(secs).padStart(2, '0')}
      </p>
    </div>
  );
}

export function SimulationPage() {
  const {
    status, result, error, playState, simulationTime, playbackSpeed, config,
    setPlayState, setSimulationTime, setPlaybackSpeed,
    showOrbits, showLabels, showApproachLines, showGrid,
    toggleOrbits, toggleLabels, toggleApproachLines, toggleGrid,
    getSelectedRisk,
  } = useSimulationStore();
  const { runDemo } = useSimulation();

  // Auto-load on mount
  const hasAutoLoaded = useRef(false);
  useEffect(() => {
    if (!hasAutoLoaded.current && status === 'idle' && !result) {
      hasAutoLoaded.current = true;
      runDemo();
    }
  }, [status, result, runDemo]);

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

  // Progress percentage
  const progress = windowSeconds > 0 ? (simulationTime / windowSeconds) * 100 : 0;

  return (
    <div className="h-screen flex flex-col pt-14">
      <div className="flex flex-1 overflow-hidden">
        
        {/* ── Left control panel (Floating Liquid Glass Console) ── */}
        <div className="w-72 flex-shrink-0 overflow-y-auto" 
          style={{
            background: 'linear-gradient(180deg, rgba(8, 18, 42, 0.65) 0%, rgba(2, 8, 22, 0.72) 100%)',
            borderRight: '1px solid rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(28px) saturate(190%)',
            WebkitBackdropFilter: 'blur(28px) saturate(190%)',
            boxShadow: '8px 0 32px 0 rgba(0, 0, 0, 0.35), inset -1px 0 0 0 rgba(255, 255, 255, 0.05)',
          }}>
          <div className="p-3 space-y-3">
            
            {/* Simulation Clock */}
            {status === 'complete' && (
              <SimClock simulationTime={simulationTime} />
            )}

            {/* Simulation Controls */}
            <div className="mission-panel">
              <h3 className="section-label mb-3 text-[10px]">Playback Control</h3>

              {/* Play/Pause/Reset */}
              <div className="flex gap-2 mb-3">
                <button
                  id="play-pause-btn"
                  onClick={() => setPlayState(playState === 'playing' ? 'paused' : 'playing')}
                  disabled={status !== 'complete'}
                  className={`flex-1 py-2 rounded-full text-xs font-mono font-bold tracking-wider border transition-all duration-200 cursor-pointer ${
                    playState === 'playing'
                      ? 'border-amber-400/40 text-amber-200 bg-gradient-to-b from-amber-500/25 to-amber-600/15 shadow-[inset_0_1px_1px_rgba(255,255,255,0.3),0_4px_16px_rgba(245,158,11,0.2)]'
                      : 'border-emerald-400/40 text-emerald-200 bg-gradient-to-b from-emerald-500/25 to-emerald-600/15 shadow-[inset_0_1px_1px_rgba(255,255,255,0.3),0_4px_16px_rgba(16,185,129,0.2)]'
                  } disabled:opacity-30 disabled:cursor-not-allowed`}
                >
                  {playState === 'playing' ? '⏸ PAUSE' : '▶ PLAY'}
                </button>
                <button
                  id="reset-btn"
                  onClick={() => { setSimulationTime(0); setPlayState('stopped'); }}
                  disabled={status !== 'complete'}
                  className="btn-icon disabled:opacity-30"
                  title="Reset to T+0"
                >
                  ⏮
                </button>
              </div>

              {/* Timeline scrubber */}
              <div className="mb-3">
                <div className="flex justify-between text-[10px] font-mono text-gray-400 mb-1.5">
                  <span>{formatTime(simulationTime)}</span>
                  <span className="text-cyan-400 font-bold">{progress.toFixed(1)}%</span>
                  <span>{formatTime(windowSeconds)}</span>
                </div>
                <div className="relative">
                  <input
                    type="range"
                    min={0}
                    max={windowSeconds}
                    step={config.timestep_seconds}
                    value={simulationTime}
                    onChange={e => setSimulationTime(parseFloat(e.target.value))}
                    disabled={status !== 'complete'}
                    className="w-full disabled:opacity-30"
                    style={{ cursor: status === 'complete' ? 'pointer' : 'not-allowed' }}
                  />
                </div>
              </div>

              {/* Speed selector */}
              <div>
                <p className="hud-label mb-1.5">Playback Speed</p>
                <div className="grid grid-cols-5 gap-1 p-0.5 rounded-full bg-black/20 border border-white/[0.06]">
                  {SPEED_OPTIONS.map(s => (
                    <button
                      key={s}
                      onClick={() => setPlaybackSpeed(s)}
                      className={`py-1 rounded-full text-[10px] font-mono font-bold border transition-all duration-200 cursor-pointer ${
                        playbackSpeed === s
                          ? 'bg-gradient-to-b from-cyan-400/30 to-cyan-600/20 border-cyan-400/50 text-cyan-200 shadow-[inset_0_1px_1px_rgba(255,255,255,0.3),0_2px_8px_rgba(6,182,212,0.25)]'
                          : 'border-transparent text-gray-500 hover:border-white/[0.15] hover:text-gray-300 hover:bg-white/[0.04]'
                      }`}
                    >
                      {s >= 1000 ? `${s/1000}k` : `${s}`}×
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Scenario */}
            <div className="mission-panel">
              <h3 className="section-label mb-3 text-[10px]">Scenario</h3>
              <button
                id="load-demo-btn"
                onClick={() => runDemo()}
                disabled={status === 'running'}
                className="btn-primary w-full mb-2 text-xs"
              >
                {status === 'running' ? '⟳ SIMULATING...' : '▶ LOAD DEMO SCENARIO'}
              </button>
              {result && (
                <button
                  id="export-csv-btn"
                  onClick={handleExport}
                  className="btn-secondary w-full text-xs"
                >
                  ↓ EXPORT RISK CSV
                </button>
              )}
            </div>

            {/* View Toggles */}
            <div className="mission-panel">
              <h3 className="section-label mb-3 text-[10px]">View Toggles</h3>
              <div className="space-y-1.5">
                {[
                  { label: 'Orbit Paths', state: showOrbits, toggle: toggleOrbits },
                  { label: 'Approach Lines', state: showApproachLines, toggle: toggleApproachLines },
                  { label: 'Object Labels', state: showLabels, toggle: toggleLabels },
                  { label: 'Equatorial Grid', state: showGrid, toggle: toggleGrid },
                ].map(({ label, state, toggle }) => (
                  <button
                    key={label}
                    onClick={toggle}
                    className={`flex items-center justify-between w-full px-3 py-1.5 rounded-full border text-[11px] font-mono transition-all duration-200 cursor-pointer ${
                      state
                        ? 'border-cyan-400/35 bg-gradient-to-r from-cyan-500/15 to-blue-500/10 text-cyan-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]'
                        : 'border-white/[0.08] text-gray-500 hover:border-white/[0.18] hover:text-gray-300 hover:bg-white/[0.03]'
                    }`}
                  >
                    {label}
                    <span className={`w-2 h-2 rounded-full transition-colors ${state ? 'bg-cyan-400 shadow-[0_0_6px_#22d3ee]' : 'bg-gray-700'}`} />
                  </button>
                ))}
              </div>
            </div>

            {/* Selected object info */}
            <AnimatePresence>
              {selectedRisk && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  className="mission-panel"
                  style={{
                    borderColor: selectedRisk.risk_level === 'CRITICAL' ? 'rgba(255, 34, 68, 0.35)'
                      : selectedRisk.risk_level === 'HIGH' ? 'rgba(255, 136, 0, 0.3)'
                      : 'rgba(56, 189, 248, 0.15)'
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="section-label text-[10px]">SELECTED TARGET</h3>
                    <span className={`text-[10px] font-mono font-bold ${
                      selectedRisk.risk_level === 'CRITICAL' ? 'text-red-400' :
                      selectedRisk.risk_level === 'HIGH' ? 'text-orange-400' :
                      selectedRisk.risk_level === 'MODERATE' ? 'text-yellow-400' : 'text-emerald-400'
                    }`}>
                      {selectedRisk.risk_level}
                    </span>
                  </div>
                  <p className="text-xs font-mono text-gray-300 font-bold mb-2">{selectedRisk.object_id}</p>
                  <div className="space-y-1.5 text-[11px] font-mono">
                    {[
                      { label: 'Min Distance', value: `${selectedRisk.min_distance_km.toFixed(2)} km`, accent: true },
                      { label: 'TCA', value: selectedRisk.tca_label, accent: false },
                      { label: 'Rel. Velocity', value: `${selectedRisk.relative_velocity_km_s.toFixed(2)} km/s`, accent: false },
                      { label: 'Risk Score', value: `${selectedRisk.risk_score}/100`, accent: false },
                    ].map(({ label, value, accent }) => (
                      <div key={label} className="flex justify-between">
                        <span className="text-gray-600">{label}</span>
                        <span className={accent ? 'text-yellow-300 font-bold' : 'text-gray-300'}>{value}</span>
                      </div>
                    ))}
                  </div>
                  {/* Risk score bar */}
                  <div className="mt-2 risk-bar">
                    <div className="risk-bar-fill"
                      style={{
                        width: `${selectedRisk.risk_score}%`,
                        background: selectedRisk.risk_level === 'CRITICAL' ? 'var(--risk-critical)'
                          : selectedRisk.risk_level === 'HIGH' ? 'var(--risk-high)'
                          : selectedRisk.risk_level === 'MODERATE' ? 'var(--risk-moderate)'
                          : 'var(--risk-low)',
                      }}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Disclaimer */}
            <div className="px-2 py-2 rounded text-[10px] font-mono text-yellow-700 leading-relaxed"
              style={{ background: 'rgba(30, 20, 0, 0.5)', border: '1px solid rgba(255, 200, 0, 0.12)' }}>
              ⚠ APPROXIMATE MODEL — Simplified Keplerian propagation. Not for operational use.
            </div>
          </div>
        </div>

        {/* ── 3D View ──────────────────────────────────── */}
        <div className="flex-1 relative">
          <OrbitalScene />
          <HUD />

          {/* Loading overlay */}
          <AnimatePresence>
            {status === 'running' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex items-center justify-center"
                style={{ background: 'rgba(1, 6, 16, 0.75)' }}
              >
                <div className="mission-panel text-center px-16 py-10">
                  <div className="relative w-16 h-16 mx-auto mb-6">
                    <div className="absolute inset-0 rounded-full border-2 border-cyan-400/20" />
                    <div className="absolute inset-0 rounded-full border-t-2 border-cyan-400 animate-spin" />
                    <div className="absolute inset-2 rounded-full border-t border-blue-400/60 animate-spin" style={{ animationDuration: '1.5s', animationDirection: 'reverse' }} />
                    <div className="absolute inset-0 flex items-center justify-center text-cyan-400 text-xl">⊕</div>
                  </div>
                  <p className="text-cyan-300 font-mono text-sm font-bold tracking-widest mb-1">SIMULATION RUNNING</p>
                  <p className="text-gray-500 font-mono text-xs">Propagating orbits · calculating conjunctions</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Empty state */}
          <AnimatePresence>
            {status === 'idle' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
              >
                <div className="text-center">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full border border-cyan-500/20 flex items-center justify-center">
                    <span className="text-3xl text-gray-700">⊕</span>
                  </div>
                  <p className="text-gray-600 font-mono text-sm mb-1">No simulation loaded</p>
                  <p className="text-gray-700 font-mono text-xs">Click "Load Demo Scenario" to begin</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error overlay */}
          <AnimatePresence>
            {status === 'error' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex items-center justify-center z-30"
                style={{ background: 'rgba(1, 6, 16, 0.85)' }}
              >
                <div className="danger-panel text-center px-10 py-8 max-w-md pointer-events-auto">
                  <div className="text-4xl mb-3 text-red-400 animate-critical-pulse">⚠</div>
                  <p className="text-red-300 font-mono text-sm font-bold tracking-wider mb-2">SIMULATION SERVICE NOTICE</p>
                  <p className="text-gray-400 font-mono text-xs mb-5 leading-relaxed">{error || 'Unable to reach the orbital risk service. The backend may be warming up.'}</p>
                  <button onClick={() => runDemo()} className="btn-primary text-xs px-6 py-2">
                    ⟳ RETRY CONNECTION
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
