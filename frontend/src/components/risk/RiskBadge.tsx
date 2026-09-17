import type { RiskLevel } from '../../types';

interface Props {
  level: RiskLevel;
  size?: string;
  score?: number;
  showScore?: boolean;
}

export function RiskBadge({ level, score, showScore }: Props) {
  const upper = level.toUpperCase();
  const cls =
    upper === 'CRITICAL' ? 'risk-critical font-bold' :
    upper === 'HIGH' ? 'risk-high font-bold' :
    upper === 'MODERATE' ? 'risk-moderate' :
    'risk-low';

  return (
    <span className={`text-[11px] uppercase tracking-wider ${cls}`}>
      [{upper}]
      {showScore && score !== undefined && (
        <span className="ml-1 text-[var(--dim)]">{score.toFixed(0)}</span>
      )}
    </span>
  );
}
