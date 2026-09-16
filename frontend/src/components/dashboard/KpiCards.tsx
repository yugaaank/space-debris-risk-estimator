import type { SimulationStats } from '../../types';

interface KpiCardProps {
  label: string;
  value: string | number;
  sub?: string;
  accent?: 'blue' | 'red' | 'orange' | 'green' | 'purple';
  icon?: string;
}

const ACCENT_CLASSES: Record<string, string> = {
  blue:   'border-blue-500 shadow-blue-500/20',
  red:    'border-red-500 shadow-red-500/20',
  orange: 'border-orange-500 shadow-orange-500/20',
  green:  'border-green-500 shadow-green-500/20',
  purple: 'border-purple-500 shadow-purple-500/20',
};

const ACCENT_TEXT: Record<string, string> = {
  blue:   'text-blue-400',
  red:    'text-red-400',
  orange: 'text-orange-400',
  green:  'text-green-400',
  purple: 'text-purple-400',
};

function KpiCard({ label, value, sub, accent = 'blue', icon }: KpiCardProps) {
  return (
    <div className={`kpi-card border ${ACCENT_CLASSES[accent]}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-widest font-mono mb-1">{label}</p>
          <p className={`text-3xl font-bold font-mono ${ACCENT_TEXT[accent]}`}>{value}</p>
          {sub && <p className="text-xs text-gray-500 mt-1 font-mono">{sub}</p>}
        </div>
        {icon && <span className="text-2xl opacity-60">{icon}</span>}
      </div>
    </div>
  );
}

interface KpiCardsProps {
  stats: SimulationStats | null;
}

function formatTime(seconds: number | null) {
  if (seconds === null) return '—';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  if (m > 60) {
    return `${Math.floor(m / 60)}h ${m % 60}m`;
  }
  return `${m}m ${s}s`;
}

export function KpiCards({ stats }: KpiCardsProps) {
  if (!stats) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {['Tracked Objects', 'High-Risk', 'Closest Approach', 'Next Critical', 'Window'].map(l => (
          <div key={l} className="kpi-card border border-gray-700 animate-pulse">
            <p className="text-xs text-gray-500 uppercase tracking-widest font-mono mb-1">{l}</p>
            <p className="text-3xl font-bold font-mono text-gray-600">—</p>
          </div>
        ))}
      </div>
    );
  }

  const highRisk = stats.critical_count + stats.high_count;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
      <KpiCard
        label="Tracked Objects"
        value={stats.total_objects}
        sub="debris objects"
        accent="blue"
        icon="🛰️"
      />
      <KpiCard
        label="High-Risk"
        value={highRisk}
        sub={`${stats.critical_count} critical · ${stats.high_count} high`}
        accent={highRisk > 0 ? 'red' : 'green'}
        icon="⚠️"
      />
      <KpiCard
        label="Closest Approach"
        value={stats.closest_approach_km !== null ? `${stats.closest_approach_km.toFixed(1)} km` : '—'}
        sub="minimum separation"
        accent={
          stats.closest_approach_km !== null
            ? stats.closest_approach_km < 5 ? 'red'
              : stats.closest_approach_km < 50 ? 'orange'
              : 'green'
            : 'blue'
        }
        icon="📡"
      />
      <KpiCard
        label="Next Critical"
        value={formatTime(stats.next_critical_s)}
        sub="time to closest high-risk"
        accent="orange"
        icon="⏱️"
      />
      <KpiCard
        label="Sim Window"
        value={`${stats.simulation_window_h}h`}
        sub={`${stats.n_timesteps.toLocaleString()} steps`}
        accent="purple"
        icon="🕐"
      />
    </div>
  );
}
