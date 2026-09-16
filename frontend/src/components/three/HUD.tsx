import { useSimulationStore } from '../../store/simulationStore';
import { RiskBadge } from '../risk/RiskBadge';

function formatTime(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function HUD() {
  const { result, playState, simulationTime, getHighestRisk, getSelectedRisk } = useSimulationStore();

  if (!result) return null;

  const highestRisk = getHighestRisk();
  const selectedRisk = getSelectedRisk();

  return (
    <div className="absolute top-4 right-4 z-20 pointer-events-none flex flex-col gap-3 max-w-xs">
      {/* Primary Telemetry Card */}
      <div className="glass-panel text-xs font-mono space-y-2 p-3.5 border-blue-500/30">
        <div className="flex items-center justify-between pb-1.5 border-b border-blue-900/30">
          <div className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${
                playState === 'playing' ? 'bg-emerald-400 animate-pulse' : 'bg-gray-500'
              }`}
            />
            <span className="text-[11px] font-bold text-gray-300">
              {playState === 'playing' ? 'LIVE TELEMETRY' : 'SIMULATION PAUSED'}
            </span>
          </div>
          <span className="text-cyan-300 font-bold">{formatTime(simulationTime)}</span>
        </div>

        <div className="space-y-1 text-[11px]">
          <div className="flex justify-between">
            <span className="text-gray-400">Primary Sat:</span>
            <span className="text-cyan-400 font-semibold">{result.satellite.object_id}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Altitude:</span>
            <span className="text-gray-200">{result.satellite.altitude_km.toFixed(1)} km</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Orbital Speed:</span>
            <span className="text-gray-200">{result.satellite.orbital_velocity_km_s.toFixed(2)} km/s</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Tracked Objects:</span>
            <span className="text-gray-200">{result.debris_objects.length} RSOs</span>
          </div>
        </div>

        {/* Top Risk Overview */}
        {highestRisk && (
          <div className="pt-2 border-t border-blue-900/30 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-[10px] uppercase font-bold text-red-400/90">
                Peak Conjunction
              </span>
              <RiskBadge level={highestRisk.risk_level} size="sm" score={highestRisk.risk_score} showScore />
            </div>
            <div className="flex justify-between text-[11px]">
              <span className="text-gray-400">Object:</span>
              <span className="text-red-300 font-semibold">{highestRisk.object_id}</span>
            </div>
            <div className="flex justify-between text-[11px]">
              <span className="text-gray-400">Min Separation:</span>
              <span className="text-yellow-300 font-bold">{highestRisk.min_distance_km.toFixed(2)} km</span>
            </div>
            <div className="flex justify-between text-[11px]">
              <span className="text-gray-400">TCA:</span>
              <span className="text-gray-200">{highestRisk.tca_label}</span>
            </div>
          </div>
        )}
      </div>

      {/* Selected Target Inspect Card (if selected) */}
      {selectedRisk && (
        <div className="glass-panel text-xs font-mono space-y-1.5 p-3 border-cyan-500/40 bg-cyan-950/40">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-cyan-300 font-bold uppercase tracking-wider">
              Target Inspected
            </span>
            <span className="text-[10px] text-gray-400">#{selectedRisk.rank}</span>
          </div>
          <p className="font-bold text-white text-xs">{selectedRisk.name}</p>
          <div className="flex justify-between text-[11px] pt-1">
            <span className="text-gray-400">Rel. Speed:</span>
            <span className="text-cyan-300">{selectedRisk.relative_velocity_km_s.toFixed(2)} km/s</span>
          </div>
          <div className="flex justify-between text-[11px]">
            <span className="text-gray-400">Risk Score:</span>
            <span className="text-amber-300 font-bold">{selectedRisk.risk_score} / 100</span>
          </div>
        </div>
      )}
    </div>
  );
}
