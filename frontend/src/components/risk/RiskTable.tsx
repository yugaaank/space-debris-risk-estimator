import type { RiskEntry } from '../../types';
import { RiskBadge } from './RiskBadge';

interface Props {
  risks: RiskEntry[];
  showObject?: boolean;
  compact?: boolean;
}

function formatTime(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function RiskTable({ risks, showObject = false, compact = false }: Props) {
  return (
    <div className="overflow-auto border border-[var(--border)]">
      <table>
        <thead>
          <tr>
            {showObject && <th>OBJECT</th>}
            {showObject && <th>NAME</th>}
            <th>TCA</th>
            <th>RISK</th>
            <th className="text-right">DISTANCE</th>
            <th className="text-right">RELATIVE V</th>
            {!compact && <th className="text-right">SCORE</th>}
          </tr>
        </thead>
        <tbody>
          {risks.map((risk, idx) => (
            <tr key={idx}>
              {showObject && (
                <>
                  <td className="text-[var(--dim)]">{risk.object_id}</td>
                  <td>{risk.name}</td>
                </>
              )}
              <td className="text-[var(--dim)]">{risk.tca_label}</td>
              <td><RiskBadge level={risk.risk_level} /></td>
              <td className="text-right font-bold">{risk.min_distance_km.toFixed(1)} km</td>
              <td className="text-right font-bold">{risk.relative_velocity_km_s.toFixed(2)} km/s</td>
              {!compact && (
                <td className="text-right text-[var(--dim)]">
                  {risk.risk_score.toFixed(1)}
                </td>
              )}
            </tr>
          ))}
          {risks.length === 0 && (
            <tr>
              <td
                colSpan={showObject ? 7 : 5}
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
