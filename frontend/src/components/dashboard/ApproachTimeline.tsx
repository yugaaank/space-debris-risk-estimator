import type { RiskEntry } from '../../types';
import { useSimulationStore } from '../../store/simulationStore';
import { motion } from 'framer-motion';

const RISK_STYLES = {
  CRITICAL: { bg: 'bg-red-500/8 border-red-500/30 hover:bg-red-500/15', dot: 'bg-red-500 animate-pulse', text: 'text-red-400', label: 'text-red-300' },
  HIGH:     { bg: 'bg-orange-500/8 border-orange-500/30 hover:bg-orange-500/15', dot: 'bg-orange-500', text: 'text-orange-400', label: 'text-orange-300' },
  MODERATE: { bg: 'bg-yellow-500/6 border-yellow-500/25 hover:bg-yellow-500/12', dot: 'bg-yellow-400', text: 'text-yellow-400', label: 'text-yellow-300' },
  LOW:      { bg: 'bg-emerald-500/4 border-emerald-500/15 hover:bg-emerald-500/8', dot: 'bg-emerald-400', text: 'text-emerald-400', label: 'text-gray-400' },
};

interface Props {
  results: RiskEntry[];
}

function formatTCA(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function ApproachTimeline({ results }: Props) {
  const { setSelectedObject, selectedObjectId, setSimulationTime } = useSimulationStore();

  const sorted = [...results].sort((a, b) => a.time_of_ca_s - b.time_of_ca_s).slice(0, 10);

  if (!results.length) {
    return (
      <div className="mission-panel h-full flex flex-col">
        <h3 className="section-label text-[10px] mb-4">Close Approach Timeline</h3>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-700 text-xs font-mono">Run simulation to see timeline</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mission-panel">
      <div className="flex items-center justify-between mb-4">
        <h3 className="section-label text-[10px]">Close Approach Timeline</h3>
        <span className="text-[10px] font-mono text-gray-600">{sorted.length} events</span>
      </div>

      <div className="space-y-0">
        {/* Timeline header */}
        <div className="flex gap-3 px-3 py-1.5 mb-1">
          <span className="text-[9px] font-mono text-gray-700 uppercase tracking-wider w-16">T+HH:MM:SS</span>
          <span className="text-[9px] font-mono text-gray-700 uppercase tracking-wider flex-1">Object</span>
          <span className="text-[9px] font-mono text-gray-700 uppercase tracking-wider w-16 text-right">Min Dist</span>
          <span className="text-[9px] font-mono text-gray-700 uppercase tracking-wider w-10 text-right">Risk</span>
        </div>

        <div className="space-y-1 max-h-72 overflow-y-auto">
          {sorted.map((r, i) => {
            const style = RISK_STYLES[r.risk_level];
            const isSelected = r.object_id === selectedObjectId;
            return (
              <motion.button
                key={r.object_id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                onClick={() => {
                  setSelectedObject(r.object_id);
                  setSimulationTime(Math.max(0, r.time_of_ca_s - 120));
                }}
                className={`w-full text-left flex items-center gap-3 px-3 py-2 rounded border transition-all ${style.bg} ${
                  isSelected ? 'ring-1 ring-cyan-500/40' : ''
                }`}
              >
                {/* TCA time */}
                <span className="text-[11px] font-mono text-gray-500 font-bold w-16 flex-shrink-0">
                  {formatTCA(r.time_of_ca_s)}
                </span>

                {/* Risk dot + Object ID */}
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${style.dot}`} />
                  <div className="min-w-0">
                    <p className={`text-[11px] font-mono font-bold truncate ${style.label}`}>{r.object_id}</p>
                    <p className="text-[9px] font-mono text-gray-700 truncate">{r.name}</p>
                  </div>
                </div>

                {/* Min distance */}
                <span className="text-[11px] font-mono text-gray-400 w-16 text-right flex-shrink-0">
                  {r.min_distance_km.toFixed(1)} km
                </span>

                {/* Risk score */}
                <span className={`text-[10px] font-mono font-bold w-8 text-right flex-shrink-0 ${style.text}`}>
                  {r.risk_score}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>

      <p className="text-[9px] text-gray-700 font-mono mt-3 text-right">Click row → jump to event in simulation</p>
    </div>
  );
}
