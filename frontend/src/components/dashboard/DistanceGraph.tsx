import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ReferenceLine, ResponsiveContainer,
} from 'recharts';
import type { RiskEntry } from '../../types';
import { useSimulationStore } from '../../store/simulationStore';

interface Props {
  riskEntry: RiskEntry | null;
}

export function DistanceGraph({ riskEntry }: Props) {
  const { simulationTime } = useSimulationStore();

  if (!riskEntry) {
    return (
      <div className="glass-panel h-52 flex items-center justify-center">
        <p className="text-gray-500 text-sm font-mono">Select a debris object to view distance graph</p>
      </div>
    );
  }

  const data = riskEntry.separation_timeseries.map(pt => ({
    t: Math.round(pt.t / 60), // minutes
    d: Math.round(pt.d * 10) / 10,
  }));

  const minD = riskEntry.min_distance_km;
  const tcaMin = Math.round(riskEntry.time_of_ca_s / 60);
  const currentMin = Math.round(simulationTime / 60);

  const lineColor =
    riskEntry.risk_level === 'CRITICAL' ? '#ff2244'
    : riskEntry.risk_level === 'HIGH' ? '#ff8800'
    : riskEntry.risk_level === 'MODERATE' ? '#ffdd00'
    : '#00ff88';

  return (
    <div className="glass-panel">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs text-gray-400 uppercase tracking-widest font-mono">
          Distance — {riskEntry.object_id}
        </h3>
        <div className="flex gap-3 text-xs font-mono">
          <span className="text-gray-400">Min: <span style={{ color: lineColor }}>{minD.toFixed(2)} km</span></span>
          <span className="text-gray-400">TCA: <span className="text-blue-300">{riskEntry.tca_label}</span></span>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={170}>
        <LineChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,150,255,0.08)" />
          <XAxis
            dataKey="t"
            tick={{ fill: '#666', fontFamily: 'monospace', fontSize: 10 }}
            label={{ value: 'min', position: 'insideRight', offset: 10, fill: '#555', fontSize: 10 }}
          />
          <YAxis
            tick={{ fill: '#666', fontFamily: 'monospace', fontSize: 10 }}
            label={{ value: 'km', angle: -90, position: 'insideLeft', fill: '#555', fontSize: 10 }}
          />
          <Tooltip
            formatter={(v: any) => [`${v} km`, 'Distance']}
            labelFormatter={(l: any) => `T+${l}min`}
            contentStyle={{
              background: 'rgba(10,20,40,0.95)',
              border: '1px solid rgba(100,150,255,0.2)',
              borderRadius: 6,
              fontFamily: 'monospace',
              fontSize: 11,
              color: '#cce8ff',
            }}
          />
          {/* Closest approach marker */}
          <ReferenceLine
            x={tcaMin}
            stroke={lineColor}
            strokeDasharray="4 2"
            label={{ value: 'TCA', fill: lineColor, fontFamily: 'monospace', fontSize: 10 }}
          />
          {/* Current simulation time */}
          <ReferenceLine
            x={currentMin}
            stroke="rgba(100,200,255,0.6)"
            strokeWidth={1.5}
          />
          <Line
            type="monotone"
            dataKey="d"
            stroke={lineColor}
            dot={false}
            strokeWidth={2}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
