import {
  XAxis, YAxis, CartesianGrid, Tooltip,
  ReferenceLine, ResponsiveContainer, Area, AreaChart, ReferenceDot,
} from 'recharts';
import type { RiskEntry } from '../../types';
import { useSimulationStore } from '../../store/simulationStore';

interface Props {
  riskEntry: RiskEntry | null;
}

const RISK_ZONE_COLORS = {
  CRITICAL: '#ff2244',
  HIGH: '#ff8800',
  MODERATE: '#ffd700',
  LOW: '#00e87b',
};

// Threshold reference lines (km)
const THRESHOLDS = [
  { y: 5, label: 'CRITICAL', color: '#ff2244' },
  { y: 25, label: 'HIGH', color: '#ff8800' },
  { y: 100, label: 'MODERATE', color: '#ffd700' },
];

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="mission-panel p-2 text-[11px] font-mono"
      style={{ minWidth: 120, borderColor: 'rgba(56, 189, 248, 0.25)' }}>
      <p className="text-gray-500 mb-1">T+{label} min</p>
      <p className="text-cyan-300 font-bold">{payload[0]?.value?.toFixed(2)} km</p>
    </div>
  );
}

export function DistanceGraph({ riskEntry }: Props) {
  const { simulationTime } = useSimulationStore();

  if (!riskEntry) {
    return (
      <div className="mission-panel h-52 flex flex-col items-center justify-center gap-2">
        <span className="text-2xl opacity-20">📡</span>
        <p className="text-gray-600 text-xs font-mono">Select a debris object to view separation graph</p>
      </div>
    );
  }

  const data = riskEntry.separation_timeseries.map(pt => ({
    t: Math.round(pt.t / 60),
    d: Math.round(pt.d * 10) / 10,
  }));

  const minD = riskEntry.min_distance_km;
  const tcaMin = Math.round(riskEntry.time_of_ca_s / 60);
  const currentMin = Math.round(simulationTime / 60);
  const lineColor = RISK_ZONE_COLORS[riskEntry.risk_level];

  return (
    <div className="mission-panel">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="section-label text-[10px] mb-1">Separation Distance — {riskEntry.object_id}</h3>
          <p className="text-[10px] text-gray-600 font-mono">{riskEntry.name}</p>
        </div>
        <div className="flex gap-4 text-[11px] font-mono text-right">
          <div>
            <p className="text-gray-600 text-[9px] uppercase">Min Separation</p>
            <p className="font-bold" style={{ color: lineColor }}>{minD.toFixed(2)} km</p>
          </div>
          <div>
            <p className="text-gray-600 text-[9px] uppercase">TCA</p>
            <p className="text-blue-300 font-bold">{riskEntry.tca_label}</p>
          </div>
          <div>
            <p className="text-gray-600 text-[9px] uppercase">Score</p>
            <p className="font-bold" style={{ color: lineColor }}>{riskEntry.risk_score}/100</p>
          </div>
        </div>
      </div>
      
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={data} margin={{ top: 10, right: 15, left: -10, bottom: 5 }}>
          <defs>
            <linearGradient id="distGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={lineColor} stopOpacity={0.15} />
              <stop offset="95%" stopColor={lineColor} stopOpacity={0.01} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(56,189,248,0.06)" />
          <XAxis
            dataKey="t"
            tick={{ fill: '#374151', fontFamily: 'JetBrains Mono, monospace', fontSize: 9 }}
            axisLine={{ stroke: '#1f2937' }}
            tickLine={false}
            label={{ value: 'min', position: 'insideRight', offset: 12, fill: '#374151', fontSize: 9 }}
          />
          <YAxis
            tick={{ fill: '#374151', fontFamily: 'JetBrains Mono, monospace', fontSize: 9 }}
            axisLine={{ stroke: '#1f2937' }}
            tickLine={false}
            label={{ value: 'km', angle: -90, position: 'insideLeft', fill: '#374151', fontSize: 9 }}
          />
          <Tooltip content={<CustomTooltip />} />
          
          {/* Threshold reference lines */}
          {THRESHOLDS.map(t => (
            <ReferenceLine
              key={t.label}
              y={t.y}
              stroke={t.color}
              strokeDasharray="4 3"
              strokeOpacity={0.3}
              label={{ value: t.label, fill: t.color, fontFamily: 'monospace', fontSize: 8, opacity: 0.5 }}
            />
          ))}

          {/* TCA marker */}
          <ReferenceLine
            x={tcaMin}
            stroke={lineColor}
            strokeDasharray="5 3"
            strokeOpacity={0.8}
            label={{ value: 'TCA', fill: lineColor, fontFamily: 'monospace', fontSize: 9, position: 'top' }}
          />

          {/* Current sim time */}
          <ReferenceLine
            x={currentMin}
            stroke="rgba(56, 189, 248, 0.7)"
            strokeWidth={1.5}
          />

          <Area
            type="monotone"
            dataKey="d"
            stroke={lineColor}
            strokeWidth={2}
            fill="url(#distGradient)"
            dot={false}
            isAnimationActive={false}
          />

          {/* Min distance dot */}
          <ReferenceDot
            x={tcaMin}
            y={Math.round(minD * 10) / 10}
            r={4}
            fill={lineColor}
            stroke="rgba(10,20,40,0.8)"
            strokeWidth={1.5}
          />
        </AreaChart>
      </ResponsiveContainer>

      <p className="text-right text-[9px] text-gray-700 font-mono mt-1">
        Blue line = current sim time · Dashed = TCA · Faint lines = risk thresholds
      </p>
    </div>
  );
}
