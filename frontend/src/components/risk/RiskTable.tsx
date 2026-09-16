import type { CollisionRisk } from '../../types';
import { RiskBadge } from './RiskBadge';

interface Props {
  risks: CollisionRisk[];
  showObject?: boolean;
  compact?: boolean;
}

function formatTime(t?: string) {
  if (!t) return '—';
  return t.replace('T', ' ').slice(0, 19);
}

export function RiskTable({ risks, showObject = false, compact = false }: Props) {
  return (
    <div className="overflow-auto terminal-border">
      <table>
        <thead>
          <tr>
            {showObject && <th>OBJECT</th>}
            {showObject && <th>NAME</th>}
            <th>EVENT TIME</th>
            <th>RISK</th>
            <th className="text-right">DISTANCE</th>
            <th className="text-right">RELATIVE V</th>
            {!compact && <th className="text-right">PROB.</th>}
            {!compact && <th>TYPE</th>}
          </tr>
        </thead>
        <tbody>
          {risks.map((risk, idx) => (
            <tr key={idx}>
              {showObject && (
                <>
                  <td className="text-[var(--dim)]">{risk.object_id}</td>
                  <td>{risk.object_name ?? risk.object_id}</td>
                </>
              )}
              <td className="text-[var(--dim)]">{formatTime(risk.closest_approach_time)}</td>
              <td><RiskBadge level={risk.risk_level} /></td>
              <td className="text-right font-bold">{risk.miss_distance_km.toFixed(1)} km</td>
              <td className="text-right font-bold">{risk.relative_velocity_km_s.toFixed(2)} km/s</td>
              {!compact && (
                <>
                  <td className="text-right text-[var(--dim)]">
                    {risk.collision_probability.toExponential(2)}
                  </td>
                  <td className="text-[var(--dim)]">{risk.conjunction_type}</td>
                </>
              )}
            </tr>
          ))}
          {risks.length === 0 && (
            <tr>
              <td
                colSpan={showObject ? 9 : 7}
                className="text-center text-[var(--dim)] py-8"
              >
                NO DATA AVAILABLE
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
