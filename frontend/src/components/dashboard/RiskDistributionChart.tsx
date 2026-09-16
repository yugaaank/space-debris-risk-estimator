import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { SimulationStats } from '../../types';

const COLORS = {
  CRITICAL: '#ff2244',
  HIGH: '#ff8800',
  MODERATE: '#ffdd00',
  LOW: '#00ff88',
};

interface Props {
  stats: SimulationStats | null;
}

export function RiskDistributionChart({ stats }: Props) {
  if (!stats) {
    return (
      <div className="glass-panel h-48 flex items-center justify-center">
        <p className="text-gray-500 text-sm font-mono">Run simulation to see risk distribution</p>
      </div>
    );
  }

  const data = [
    { name: 'CRITICAL', value: stats.critical_count, color: COLORS.CRITICAL },
    { name: 'HIGH', value: stats.high_count, color: COLORS.HIGH },
    { name: 'MODERATE', value: stats.moderate_count, color: COLORS.MODERATE },
    { name: 'LOW', value: stats.low_count, color: COLORS.LOW },
  ].filter(d => d.value > 0);

  return (
    <div className="glass-panel">
      <h3 className="text-xs text-gray-400 uppercase tracking-widest font-mono mb-3">Risk Distribution</h3>
      <ResponsiveContainer width="100%" height={180}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={45}
            outerRadius={70}
            paddingAngle={3}
            dataKey="value"
          >
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.color} stroke="transparent" />
            ))}
          </Pie>
          <Tooltip
            formatter={(v: any, name: any) => [v, name]}
            contentStyle={{
              background: 'rgba(10,20,40,0.95)',
              border: '1px solid rgba(100,150,255,0.2)',
              borderRadius: 6,
              fontFamily: 'monospace',
              fontSize: 11,
              color: '#cce8ff',
            }}
          />
          <Legend
            formatter={(value) => (
              <span style={{ color: '#aac', fontFamily: 'monospace', fontSize: 11 }}>{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
      <p className="text-center text-xs text-gray-600 mt-1 font-mono">
        Demo classification — NOT operational thresholds
      </p>
    </div>
  );
}
