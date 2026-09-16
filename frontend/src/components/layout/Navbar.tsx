import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSimulationStore } from '../../store/simulationStore';
import { SystemStatusCompact, SystemStatusPanel } from './SystemStatus';

const NAV_LINKS = [
  { to: '/', label: 'HOME' },
  { to: '/simulation', label: 'SIM' },
  { to: '/risk', label: 'RISK' },
  { to: '/objects', label: 'OBJECTS' },
  { to: '/methodology', label: 'DOCS' },
];

function MissionClock() {
  const [time, setTime] = useState(() => {
    const d = new Date();
    return `${String(d.getUTCHours()).padStart(2,'0')}:${String(d.getUTCMinutes()).padStart(2,'0')}:${String(d.getUTCSeconds()).padStart(2,'0')}`;
  });

  useEffect(() => {
    const tick = () => {
      const d = new Date();
      setTime(`${String(d.getUTCHours()).padStart(2,'0')}:${String(d.getUTCMinutes()).padStart(2,'0')}:${String(d.getUTCSeconds()).padStart(2,'0')}`);
    };
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return <span className="text-[11px] text-[var(--dim)]">{time} UTC</span>;
}

export function Navbar() {
  const location = useLocation();
  const { status, result } = useSimulationStore();
  const [showStatus, setShowStatus] = useState(false);
  const statusRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (statusRef.current && !statusRef.current.contains(e.target as Node)) {
        setShowStatus(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const simLabel =
    status === 'running' ? 'COMPUTING' :
    status === 'complete' ? `${result?.risks?.length ?? 0} RISKS` :
    status === 'error' ? 'ERROR' : 'READY';

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-12 border-b-[3px] border-[var(--fg)] bg-[var(--bg)]">
      <div className="max-w-[1200px] mx-auto h-full flex items-center justify-between px-6">
        {/* Left: logo */}
        <Link to="/" className="no-underline shrink-0">
          <span className="text-[14px] font-extrabold text-[var(--fg)] tracking-tight">
            ORBITAL_SHIELD
          </span>
        </Link>

        {/* Center: nav links */}
        <div className="hidden md:flex items-center gap-0">
          {NAV_LINKS.map(link => {
            const isActive = location.pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`px-3 py-1.5 text-[11px] font-bold no-underline border-x border-[var(--border)] first:border-l-0 last:border-r-0 ${
                  isActive
                    ? 'bg-[var(--fg)] text-[var(--bg)]'
                    : 'text-[var(--dim)] hover:text-[var(--fg)] hover:bg-[#111]'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* Right: clock + sim status + system status */}
        <div className="flex items-center gap-4">
          <MissionClock />
          <span className={`text-[10px] font-bold hidden sm:inline ${
            status === 'running' ? 'text-[var(--high)]' :
            status === 'complete' ? 'text-[#00cc00]' :
            status === 'error' ? 'text-[var(--critical)]' :
            'text-[var(--dim)]'
          }`}>
            {simLabel}
          </span>
          <div ref={statusRef} className="relative">
            <button
              onClick={() => setShowStatus(v => !v)}
              className="flex items-center gap-1.5 py-1 px-2 border border-[var(--border)] hover:border-[var(--dim)] bg-transparent cursor-pointer"
            >
              <SystemStatusCompact />
            </button>
            {showStatus && (
              <div className="absolute right-0 top-full mt-1 z-50">
                <SystemStatusPanel />
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
