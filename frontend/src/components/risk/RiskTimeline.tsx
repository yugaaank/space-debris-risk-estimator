import type { RiskEntry } from '../../types';

interface Props {
  risk: RiskEntry;
  showObject?: boolean;
}

export function RiskTimeline({ risk, showObject = false }: Props) {
  return (
    <div className="border border-[var(--border)] p-3 bg-[var(--bg)]">
      <div className="flex justify-between items-start mb-2">
        <div>
          {showObject && (
            <span className="text-[10px] text-[var(--dim)] block">
              {risk.name}
            </span>
          )}
          <span className={`text-[13px] font-bold ${
            risk.risk_level.toUpperCase() === 'CRITICAL' ? 'text-[var(--critical)]' :
            risk.risk_level.toUpperCase() === 'HIGH' ? 'text-[var(--high)]' :
            'text-[var(--muted)]'
          }`}>
            {risk.risk_level.toUpperCase()} RISK
          </span>
        </div>
        <span className="text-[10px] text-[var(--dim)]">
          {risk.tca_label}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-px text-[11px]">
        <div className="border border-[var(--border)] p-2 bg-[var(--bg)]">
          <div className="text-[var(--dim)]">DISTANCE</div>
          <div className="font-bold">{risk.min_distance_km.toFixed(1)} km</div>
        </div>
        <div className="border border-[var(--border)] p-2 bg-[var(--bg)]">
          <div className="text-[var(--dim)]">VELOCITY</div>
          <div className="font-bold">{risk.relative_velocity_km_s.toFixed(1)} km/s</div>
        </div>
        <div className="border border-[var(--border)] p-2 bg-[var(--bg)]">
          <div className="text-[var(--dim)]">SCORE</div>
          <div className="font-bold">{risk.risk_score.toFixed(1)}</div>
        </div>
      </div>
    </div>
  );
}
