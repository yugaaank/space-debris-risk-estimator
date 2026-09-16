import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useSimulationStore } from '../../store/simulationStore';
import { SystemStatusCompact, SystemStatusPanel } from './SystemStatus';

const NAV_LINKS = [
  { to: '/', label: 'Overview', icon: '⊕' },
  { to: '/simulation', label: '3D Sim', icon: '🛸' },
  { to: '/risk', label: 'Risk Analysis', icon: '⚠' },
  { to: '/objects', label: 'Objects', icon: '☰' },
  { to: '/methodology', label: 'Methodology', icon: '∫' },
];

function MissionClock() {
  const [time, setTime] = useState(() => new Date().toISOString().slice(11, 19) + ' UTC');
  
  useEffect(() => {
    const tick = () => setTime(new Date().toUTCString().slice(17, 25) + ' UTC');
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <span className="text-[10px] font-mono text-gray-600 tracking-widest hidden lg:block">
      {time}
    </span>
  );
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

  const simStatusColor =
    status === 'running' ? 'text-yellow-400'
    : status === 'complete' ? 'text-emerald-400'
    : status === 'error' ? 'text-red-400'
    : 'text-gray-600';

  const simStatusLabel =
    status === 'running' ? 'SIMULATING'
    : status === 'complete' ? `SIM-${result?.simulation_id?.toUpperCase() ?? 'OK'}`
    : status === 'error' ? 'ERR'
    : 'READY';

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-14 flex items-center justify-between px-4 lg:px-6"
      style={{
        background: 'linear-gradient(180deg, rgba(14, 25, 52, 0.65) 0%, rgba(3, 8, 22, 0.55) 100%)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
        backdropFilter: 'blur(28px) saturate(190%)',
        WebkitBackdropFilter: 'blur(28px) saturate(190%)',
        boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.38), inset 0 1px 0 0 rgba(255, 255, 255, 0.22)',
      }}
    >
      {/* Top accent gloss highlight line */}
      <div className="absolute top-0 left-10 right-10 h-px bg-gradient-to-r from-transparent via-cyan-400/45 to-transparent pointer-events-none" />

      {/* Logo */}
      <Link to="/" className="flex items-center gap-2.5 no-underline flex-shrink-0 group">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center transition-transform duration-200 group-hover:scale-105"
          style={{
            boxShadow: '0 0 14px rgba(56, 189, 248, 0.45), inset 0 1px 1px rgba(255, 255, 255, 0.5)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
          }}
        >
          <span className="text-xs font-black text-white">⊕</span>
        </div>
        <div className="hidden sm:block">
          <p className="text-white font-black tracking-widest font-mono text-sm leading-tight transition-colors group-hover:text-cyan-200"
            style={{ fontFamily: "'Orbitron', monospace", letterSpacing: '0.15em' }}>
            ORBITAL SHIELD
          </p>
          <p className="text-cyan-400/60 text-[9px] font-mono leading-tight tracking-widest">SPACE DEBRIS RISK ESTIMATOR</p>
        </div>
      </Link>

      {/* Navigation - Liquid Glass Capsule */}
      <div className="flex items-center gap-1 p-1 rounded-full bg-white/[0.04] border border-white/[0.09] shadow-[inset_0_1px_1px_rgba(255,255,255,0.12),0_4px_16px_rgba(0,0,0,0.25)] backdrop-blur-md">
        {NAV_LINKS.map(link => {
          const isActive = location.pathname === link.to;
          return (
            <Link
              key={link.to}
              to={link.to}
              className={`relative px-3 py-1 rounded-full text-[11px] font-mono tracking-wider transition-all duration-200 no-underline ${
                isActive
                  ? 'text-cyan-200 bg-gradient-to-b from-cyan-400/25 to-cyan-500/10 border border-cyan-400/35 shadow-[inset_0_1px_0_rgba(255,255,255,0.3),0_2px_8px_rgba(6,182,212,0.25)]'
                  : 'text-gray-400 hover:text-cyan-200 hover:bg-white/[0.06] border border-transparent'
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </div>

      {/* Right side: status + clock */}
      <div className="flex items-center gap-3 lg:gap-4 flex-shrink-0">
        <MissionClock />

        {/* Simulation status pill */}
        <div className="flex items-center gap-1.5 hidden md:flex px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/[0.09] shadow-[inset_0_1px_0_rgba(255,255,255,0.15)]">
          <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
            status === 'running' ? 'bg-yellow-400 animate-pulse'
            : status === 'complete' ? 'bg-emerald-400'
            : status === 'error' ? 'bg-red-400'
            : 'bg-gray-700'
          }`} />
          <span className={`text-[10px] font-mono font-bold tracking-widest ${simStatusColor}`}>
            {simStatusLabel}
          </span>
        </div>

        {/* System status indicator + popover */}
        <div ref={statusRef} className="relative">
          <button
            onClick={() => setShowStatus(v => !v)}
            className="flex items-center gap-1.5 py-1 px-2.5 rounded-full border border-white/[0.12] hover:border-cyan-400/40 bg-white/[0.04] hover:bg-white/[0.08] shadow-[inset_0_1px_0_rgba(255,255,255,0.15)] transition-all cursor-pointer"
          >
            <SystemStatusCompact />
          </button>

          <AnimatePresence>
            {showStatus && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-8 z-50"
              >
                <SystemStatusPanel />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </nav>
  );
}
