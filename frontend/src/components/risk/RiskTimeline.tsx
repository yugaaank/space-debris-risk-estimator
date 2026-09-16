import type { CollisionRisk } from '../../types';

interface Props {
  risk: CollisionRisk;
  showObject?: boolean;
}

export function RiskTimeline({ risk, showObject = false }: Props) {
  return (
    <div className="terminal-border p-3 bg-[var(--bg)]">
      <div className="flex justify-between items-start mb-2">
        <div>
          {showObject && (
            <span className="text-[10px] text-[var(--dim)] block">
              {risk.object_name ?? risk.object_id}
            </span>
          )}
          <span className={`text-[13px] font-bold ${
            risk.risk_level === 'critical' ? 'text-[var(--critical)]' :
            risk.risk_level === 'high' ? 'text-[var(--high)]' :
            'text-[var(--muted)]'
          }`}>
            {risk.risk_level.toUpperCase()} RISK
          </span>
        </div>
        <span className="text-[10px] text-[var(--dim)]">
          {risk.closest_approach_time.replace('T', ' ').slice(0, 19)}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-px text-[11px]">
        <div className="border border-[var(--border)] p-2 bg-[var(--bg)]">
          <div className="text-[var(--dim)]">DISTANCE</div>
          <div className="font-bold">{risk.miss_distance_km.toFixed(1)} km</div>
        </div>
        <div className="border border-[var(--border)] p-2 bg-[var(--bg)]">
          <div className="text-[var(--dim)]">VELOCITY</div>
          <div className="font-bold">{risk.relative_velocity_km_s.toFixed(1)} km/s</div>
        </div>
        <div className="border border-[var(--border)] p-2 bg-[var(--bg)]">
          <div className="text-[var(--dim)]">PROB</div>
          <div className="font-bold">{risk.collision_probability.toExponential(2)}</div>
        </div>
      </div>

      <div className="flex justify-between mt-2 text-[10px] text-[var(--dim)]">
        <span>{risk.conjunction_type?.toUpperCase()}</span>
        <span>{risk.altitude_km.toFixed(0)} km ALT</span>
      </div>
    </div>
  );
}
