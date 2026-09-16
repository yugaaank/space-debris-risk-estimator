import type { RiskLevel } from '../../types';

interface RiskBadgeProps {
  level: RiskLevel;
  score?: number;
  size?: 'sm' | 'md' | 'lg';
  showScore?: boolean;
}

const BADGE_STYLES: Record<RiskLevel, { bg: string; text: string; border: string; glow: string; dot: string }> = {
  CRITICAL: {
    bg: 'bg-red-500/15 backdrop-blur-md',
    text: 'text-red-200',
    border: 'border-red-400/35',
    glow: 'shadow-[inset_0_1px_1px_rgba(255,255,255,0.25),0_2px_12px_rgba(239,68,68,0.25)]',
    dot: 'bg-red-400 animate-pulse shadow-[0_0_6px_#f87171]',
  },
  HIGH: {
    bg: 'bg-orange-500/15 backdrop-blur-md',
    text: 'text-orange-200',
    border: 'border-orange-400/35',
    glow: 'shadow-[inset_0_1px_1px_rgba(255,255,255,0.22),0_2px_10px_rgba(249,115,22,0.2)]',
    dot: 'bg-orange-400 shadow-[0_0_6px_#fb923c]',
  },
  MODERATE: {
    bg: 'bg-amber-500/12 backdrop-blur-md',
    text: 'text-amber-200',
    border: 'border-amber-400/30',
    glow: 'shadow-[inset_0_1px_1px_rgba(255,255,255,0.2),0_2px_8px_rgba(245,158,11,0.18)]',
    dot: 'bg-amber-400 shadow-[0_0_6px_#fbbf24]',
  },
  LOW: {
    bg: 'bg-emerald-500/12 backdrop-blur-md',
    text: 'text-emerald-200',
    border: 'border-emerald-400/30',
    glow: 'shadow-[inset_0_1px_1px_rgba(255,255,255,0.2),0_2px_8px_rgba(16,185,129,0.18)]',
    dot: 'bg-emerald-400 shadow-[0_0_6px_#34d399]',
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
