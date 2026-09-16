# Shared UI Components

## RiskBadge
- **Source**: `src/components/risk/RiskBadge.tsx`
- **Description**: Renders a colored pill badge for risk levels (CRITICAL/HIGH/MODERATE/LOW) with glow effects
- **Props**: `level: RiskLevel`, `score?: number`, `size?: 'sm'|'md'|'lg'`, `showScore?: boolean`

```tsx
import type { RiskLevel } from '../../types';

interface RiskBadgeProps {
  level: RiskLevel;
  score?: number;
  size?: 'sm' | 'md' | 'lg';
  showScore?: boolean;
}

const BADGE_STYLES: Record<RiskLevel, { bg: string; text: string; border: string; glow: string; dot: string }> = {
  CRITICAL: {
    bg: 'bg-red-500/15 backdrop-blur-md',
    text: 'text-red-200',
    border: 'border-red-400/35',
    glow: 'shadow-[inset_0_1px_1px_rgba(255,255,255,0.25),0_2px_12px_rgba(239,68,68,0.25)]',
    dot: 'bg-red-400 animate-pulse shadow-[0_0_6px_#f87171]',
  },
  HIGH: {
    bg: 'bg-orange-500/15 backdrop-blur-md',
    text: 'text-orange-200',
    border: 'border-orange-400/35',
    glow: 'shadow-[inset_0_1px_1px_rgba(255,255,255,0.22),0_2px_10px_rgba(249,115,22,0.2)]',
    dot: 'bg-orange-400 shadow-[0_0_6px_#fb923c]',
  },
  MODERATE: {
    bg: 'bg-amber-500/12 backdrop-blur-md',
    text: 'text-amber-200',
    border: 'border-amber-400/30',
    glow: 'shadow-[inset_0_1px_1px_rgba(255,255,255,0.2),0_2px_8px_rgba(245,158,11,0.18)]',
    dot: 'bg-amber-400 shadow-[0_0_6px_#fbbf24]',
  },
  LOW: {
    bg: 'bg-emerald-500/12 backdrop-blur-md',
    text: 'text-emerald-200',
    border: 'border-emerald-400/30',
    glow: 'shadow-[inset_0_1px_1px_rgba(255,255,255,0.2),0_2px_8px_rgba(16,185,129,0.18)]',
    dot: 'bg-emerald-400 shadow-[0_0_6px_#34d399]',
  },
};

export function RiskBadge({ level, score, size = 'md', showScore = false }: RiskBadgeProps) {
  const style = BADGE_STYLES[level] || BADGE_STYLES.LOW;
  const sizeClass =
    size === 'sm' ? 'px-2 py-0.5 text-[10px]'
    : size === 'lg' ? 'px-3.5 py-1.5 text-sm'
    : 'px-2.5 py-1 text-xs';

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-mono font-semibold border ${style.bg} ${style.text} ${style.border} ${style.glow} ${sizeClass}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
      <span>{level}</span>
      {showScore && score !== undefined && (
        <span className="opacity-80 text-[10px] ml-0.5">({score})</span>
      )}
    </span>
  );
}
```

## RiskTable
- **Source**: `src/components/risk/RiskTable.tsx`
- **Description**: Sortable/filterable risk ranking table with inline explanation expansion and CSV export
- **Props**: `results: RiskEntry[]`

```tsx
import { useState, useMemo, Fragment } from 'react';
import type { RiskEntry, RiskLevel } from '../../types';
import { useSimulationStore } from '../../store/simulationStore';
import { RiskBadge } from './RiskBadge';

type SortKey = 'rank' | 'min_distance_km' | 'risk_score' | 'time_of_ca_s' | 'relative_velocity_km_s';

interface Props { results: RiskEntry[]; }

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
    if (filterLevel !== 'ALL') data = data.filter(r => r.risk_level === filterLevel);
    data.sort((a, b) => {
      const va = a[sortKey] as number; const vb = b[sortKey] as number;
      return sortDir === 'asc' ? va - vb : vb - va;
    });
    return data;
  }, [results, search, filterLevel, sortKey, sortDir]);

  const handleSort = (key: SortKey) => {
    if (key === sortKey) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };

  const Th = ({ label, k }: { label: string; k: SortKey }) => (
    <th className="px-3 py-2 text-left text-xs text-gray-400 font-mono uppercase tracking-wider cursor-pointer hover:text-blue-300 whitespace-nowrap" onClick={() => handleSort(k)}>
      {label} {sortKey === k ? (sortDir === 'asc' ? '↑' : '↓') : ''}
    </th>
  );

  return (
    <div className="glass-panel">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex flex-wrap gap-2 flex-1 min-w-[280px]">
          <input className="input-field flex-1 min-w-36 max-w-sm" placeholder="Search object ID or name..." value={search} onChange={e => setSearch(e.target.value)} />
          {(['ALL', 'CRITICAL', 'HIGH', 'MODERATE', 'LOW'] as const).map(level => (
            <button key={level} onClick={() => setFilterLevel(level)}
              className={`px-3 py-1.5 rounded-full text-xs font-mono border transition-all duration-200 cursor-pointer ${filterLevel === level ? 'bg-gradient-to-b from-cyan-400/30 to-cyan-600/20 border-cyan-400/50 text-cyan-200 shadow-[inset_0_1px_1px_rgba(255,255,255,0.3),0_2px_10px_rgba(6,182,212,0.25)]' : 'bg-white/[0.03] border-white/[0.08] text-gray-400 hover:border-white/[0.2] hover:text-gray-200 hover:bg-white/[0.06]'}`}>
              {level}
            </button>
          ))}
        </div>
      </div>
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
            {filtered.map(r => (
              <Fragment key={r.object_id}>
                <tr onClick={() => setSelectedObject(r.object_id)} className={`border-b border-white/[0.05] cursor-pointer transition-all duration-200 hover:bg-white/[0.05] hover:backdrop-blur-sm ${r.object_id === selectedObjectId ? 'bg-cyan-500/10 border-cyan-500/30' : ''}`}>
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
                        <div className="h-full rounded-full transition-all duration-300" style={{ width: `${r.risk_score}%`, backgroundColor: r.risk_level === 'CRITICAL' ? '#ff2244' : r.risk_level === 'HIGH' ? '#ff8800' : r.risk_level === 'MODERATE' ? '#ffdd00' : '#00e87b', boxShadow: `0 0 8px ${r.risk_level === 'CRITICAL' ? 'rgba(255,34,68,0.6)' : r.risk_level === 'HIGH' ? 'rgba(255,136,0,0.5)' : r.risk_level === 'MODERATE' ? 'rgba(255,221,0,0.5)' : 'rgba(0,232,123,0.5)'}` }} />
                      </div>
                      <span className="font-mono text-xs text-gray-200">{r.risk_score}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2.5"><RiskBadge level={r.risk_level} size="sm" /></td>
                  <td className="px-3 py-2.5">
                    <button onClick={(e) => { e.stopPropagation(); setShowExplanation(showExplanation === r.object_id ? null : r.object_id); }} className="text-cyan-400 hover:text-cyan-300 text-xs font-mono p-1 rounded-full hover:bg-white/10 transition-colors" title="Show explanation">ℹ️</button>
                  </td>
                </tr>
                {showExplanation === r.object_id && (
                  <tr className="bg-white/[0.02] border-b border-white/[0.08]">
                    <td colSpan={8} className="px-5 py-3">
                      <pre className="text-xs font-mono text-cyan-200/80 whitespace-pre-wrap leading-relaxed">{r.explanation}</pre>
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

## KpiCards
- **Source**: `src/components/dashboard/KpiCards.tsx`
- **Description**: Animated KPI dashboard cards with accent colors and number animation
- **Props**: `stats: SimulationStats | null`

```tsx
import { useEffect, useRef, useState } from 'react';
import type { SimulationStats } from '../../types';
import { motion } from 'framer-motion';

function AnimatedNumber({ value, decimals = 0, suffix = '', prefix = '', duration = 600 }: { value: number; decimals?: number; suffix?: string; prefix?: string; duration?: number }) {
  const [displayed, setDisplayed] = useState(value);
  const prevValue = useRef(value);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const start = prevValue.current; const end = value; const startTime = performance.now();
    const animate = (now: number) => {
      const elapsed = now - startTime; const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayed(start + (end - start) * eased);
      if (progress < 1) rafRef.current = requestAnimationFrame(animate);
      else prevValue.current = value;
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [value, duration]);

  return <span>{prefix}{displayed.toFixed(decimals)}{suffix}</span>;
}

const ACCENT_STYLES = {
  blue:   { bar: 'border-l-blue-500', shadow: 'shadow-blue-500/10', text: 'text-blue-400', bg: 'from-blue-500/5 to-transparent' },
  red:    { bar: 'border-l-red-500', shadow: 'shadow-red-500/15', text: 'text-red-400', bg: 'from-red-500/8 to-transparent' },
  orange: { bar: 'border-l-orange-500', shadow: 'shadow-orange-500/10', text: 'text-orange-400', bg: 'from-orange-500/5 to-transparent' },
  green:  { bar: 'border-l-emerald-500', shadow: 'shadow-emerald-500/10', text: 'text-emerald-400', bg: 'from-emerald-500/5 to-transparent' },
  purple: { bar: 'border-l-purple-500', shadow: 'shadow-purple-500/10', text: 'text-purple-400', bg: 'from-purple-500/5 to-transparent' },
  teal:   { bar: 'border-l-teal-500', shadow: 'shadow-teal-500/10', text: 'text-teal-400', bg: 'from-teal-500/5 to-transparent' },
};

function KpiCard({ label, value, displayValue, sub, accent = 'blue', icon, decimals = 0, suffix = '', alert = false }: {
  label: string; value: number; displayValue?: string; sub?: string; accent?: keyof typeof ACCENT_STYLES; icon?: string; decimals?: number; suffix?: string; alert?: boolean;
}) {
  const style = ACCENT_STYLES[accent];
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: 'easeOut' }}
      className={`kpi-card ${style.bar} shadow-xl ${style.shadow} ${alert ? 'animate-border-glow' : ''}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="hud-label mb-1.5">{label}</p>
          <p className={`text-2xl font-black font-mono leading-none ${style.text}`} style={{ fontFamily: "'Orbitron', 'JetBrains Mono', monospace" }}>
            {displayValue ? displayValue : <AnimatedNumber value={value} decimals={decimals} suffix={suffix} />}
          </p>
          {sub && <p className="text-[10px] text-gray-600 font-mono mt-1.5 truncate">{sub}</p>}
        </div>
        {icon && <span className="text-xl opacity-40 flex-shrink-0 ml-2">{icon}</span>}
      </div>
      <div className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r ${style.bg}`} />
    </motion.div>
  );
}

export function KpiCards({ stats }: { stats: SimulationStats | null }) {
  if (!stats) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {['Tracked Objects', 'High-Risk', 'Closest Approach', 'Next Critical', 'Window'].map((l) => (
          <div key={l} className="kpi-card border-l-2 border-l-gray-800 animate-pulse">
            <p className="hud-label mb-2">{l}</p>
            <p className="text-2xl font-black font-mono text-gray-700">—</p>
          </div>
        ))}
      </div>
    );
  }
  const highRisk = stats.critical_count + stats.high_count;
  function formatTime(seconds: number | null) {
    if (seconds === null) return '—';
    const m = Math.floor(seconds / 60);
    if (m > 60) return `${Math.floor(m / 60)}h ${m % 60}m`;
    return `${m}m ${Math.floor(seconds % 60)}s`;
  }
  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
      <KpiCard label="Tracked RSOs" value={stats.total_objects} sub="resident space objects" accent="blue" icon="🛰️" />
      <KpiCard label="High-Risk" value={highRisk} sub={`${stats.critical_count} CRITICAL · ${stats.high_count} HIGH`} accent={highRisk > 0 ? 'red' : 'green'} icon="⚠" alert={highRisk > 0} />
      <KpiCard label="Min Separation" value={stats.closest_approach_km ?? 0} decimals={1} suffix=" km" sub="closest approach" accent={stats.closest_approach_km !== null ? (stats.closest_approach_km < 5 ? 'red' : stats.closest_approach_km < 50 ? 'orange' : 'green') : 'blue'} icon="📡" />
      <KpiCard label="Next Critical" value={stats.next_critical_s ?? 0} displayValue={formatTime(stats.next_critical_s)} sub="time to event" accent="orange" icon="⏱" />
      <KpiCard label="Sim Window" value={stats.simulation_window_h} displayValue={`${stats.simulation_window_h}h`} sub={`${stats.n_timesteps.toLocaleString()} timesteps`} accent="purple" icon="⏰" />
    </div>
  );
}
```

## SystemStatus
- **Source**: `src/components/layout/SystemStatus.tsx`
- **Description**: Backend health status with compact (navbar) and full panel (popover) views, 30s polling
- **Exports**: `useSystemStatus`, `SystemStatusCompact`, `SystemStatusPanel`

```tsx
import { useState, useEffect, useCallback } from 'react';
import apiClient from '../../api/client';
import type { HealthStatus } from '../../types';

interface SystemState { status: 'checking' | 'online' | 'offline' | 'waking'; health: HealthStatus | null; lastChecked: Date | null; }

let cachedState: SystemState = { status: 'checking', health: null, lastChecked: null };
const listeners = new Set<(s: SystemState) => void>();
function notifyListeners() { listeners.forEach(l => l({ ...cachedState })); }
let checkTimer: ReturnType<typeof setTimeout> | null = null;

async function checkHealth() {
  try { const health = await apiClient.health(); cachedState = { status: 'online', health, lastChecked: new Date() }; }
  catch { cachedState = { status: 'offline', health: null, lastChecked: new Date() }; }
  notifyListeners();
  checkTimer = setTimeout(checkHealth, 30_000);
}
checkHealth();

export function useSystemStatus() {
  const [state, setState] = useState<SystemState>(cachedState);
  useEffect(() => { listeners.add(setState); setState({ ...cachedState }); return () => { listeners.delete(setState); }; }, []);
  const retry = useCallback(async () => { cachedState = { ...cachedState, status: 'waking' }; notifyListeners(); if (checkTimer) clearTimeout(checkTimer); await checkHealth(); }, []);
  return { ...state, retry };
}

export function SystemStatusCompact() {
  const { status, health } = useSystemStatus();
  const color = status === 'online' ? 'text-emerald-400' : status === 'waking' ? 'text-yellow-400' : status === 'checking' ? 'text-blue-400' : 'text-red-400';
  const dotClass = status === 'online' ? 'status-dot-green' : status === 'waking' ? 'status-dot-yellow' : status === 'checking' ? 'status-dot-yellow' : 'status-dot-red';
  const label = status === 'online' ? 'ONLINE' : status === 'waking' ? 'WAKING' : status === 'checking' ? '...' : 'OFFLINE';
  return (
    <div className="flex items-center gap-2">
      <span className={dotClass} />
      <span className={`text-[10px] font-mono font-bold tracking-widest ${color}`}>{label}</span>
      {status === 'online' && health && <span className="text-[10px] font-mono text-gray-600">{health.tracked_objects} RSOs</span>}
    </div>
  );
}

export function SystemStatusPanel() {
  const { status, health, retry } = useSystemStatus();
  const isOnline = status === 'online';
  return (
    <div className="mission-panel p-3 space-y-2 min-w-[200px]">
      <p className="section-label text-[10px]">System Status</p>
      <div className="space-y-1.5 text-[11px] font-mono">
        {[
          { label: 'Backend API', value: isOnline ? 'ONLINE' : (status === 'checking' ? 'CHECKING' : 'OFFLINE') },
          { label: 'Orbital Engine', value: health?.orbital_engine?.toUpperCase() ?? '—' },
          { label: 'Risk Engine', value: health?.risk_engine?.toUpperCase() ?? '—' },
          { label: 'Tracked Objects', value: health ? `${health.tracked_objects} RSOs` : '—' },
        ].map(({ label, value }) => (
          <div key={label} className="flex justify-between items-center">
            <span className="text-gray-500">{label}</span>
            <span className={value === 'ONLINE' || value.includes('RSOs') ? 'text-emerald-400 font-semibold' : value === 'OFFLINE' ? 'text-red-400 font-semibold' : value === 'CHECKING' ? 'text-yellow-400' : 'text-gray-300'}>{value}</span>
          </div>
        ))}
      </div>
      {!isOnline && status !== 'checking' && (
        <button onClick={retry} className="btn-secondary w-full text-[10px] py-1 mt-1">
          {status === 'waking' ? '⟳ Waking...' : '⟳ Retry Connection'}
        </button>
      )}
    </div>
  );
}
```

## SatelliteForm
- **Source**: `src/components/forms/SatelliteForm.tsx`
- **Description**: Form for editing satellite orbital parameters (altitude, inclination, phase, RAAN, eccentricity)
- **Props**: `onClose?: () => void`

```tsx
import { useState } from 'react';
import { useSimulationStore } from '../../store/simulationStore';

export function SatelliteForm({ onClose }: { onClose?: () => void }) {
  const { satellite, setSatellite } = useSimulationStore();
  const [form, setForm] = useState({ ...satellite });
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: name === 'object_id' || name === 'name' ? value : parseFloat(value) || 0 }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.altitude_km <= 0) { setError('Altitude must be positive'); return; }
    if (form.altitude_km > 50000) { setError('Altitude too high (max 50000 km)'); return; }
    setError('');
    setSatellite({ ...form, object_type: 'SATELLITE' });
    onClose?.();
  };

  const fields: { key: keyof typeof form; label: string; unit: string; min: number; max: number; step: number }[] = [
    { key: 'altitude_km', label: 'Altitude', unit: 'km', min: 100, max: 50000, step: 1 },
    { key: 'inclination_deg', label: 'Inclination', unit: '°', min: 0, max: 180, step: 0.1 },
    { key: 'phase_deg', label: 'Initial Phase (θ₀)', unit: '°', min: 0, max: 359.9, step: 0.1 },
    { key: 'raan_deg', label: 'RAAN (Ω)', unit: '°', min: 0, max: 359.9, step: 0.1 },
    { key: 'eccentricity', label: 'Eccentricity', unit: '', min: 0, max: 0.99, step: 0.001 },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        {(['object_id', 'name'] as const).map(key => (
          <div key={key}>
            <label className="block text-xs text-gray-400 font-mono mb-1 uppercase tracking-wider">{key === 'object_id' ? 'ID' : 'Name'}</label>
            <input name={key} value={form[key] as string} onChange={handleChange}
              className="w-full bg-gray-900/60 border border-gray-700 rounded px-3 py-1.5 text-sm text-gray-200 font-mono focus:outline-none focus:border-blue-500" />
          </div>
        ))}
      </div>
      {fields.map(({ key, label, unit, min, max, step }) => (
        <div key={key}>
          <label className="block text-xs text-gray-400 font-mono mb-1 uppercase tracking-wider">{label} {unit && <span className="text-gray-600">({unit})</span>}</label>
          <input type="number" name={key} value={form[key] as number} onChange={handleChange} min={min} max={max} step={step}
            className="w-full bg-gray-900/60 border border-gray-700 rounded px-3 py-1.5 text-sm text-gray-200 font-mono focus:outline-none focus:border-blue-500" />
        </div>
      ))}
      {error && <p className="text-red-400 text-xs font-mono">{error}</p>}
      <button type="submit" className="btn-primary w-full">Apply Satellite Parameters</button>
    </form>
  );
}
```

## SimulationConfig
- **Source**: `src/components/forms/SimulationConfig.tsx`
- **Description**: Simulation window and timestep parameter selectors
- **Props**: `onRun?: () => void`, `isLoading?: boolean`

```tsx
import { useSimulationStore } from '../../store/simulationStore';

export function SimulationConfig({ onRun, isLoading }: { onRun?: () => void; isLoading?: boolean }) {
  const { config, setConfig } = useSimulationStore();
  return (
    <div className="space-y-4 font-mono text-xs">
      <div>
        <label className="block text-gray-400 mb-1.5 uppercase tracking-wider font-semibold">Simulation Window (Hours)</label>
        <select value={config.window_hours} onChange={e => setConfig({ ...config, window_hours: parseFloat(e.target.value) })}
          className="w-full bg-gray-900/80 border border-blue-900/40 rounded px-3 py-2 text-gray-200 focus:outline-none focus:border-cyan-400 transition-colors">
          {[1, 6, 12, 24, 48, 72, 168].map(h => (
            <option key={h} value={h}>{h} hours {h === 24 ? '(Standard 1-Day)' : h === 168 ? '(7-Day Horizon)' : ''}</option>
          ))}
        </select>
        <p className="text-[10px] text-gray-500 mt-1">Duration of forward orbital propagation.</p>
      </div>
      <div>
        <label className="block text-gray-400 mb-1.5 uppercase tracking-wider font-semibold">Timestep Resolution (Seconds)</label>
        <select value={config.timestep_seconds} onChange={e => setConfig({ ...config, timestep_seconds: parseFloat(e.target.value) })}
          className="w-full bg-gray-900/80 border border-blue-900/40 rounded px-3 py-2 text-gray-200 focus:outline-none focus:border-cyan-400 transition-colors">
          {[10, 30, 60, 120, 300, 600].map(s => (
            <option key={s} value={s}>{s} seconds {s === 60 ? '(Recommended)' : s === 10 ? '(High Precision)' : ''}</option>
          ))}
        </select>
        <p className="text-[10px] text-gray-500 mt-1">Discrete sampling step for close-approach detection.</p>
      </div>
      {onRun && (
        <button onClick={onRun} disabled={isLoading} className="btn-primary w-full py-2.5 mt-2 text-xs">
          {isLoading ? '⟳ Propagating...' : '▶ Re-run Simulation with Parameters'}
        </button>
      )}
    </div>
  );
}
```

## CsvUpload
- **Source**: `src/components/forms/CsvUpload.tsx`
- **Description**: Drag-and-drop CSV file upload for custom debris objects
- **Props**: `onLoaded: (objects: OrbitalObjectInput[]) => void`

```tsx
import { useRef, useState } from 'react';
import apiClient from '../../api/client';
import type { OrbitalObjectInput } from '../../types';

export function CsvUpload({ onLoaded }: { onLoaded: (objects: OrbitalObjectInput[]) => void }) {
  const [dragging, setDragging] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!file.name.endsWith('.csv')) { setStatus('error'); setMessage('Only CSV files are accepted'); return; }
    setStatus('loading'); setMessage('Parsing...');
    try {
      const result = await apiClient.uploadDebris(file);
      if (result.errors.length > 0) {
        setStatus('error');
        setMessage(`Parsed ${result.parsed} objects. ${result.errors.length} errors:\n${result.errors.map((e: any) => `Row ${e.row}: ${e.error}`).join('\n')}`);
      } else { setStatus('success'); setMessage(`✓ Loaded ${result.parsed} debris objects`); onLoaded(result.objects); }
    } catch (err: any) { setStatus('error'); setMessage(err?.response?.data?.detail || 'Upload failed'); }
  };

  return (
    <div className="space-y-3">
      <div onDragOver={e => { e.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)}
        onDrop={e => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all ${dragging ? 'border-blue-400 bg-blue-900/10' : 'border-gray-700 hover:border-gray-500'}`}>
        <input ref={inputRef} type="file" accept=".csv" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
        <p className="text-gray-400 text-sm font-mono">📂 Drop CSV file or click to browse</p>
        <p className="text-gray-600 text-xs font-mono mt-1">Required columns: object_id, name, altitude_km, inclination_deg</p>
      </div>
      {message && (
        <div className={`rounded px-3 py-2 text-xs font-mono whitespace-pre-wrap ${status === 'success' ? 'bg-green-900/20 text-green-400 border border-green-700/30' : status === 'error' ? 'bg-red-900/20 text-red-400 border border-red-700/30' : 'bg-blue-900/10 text-blue-300'}`}>
          {status === 'loading' && <span className="animate-pulse">⟳ </span>}{message}
        </div>
      )}
    </div>
  );
}
```
