import type { RiskEntry } from '../../types';
import { useSimulationStore } from '../../store/simulationStore';

const RISK_BG: Record<string, string> = {
  CRITICAL: 'bg-red-500/10 border-red-500/40 hover:bg-red-500/20',
  HIGH:     'bg-orange-500/10 border-orange-500/40 hover:bg-orange-500/20',
  MODERATE: 'bg-yellow-500/10 border-yellow-500/30 hover:bg-yellow-500/20',
  LOW:      'bg-green-500/5 border-green-500/20 hover:bg-green-500/10',
};
const RISK_DOT: Record<string, string> = {
  CRITICAL: 'bg-red-500',
  HIGH:     'bg-orange-500',
  MODERATE: 'bg-yellow-500',
  LOW:      'bg-green-500',
};

interface Props {
  results: RiskEntry[];
}

function formatTCA(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export function ApproachTimeline({ results }: Props) {
  const { setSelectedObject, selectedObjectId } = useSimulationStore();

  // Show top 8 by TCA order
  const sorted = [...results].sort((a, b) => a.time_of_ca_s - b.time_of_ca_s).slice(0, 8);

  if (!results.length) {
    return (
      <div className="glass-panel">
        <h3 className="text-xs text-gray-400 uppercase tracking-widest font-mono mb-3">Approach Timeline</h3>
        <p className="text-gray-600 text-sm font-mono text-center py-4">No data</p>
      </div>
    );
  }

  return (
    <div className="glass-panel">
      <h3 className="text-xs text-gray-400 uppercase tracking-widest font-mono mb-3">
        Approach Timeline
      </h3>
      <div className="space-y-1.5 max-h-64 overflow-y-auto">
        {sorted.map(r => (
          <button
            key={r.object_id}
            onClick={() => setSelectedObject(r.object_id)}
            className={`w-full text-left flex items-center gap-3 px-3 py-2 rounded border transition-all ${RISK_BG[r.risk_level]} ${selectedObjectId === r.object_id ? 'ring-1 ring-blue-400' : ''}`}
          >
            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${RISK_DOT[r.risk_level]} ${r.risk_level === 'CRITICAL' ? 'animate-pulse' : ''}`} />
            <span className="text-gray-300 font-mono text-xs w-10 flex-shrink-0">
              {formatTCA(r.time_of_ca_s)}
            </span>
            <span className="text-gray-200 font-mono text-xs flex-1 truncate">{r.object_id}</span>
            <span className="text-gray-400 font-mono text-xs">{r.min_distance_km.toFixed(1)} km</span>
          </button>
        ))}
      </div>
    </div>
  );
}
