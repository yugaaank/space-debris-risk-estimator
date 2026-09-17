import type { SpaceDebris } from '../../types';
import { useNavigate } from 'react-router-dom';

interface Props {
  debris: SpaceDebris;
  onClose?: () => void;
  isNavigating?: boolean;
  onNavigate?: () => void;
  style?: React.CSSProperties;
}

export function DebrisCard({ debris, onClose, isNavigating = false, onNavigate, style }: Props) {
  const navigate = useNavigate();

  const handleSimulate = () => {
    navigate(`/simulation?objectId=${debris.id}`);
  };

  return (
    <div
      className="terminal-border p-4 bg-[var(--bg)]"
      style={style}
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <div className="text-[11px] text-[var(--dim)] mb-0.5">
            {debris.id}
          </div>
          <div className="text-[13px] font-bold mb-1">
            {debris.name}
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-[var(--dim)] hover:text-[var(--fg)] text-[14px] leading-none cursor-pointer bg-transparent border-none"
          >
            x
          </button>
        )}
      </div>

      <div className="space-y-1 mb-3 text-[11px]">
        <div className="flex justify-between">
          <span className="text-[var(--dim)]">ALT</span>
          <span className="font-bold">{debris.altitude.toFixed(1)} km</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[var(--dim)]">INC</span>
          <span className="font-bold">{debris.inclination.toFixed(1)}°</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[var(--dim)]">PER</span>
          <span className="font-bold">{debris.period_minutes.toFixed(1)} min</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[var(--dim)]">RAAN</span>
          <span className="font-bold">{debris.ascending_node_deg.toFixed(1)}°</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[var(--dim)]">TYPE</span>
          <span className="text-[var(--muted)]">[{debris.object_type.toUpperCase()}]</span>
        </div>
      </div>

      <div className="flex gap-0">
        <button
          onClick={handleSimulate}
          disabled={isNavigating}
          className={`flex-1 py-1.5 text-[10px] font-bold border border-[var(--border)] cursor-pointer ${
            isNavigating
              ? 'bg-[#1a1a1a] text-[var(--dim)] cursor-wait'
              : 'bg-transparent text-[var(--fg)] hover:bg-[#1a1a1a]'
          }`}
        >
          {isNavigating ? 'LOADING...' : 'SIMULATE'}
        </button>
        <button
          onClick={onNavigate}
          disabled={isNavigating}
          className="flex-1 py-1.5 text-[10px] font-bold border border-[var(--border)] border-l-0 bg-transparent text-[var(--dim)] hover:text-[var(--fg)] hover:bg-[#1a1a1a] cursor-pointer"
        >
          ZOOM
        </button>
      </div>
    </div>
  );
}
