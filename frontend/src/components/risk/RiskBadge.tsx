import type { RiskLevel } from '../../types';

interface Props {
  level: RiskLevel;
}

const LABELS: Record<RiskLevel, string> = {
  critical: 'CRITICAL',
  high: 'HIGH',
  moderate: 'MODERATE',
  low: 'LOW',
};

export function RiskBadge({ level }: Props) {
  const cls =
    level === 'critical' ? 'risk-critical font-bold' :
    level === 'high' ? 'risk-high font-bold' :
    level === 'moderate' ? 'risk-moderate' :
    'risk-low';

  return (
    <span className={`text-[11px] uppercase tracking-wider ${cls}`}>
      [{LABELS[level]}]
    </span>
  );
}
