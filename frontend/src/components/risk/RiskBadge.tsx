import type { RiskLevel } from '../../types';

interface RiskBadgeProps {
  level: RiskLevel;
  score?: number;
  size?: 'sm' | 'md' | 'lg';
  showScore?: boolean;
}

const BADGE_STYLES: Record<RiskLevel, { bg: string; text: string; border: string; glow: string; dot: string }> = {
  CRITICAL: {
    bg: 'bg-red-950/60',
    text: 'text-red-400',
    border: 'border-red-500/50',
    glow: 'shadow-[0_0_12px_rgba(239,68,68,0.35)]',
    dot: 'bg-red-500 animate-pulse',
  },
  HIGH: {
    bg: 'bg-orange-950/60',
    text: 'text-orange-400',
    border: 'border-orange-500/50',
    glow: 'shadow-[0_0_10px_rgba(249,115,22,0.3)]',
    dot: 'bg-orange-500',
  },
  MODERATE: {
    bg: 'bg-yellow-950/60',
    text: 'text-yellow-400',
    border: 'border-yellow-500/40',
    glow: 'shadow-[0_0_8px_rgba(234,179,8,0.25)]',
    dot: 'bg-yellow-400',
  },
  LOW: {
    bg: 'bg-emerald-950/60',
    text: 'text-emerald-400',
    border: 'border-emerald-500/40',
    glow: 'shadow-[0_0_8px_rgba(16,185,129,0.2)]',
    dot: 'bg-emerald-400',
  },
};

export function RiskBadge({ level, score, size = 'md', showScore = false }: RiskBadgeProps) {
  const style = BADGE_STYLES[level] || BADGE_STYLES.LOW;

  const sizeClass =
    size === 'sm'
      ? 'px-2 py-0.5 text-[10px]'
      : size === 'lg'
      ? 'px-3.5 py-1.5 text-sm'
      : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-mono font-semibold border ${style.bg} ${style.text} ${style.border} ${style.glow} ${sizeClass}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
      <span>{level}</span>
      {showScore && score !== undefined && (
        <span className="opacity-80 text-[10px] ml-0.5">({score})</span>
      )}
    </span>
  );
}
