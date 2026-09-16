import { useEffect, useRef, useState } from 'react';
import type { SimulationStats } from '../../types';
import { motion } from 'framer-motion';

interface AnimatedNumberProps {
  value: number;
  decimals?: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
}

function AnimatedNumber({ value, decimals = 0, suffix = '', prefix = '', duration = 600 }: AnimatedNumberProps) {
  const [displayed, setDisplayed] = useState(value);
  const prevValue = useRef(value);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const start = prevValue.current;
    const end = value;
    const startTime = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // easeOut cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = start + (end - start) * eased;
      setDisplayed(current);
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        prevValue.current = value;
      }
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [value, duration]);

  return (
    <span>
      {prefix}{displayed.toFixed(decimals)}{suffix}
    </span>
  );
}

interface KpiCardProps {
  label: string;
  value: number;
  displayValue?: string;
  sub?: string;
  accent?: 'blue' | 'red' | 'orange' | 'green' | 'purple' | 'teal';
  icon?: string;
  decimals?: number;
  suffix?: string;
  alert?: boolean;
}

const ACCENT_STYLES = {
  blue:   { bar: 'border-l-blue-500', shadow: 'shadow-blue-500/10', text: 'text-blue-400', bg: 'from-blue-500/5 to-transparent' },
  red:    { bar: 'border-l-red-500', shadow: 'shadow-red-500/15', text: 'text-red-400', bg: 'from-red-500/8 to-transparent' },
  orange: { bar: 'border-l-orange-500', shadow: 'shadow-orange-500/10', text: 'text-orange-400', bg: 'from-orange-500/5 to-transparent' },
  green:  { bar: 'border-l-emerald-500', shadow: 'shadow-emerald-500/10', text: 'text-emerald-400', bg: 'from-emerald-500/5 to-transparent' },
  purple: { bar: 'border-l-purple-500', shadow: 'shadow-purple-500/10', text: 'text-purple-400', bg: 'from-purple-500/5 to-transparent' },
  teal:   { bar: 'border-l-teal-500', shadow: 'shadow-teal-500/10', text: 'text-teal-400', bg: 'from-teal-500/5 to-transparent' },
};

function KpiCard({ label, value, displayValue, sub, accent = 'blue', icon, decimals = 0, suffix = '', alert = false }: KpiCardProps) {
  const style = ACCENT_STYLES[accent];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className={`kpi-card ${style.bar} shadow-xl ${style.shadow} ${alert ? 'animate-border-glow' : ''}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="hud-label mb-1.5">{label}</p>
          <p className={`text-2xl font-black font-mono leading-none ${style.text}`}
            style={{ fontFamily: "'Orbitron', 'JetBrains Mono', monospace" }}>
            {displayValue ? displayValue : (
              <AnimatedNumber value={value} decimals={decimals} suffix={suffix} />
            )}
          </p>
          {sub && <p className="text-[10px] text-gray-600 font-mono mt-1.5 truncate">{sub}</p>}
        </div>
        {icon && (
          <span className="text-xl opacity-40 flex-shrink-0 ml-2">{icon}</span>
        )}
      </div>
      {/* Decorative bottom gradient */}
      <div className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r ${style.bg}`} />
    </motion.div>
  );
}

interface KpiCardsProps {
  stats: SimulationStats | null;
}

function formatTime(seconds: number | null) {
  if (seconds === null) return '—';
  const m = Math.floor(seconds / 60);
  if (m > 60) return `${Math.floor(m / 60)}h ${m % 60}m`;
  return `${m}m ${Math.floor(seconds % 60)}s`;
}

export function KpiCards({ stats }: KpiCardsProps) {
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

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
      <KpiCard
        label="Tracked RSOs"
        value={stats.total_objects}
        sub="resident space objects"
        accent="blue"
        icon="🛰️"
      />
      <KpiCard
        label="High-Risk"
        value={highRisk}
        sub={`${stats.critical_count} CRITICAL · ${stats.high_count} HIGH`}
        accent={highRisk > 0 ? 'red' : 'green'}
        icon="⚠"
        alert={highRisk > 0}
      />
      <KpiCard
        label="Min Separation"
        value={stats.closest_approach_km ?? 0}
        displayValue={stats.closest_approach_km !== null ? undefined : '—'}
        decimals={1}
        suffix=" km"
        sub="closest approach"
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
        value={stats.next_critical_s ?? 0}
        displayValue={formatTime(stats.next_critical_s)}
        sub="time to event"
        accent="orange"
        icon="⏱"
      />
      <KpiCard
        label="Sim Window"
        value={stats.simulation_window_h}
        displayValue={`${stats.simulation_window_h}h`}
        sub={`${stats.n_timesteps.toLocaleString()} timesteps`}
        accent="purple"
        icon="⏰"
      />
    </div>
  );
}
