import { useState, useMemo, Fragment } from 'react';
import type { RiskEntry, RiskLevel } from '../../types';
import { useSimulationStore } from '../../store/simulationStore';
import { RiskBadge } from './RiskBadge';

type SortKey = 'rank' | 'min_distance_km' | 'risk_score' | 'time_of_ca_s' | 'relative_velocity_km_s';

interface Props {
  results: RiskEntry[];
}

export function RiskTable({ results }: Props) {
  const { selectedObjectId, setSelectedObject } = useSimulationStore();
  const [search, setSearch] = useState('');
  const [filterLevel, setFilterLevel] = useState<RiskLevel | 'ALL'>('ALL');
  const [sortKey, setSortKey] = useState<SortKey>('rank');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [showExplanation, setShowExplanation] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let data = [...results];
    if (search) {
      const q = search.toLowerCase();
      data = data.filter(r => r.object_id.toLowerCase().includes(q) || r.name.toLowerCase().includes(q));
    }
    if (filterLevel !== 'ALL') {
      data = data.filter(r => r.risk_level === filterLevel);
    }
    data.sort((a, b) => {
      const va = a[sortKey] as number;
      const vb = b[sortKey] as number;
      return sortDir === 'asc' ? va - vb : vb - va;
    });
    return data;
  }, [results, search, filterLevel, sortKey, sortDir]);

  const handleSort = (key: SortKey) => {
    if (key === sortKey) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };

  const Th = ({ label, k }: { label: string; k: SortKey }) => (
    <th
      className="px-3 py-2 text-left text-xs text-gray-400 font-mono uppercase tracking-wider cursor-pointer hover:text-blue-300 whitespace-nowrap"
      onClick={() => handleSort(k)}
    >
      {label} {sortKey === k ? (sortDir === 'asc' ? '↑' : '↓') : ''}
    </th>
  );

  return (
    <div className="glass-panel">
      {/* Controls */}
      <div className="flex flex-wrap gap-2 mb-4">
        <input
          className="bg-gray-900/60 border border-gray-700 rounded px-3 py-1.5 text-sm text-gray-200 font-mono flex-1 min-w-32 focus:outline-none focus:border-blue-500"
          placeholder="Search object ID or name..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        {(['ALL', 'CRITICAL', 'HIGH', 'MODERATE', 'LOW'] as const).map(level => (
          <button
            key={level}
            onClick={() => setFilterLevel(level)}
            className={`px-3 py-1.5 rounded text-xs font-mono border transition-all ${filterLevel === level
              ? 'bg-blue-600 border-blue-400 text-white'
              : 'bg-gray-900/40 border-gray-700 text-gray-400 hover:border-gray-500'}`}
          >
            {level}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800">
              <Th label="#" k="rank" />
              <th className="px-3 py-2 text-left text-xs text-gray-400 font-mono uppercase tracking-wider">Object</th>
              <Th label="Min Dist" k="min_distance_km" />
              <Th label="TCA" k="time_of_ca_s" />
              <Th label="Rel Vel" k="relative_velocity_km_s" />
              <Th label="Score" k="risk_score" />
              <th className="px-3 py-2 text-left text-xs text-gray-400 font-mono uppercase tracking-wider">Risk</th>
              <th className="px-3 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(r => {
              const isSelected = r.object_id === selectedObjectId;
              return (
                <Fragment key={r.object_id}>
                  <tr
                    onClick={() => setSelectedObject(r.object_id)}
                    className={`border-b border-gray-800/50 cursor-pointer transition-all hover:bg-blue-900/10 ${isSelected ? 'bg-blue-900/20 border-blue-700/30' : ''}`}
                  >
                    <td className="px-3 py-2 text-gray-500 font-mono text-xs">{r.rank}</td>
                    <td className="px-3 py-2">
                      <div>
                        <p className="text-gray-200 font-mono text-xs font-semibold">{r.object_id}</p>
                        <p className="text-gray-500 text-xs truncate max-w-32">{r.name}</p>
                      </div>
                    </td>
                    <td className="px-3 py-2 font-mono text-xs text-gray-200">{r.min_distance_km.toFixed(2)} km</td>
                    <td className="px-3 py-2 font-mono text-xs text-gray-300">{r.tca_label}</td>
                    <td className="px-3 py-2 font-mono text-xs text-gray-300">{r.relative_velocity_km_s.toFixed(2)} km/s</td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 rounded-full bg-gray-800 w-16">
                          <div
                            className="h-1.5 rounded-full"
                            style={{
                              width: `${r.risk_score}%`,
                              backgroundColor:
                                r.risk_level === 'CRITICAL' ? '#ff2244'
                                : r.risk_level === 'HIGH' ? '#ff8800'
                                : r.risk_level === 'MODERATE' ? '#ffdd00'
                                : '#00ff88',
                            }}
                          />
                        </div>
                        <span className="font-mono text-xs text-gray-300">{r.risk_score}</span>
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <RiskBadge level={r.risk_level} size="sm" />
                    </td>
                    <td className="px-3 py-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); setShowExplanation(showExplanation === r.object_id ? null : r.object_id); }}
                        className="text-blue-400 hover:text-blue-300 text-xs font-mono"
                        title="Show explanation"
                      >
                        ℹ️
                      </button>
                    </td>
                  </tr>
                  {showExplanation === r.object_id && (
                    <tr key={`${r.object_id}-exp`} className="bg-gray-900/40">
                      <td colSpan={8} className="px-4 py-3">
                        <pre className="text-xs font-mono text-gray-400 whitespace-pre-wrap leading-relaxed">
                          {r.explanation}
                        </pre>
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <p className="text-center text-gray-600 font-mono text-sm py-8">No results matching filters</p>
        )}
      </div>
      <p className="text-right text-xs text-gray-600 font-mono mt-2">
        Showing {filtered.length} / {results.length} objects
      </p>
    </div>
  );
}
