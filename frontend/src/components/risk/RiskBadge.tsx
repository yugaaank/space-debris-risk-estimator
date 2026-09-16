import type { RiskLevel } from '../../types';

interface Props {
  level: RiskLevel;
}

export function RiskBadge({ level }: Props) {
  const upper = level.toUpperCase();
  const cls =
    upper === 'CRITICAL' ? 'risk-critical font-bold' :
    upper === 'HIGH' ? 'risk-high font-bold' :
    upper === 'MODERATE' ? 'risk-moderate' :
    'risk-low';

  return (
    <span className={`text-[11px] uppercase tracking-wider ${cls}`}>
      [{upper}]
    </span>
  );
}
