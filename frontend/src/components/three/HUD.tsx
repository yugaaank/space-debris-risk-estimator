import { useSimulationStore } from '../../store/simulationStore';
import { RiskBadge } from '../risk/RiskBadge';
import { motion, AnimatePresence } from 'framer-motion';
import { propagatePosition } from '../../utils/orbitalMath';
import { useEffect, useState } from 'react';

function formatTime(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function TelemetryRow({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex justify-between items-center py-0.5">
      <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider">{label}</span>
      <span className={`text-[11px] font-mono font-semibold ${accent ? 'text-cyan-300 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]' : 'text-gray-200'}`}>{value}</span>
    </div>
  );
}

export function HUD() {
  const { result, playState, simulationTime, getHighestRisk, getSelectedRisk } = useSimulationStore();
  const [tcaAlert, setTcaAlert] = useState(false);

  const highestRisk = getHighestRisk();
  const selectedRisk = getSelectedRisk();

  // Check if we are approaching a TCA event
  useEffect(() => {
    if (!highestRisk) { setTcaAlert(false); return; }
    const delta = Math.abs(simulationTime - highestRisk.time_of_ca_s);
    setTcaAlert(delta < 300 && delta > 0); // within 5 minutes of TCA
  }, [simulationTime, highestRisk]);

  if (!result) return null;

  // Live lat/lon approximation from satellite position
  const [sx, sy, sz] = propagatePosition(
    result.satellite.altitude_km,
    result.satellite.inclination_deg,
    result.satellite.phase_deg,
    result.satellite.raan_deg,
    simulationTime,
  );
  const lat = Math.round(Math.atan2(sz, Math.sqrt(sx * sx + sy * sy)) * 180 / Math.PI);
  const lon = Math.round(Math.atan2(sy, sx) * 180 / Math.PI);

  return (
    <div className="absolute top-4 right-4 z-20 pointer-events-none flex flex-col gap-2.5 max-w-xs w-72">
      
      {/* TCA Alert */}
      <AnimatePresence>
        {tcaAlert && highestRisk && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="danger-panel p-3 animate-critical-pulse pointer-events-none"
          >
            <p className="text-[9px] font-mono text-red-400 font-black tracking-widest uppercase mb-1">
              ⚠ CLOSE APPROACH EVENT
            </p>
            <p className="text-xs font-mono text-red-300 font-bold">{highestRisk.object_id}</p>
            <p className="text-[11px] font-mono text-gray-400">
              {highestRisk.min_distance_km.toFixed(2)} km — {highestRisk.tca_label}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Primary Telemetry */}
      <div className="mission-panel text-xs p-3.5 space-y-2.5">
        {/* Header row */}
        <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
          <div className="flex items-center gap-2">
            <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${playState === 'playing' ? 'bg-emerald-400 animate-pulse shadow-[0_0_6px_#34d399]' : 'bg-gray-600'}`} />
            <span className="text-[10px] font-mono font-bold text-gray-300 tracking-widest">
              {playState === 'playing' ? 'LIVE TELEMETRY' : 'SIMULATION PAUSED'}
            </span>
          </div>
          <span className="text-cyan-300 font-mono font-bold text-[11px]"
            style={{ fontFamily: "'Orbitron', monospace", textShadow: '0 0 10px rgba(6, 182, 212, 0.6)' }}>
            {formatTime(simulationTime)}
          </span>
        </div>

        {/* Satellite telemetry */}
        <div className="space-y-1">
          <TelemetryRow label="Primary Sat" value={result.satellite.object_id} accent />
          <TelemetryRow label="Altitude" value={`${result.satellite.altitude_km.toFixed(1)} km`} />
          <TelemetryRow label="Orbital Speed" value={`${result.satellite.orbital_velocity_km_s.toFixed(2)} km/s`} />
          <TelemetryRow label="Period" value={`${result.satellite.period_min.toFixed(2)} min`} />
          <TelemetryRow label="Position" value={`${lat}° lat · ${lon}° lon`} />
          <TelemetryRow label="Tracked RSOs" value={`${result.debris_objects.length}`} />
        </div>

        {/* Closest approach info */}
        {highestRisk && (
          <div className="pt-2 border-t border-white/[0.08] space-y-2">
            <div className="flex items-center justify-between">
              <span className="hud-label">PEAK CONJUNCTION</span>
              <RiskBadge level={highestRisk.risk_level} size="sm" score={highestRisk.risk_score} showScore />
            </div>
            <div className="space-y-1.5">
              <TelemetryRow label="Object" value={highestRisk.object_id} accent />
              <TelemetryRow label="Min Separation" value={`${highestRisk.min_distance_km.toFixed(2)} km`} />
              <TelemetryRow label="TCA" value={highestRisk.tca_label} />
              <TelemetryRow label="Rel. Velocity" value={`${highestRisk.relative_velocity_km_s.toFixed(2)} km/s`} />
            </div>
            {/* Mini risk bar */}
            <div className="risk-bar mt-1">
              <div className="risk-bar-fill"
                style={{
                  width: `${highestRisk.risk_score}%`,
                  background: highestRisk.risk_level === 'CRITICAL' ? '#ff2244' :
                    highestRisk.risk_level === 'HIGH' ? '#ff8800' :
                    highestRisk.risk_level === 'MODERATE' ? '#ffd700' : '#00e87b',
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Selected Target Inspect Card */}
      <AnimatePresence>
        {selectedRisk && selectedRisk !== highestRisk && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="mission-panel p-3 space-y-1.5"
            style={{ borderColor: 'rgba(6, 182, 212, 0.3)' }}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="hud-label text-cyan-600">TARGET INSPECTED</span>
              <span className="text-[10px] text-gray-500 font-mono">#{selectedRisk.rank}</span>
            </div>
            <p className="text-xs font-mono font-bold text-white">{selectedRisk.name}</p>
            <div className="space-y-1.5">
              <TelemetryRow label="Rel. Speed" value={`${selectedRisk.relative_velocity_km_s.toFixed(2)} km/s`} accent />
              <TelemetryRow label="Min Dist" value={`${selectedRisk.min_distance_km.toFixed(2)} km`} />
              <TelemetryRow label="Risk Score" value={`${selectedRisk.risk_score}/100`} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
