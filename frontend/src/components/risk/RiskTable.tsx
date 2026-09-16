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

  const exportCsv = () => {
    const headers = ['Rank', 'Object ID', 'Name', 'Min Distance (km)', 'TCA (s)', 'Relative Velocity (km/s)', 'Risk Score', 'Risk Level'];
    const rows = filtered.map(r => [
      r.rank,
      r.object_id,
      `"${r.name.replace(/"/g, '""')}"`,
      r.min_distance_km.toFixed(2),
      r.time_of_ca_s.toFixed(1),
      r.relative_velocity_km_s.toFixed(2),
      r.risk_score,
      r.risk_level,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `orbital_shield_risk_report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="glass-panel">
      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex flex-wrap gap-2 flex-1 min-w-[280px]">
          <input
            className="input-field flex-1 min-w-36 max-w-sm"
            placeholder="Search object ID or name..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {(['ALL', 'CRITICAL', 'HIGH', 'MODERATE', 'LOW'] as const).map(level => (
            <button
              key={level}
              onClick={() => setFilterLevel(level)}
              className={`px-3 py-1.5 rounded-full text-xs font-mono border transition-all duration-200 cursor-pointer ${filterLevel === level
                ? 'bg-gradient-to-b from-cyan-400/30 to-cyan-600/20 border-cyan-400/50 text-cyan-200 shadow-[inset_0_1px_1px_rgba(255,255,255,0.3),0_2px_10px_rgba(6,182,212,0.25)]'
                : 'bg-white/[0.03] border-white/[0.08] text-gray-400 hover:border-white/[0.2] hover:text-gray-200 hover:bg-white/[0.06]'}`}
            >
              {level}
            </button>
          ))}
        </div>
        <button
          onClick={exportCsv}
          className="btn-secondary text-xs px-3.5 py-1.5 flex items-center gap-1.5 font-mono text-cyan-200"
          title="Export as CSV"
        >
          <span>⇲</span> Export CSV
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/[0.08]">
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
                    className={`border-b border-white/[0.05] cursor-pointer transition-all duration-200 hover:bg-white/[0.05] hover:backdrop-blur-sm ${isSelected ? 'bg-cyan-500/10 border-cyan-500/30' : ''}`}
                  >
                    <td className="px-3 py-2.5 text-gray-500 font-mono text-xs">{r.rank}</td>
                    <td className="px-3 py-2.5">
                      <div>
                        <p className="text-gray-100 font-mono text-xs font-semibold">{r.object_id}</p>
                        <p className="text-gray-400 text-xs truncate max-w-32">{r.name}</p>
                      </div>
                    </td>
                    <td className="px-3 py-2.5 font-mono text-xs text-gray-100">{r.min_distance_km.toFixed(2)} km</td>
                    <td className="px-3 py-2.5 font-mono text-xs text-gray-300">{r.tca_label}</td>
                    <td className="px-3 py-2.5 font-mono text-xs text-gray-300">{r.relative_velocity_km_s.toFixed(2)} km/s</td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-2">
                        <div className="h-2 rounded-full bg-white/[0.08] shadow-[inset_0_1px_2px_rgba(0,0,0,0.4)] w-20 overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-300"
                            style={{
                              width: `${r.risk_score}%`,
                              backgroundColor:
                                r.risk_level === 'CRITICAL' ? '#ff2244'
                                : r.risk_level === 'HIGH' ? '#ff8800'
                                : r.risk_level === 'MODERATE' ? '#ffdd00'
                                : '#00e87b',
                              boxShadow: `0 0 8px ${
                                r.risk_level === 'CRITICAL' ? 'rgba(255,34,68,0.6)'
                                : r.risk_level === 'HIGH' ? 'rgba(255,136,0,0.5)'
                                : r.risk_level === 'MODERATE' ? 'rgba(255,221,0,0.5)'
                                : 'rgba(0,232,123,0.5)'
                              }`,
                            }}
                          />
                        </div>
                        <span className="font-mono text-xs text-gray-200">{r.risk_score}</span>
                      </div>
                    </td>
                    <td className="px-3 py-2.5">
                      <RiskBadge level={r.risk_level} size="sm" />
                    </td>
                    <td className="px-3 py-2.5">
                      <button
                        onClick={(e) => { e.stopPropagation(); setShowExplanation(showExplanation === r.object_id ? null : r.object_id); }}
                        className="text-cyan-400 hover:text-cyan-300 text-xs font-mono p-1 rounded-full hover:bg-white/10 transition-colors"
                        title="Show explanation"
                      >
                        ℹ️
                      </button>
                    </td>
                  </tr>
                  {showExplanation === r.object_id && (
                    <tr key={`${r.object_id}-exp`} className="bg-white/[0.02] border-b border-white/[0.08]">
                      <td colSpan={8} className="px-5 py-3">
                        <pre className="text-xs font-mono text-cyan-200/80 whitespace-pre-wrap leading-relaxed">
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
