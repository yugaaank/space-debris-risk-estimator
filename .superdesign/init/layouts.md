# Layout Components

## Navbar
- **Source**: `src/components/layout/Navbar.tsx`
- **Description**: Fixed top navigation bar with glass morphism background, logo, nav links (pill tabs), mission clock, simulation status indicator, and system status popover
- **Full source**:

```tsx
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
    tick(); const id = setInterval(tick, 1000); return () => clearInterval(id);
  }, []);
  return <span className="text-[10px] font-mono text-gray-600 tracking-widest hidden lg:block">{time}</span>;
}

export function Navbar() {
  const location = useLocation();
  const { status, result } = useSimulationStore();
  const [showStatus, setShowStatus] = useState(false);
  const statusRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (statusRef.current && !statusRef.current.contains(e.target as Node)) setShowStatus(false); };
    document.addEventListener('mousedown', handler); return () => document.removeEventListener('mousedown', handler);
  }, []);

  const simStatusColor = status === 'running' ? 'text-yellow-400' : status === 'complete' ? 'text-emerald-400' : status === 'error' ? 'text-red-400' : 'text-gray-600';
  const simStatusLabel = status === 'running' ? 'SIMULATING' : status === 'complete' ? `SIM-${result?.simulation_id?.toUpperCase() ?? 'OK'}` : status === 'error' ? 'ERR' : 'READY';

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-14 flex items-center justify-between px-4 lg:px-6"
      style={{
        background: 'linear-gradient(180deg, rgba(14, 25, 52, 0.65) 0%, rgba(3, 8, 22, 0.55) 100%)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
        backdropFilter: 'blur(28px) saturate(190%)',
        boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.38), inset 0 1px 0 0 rgba(255, 255, 255, 0.22)',
      }}>
      <div className="absolute top-0 left-10 right-10 h-px bg-gradient-to-r from-transparent via-cyan-400/45 to-transparent pointer-events-none" />
      <Link to="/" className="flex items-center gap-2.5 no-underline flex-shrink-0 group">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center transition-transform duration-200 group-hover:scale-105"
          style={{ boxShadow: '0 0 14px rgba(56, 189, 248, 0.45), inset 0 1px 1px rgba(255, 255, 255, 0.5)', border: '1px solid rgba(255, 255, 255, 0.3)' }}>
          <span className="text-xs font-black text-white">⊕</span>
        </div>
        <div className="hidden sm:block">
          <p className="text-white font-black tracking-widest font-mono text-sm leading-tight transition-colors group-hover:text-cyan-200" style={{ fontFamily: "'Orbitron', monospace", letterSpacing: '0.15em' }}>ORBITAL SHIELD</p>
          <p className="text-cyan-400/60 text-[9px] font-mono leading-tight tracking-widest">SPACE DEBRIS RISK ESTIMATOR</p>
        </div>
      </Link>
      <div className="flex items-center gap-1 p-1 rounded-full bg-white/[0.04] border border-white/[0.09] shadow-[inset_0_1px_1px_rgba(255,255,255,0.12),0_4px_16px_rgba(0,0,0,0.25)] backdrop-blur-md">
        {NAV_LINKS.map(link => {
          const isActive = location.pathname === link.to;
          return (
            <Link key={link.to} to={link.to}
              className={`relative px-3 py-1 rounded-full text-[11px] font-mono tracking-wider transition-all duration-200 no-underline ${isActive ? 'text-cyan-200 bg-gradient-to-b from-cyan-400/25 to-cyan-500/10 border border-cyan-400/35 shadow-[inset_0_1px_0_rgba(255,255,255,0.3),0_2px_8px_rgba(6,182,212,0.25)]' : 'text-gray-400 hover:text-cyan-200 hover:bg-white/[0.06] border border-transparent'}`}>
              {link.label}
            </Link>
          );
        })}
      </div>
      <div className="flex items-center gap-3 lg:gap-4 flex-shrink-0">
        <MissionClock />
        <div className="flex items-center gap-1.5 hidden md:flex px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/[0.09] shadow-[inset_0_1px_0_rgba(255,255,255,0.15)]">
          <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${status === 'running' ? 'bg-yellow-400 animate-pulse' : status === 'complete' ? 'bg-emerald-400' : status === 'error' ? 'bg-red-400' : 'bg-gray-700'}`} />
          <span className={`text-[10px] font-mono font-bold tracking-widest ${simStatusColor}`}>{simStatusLabel}</span>
        </div>
        <div ref={statusRef} className="relative">
          <button onClick={() => setShowStatus(v => !v)} className="flex items-center gap-1.5 py-1 px-2.5 rounded-full border border-white/[0.12] hover:border-cyan-400/40 bg-white/[0.04] hover:bg-white/[0.08] shadow-[inset_0_1px_0_rgba(255,255,255,0.15)] transition-all cursor-pointer">
            <SystemStatusCompact />
          </button>
          <AnimatePresence>
            {showStatus && (
              <motion.div initial={{ opacity: 0, y: -8, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8, scale: 0.95 }} transition={{ duration: 0.15 }} className="absolute right-0 top-8 z-50">
                <SystemStatusPanel />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </nav>
  );
}
```

## LoadingScreen
- **Source**: `src/components/layout/LoadingScreen.tsx`
- **Description**: Full-screen animated loading sequence with step-by-step status indicators, progress bar, and orbital ring decorations
- **Props**: `onComplete: () => void`

```tsx
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import apiClient from '../../api/client';

interface LoadingStep { id: string; label: string; status: 'waiting' | 'active' | 'done' | 'error'; }

const INITIAL_STEPS: LoadingStep[] = [
  { id: 'connect', label: 'Connecting to orbital engine', status: 'waiting' },
  { id: 'objects', label: 'Loading tracked objects', status: 'waiting' },
  { id: 'init3d', label: 'Initializing 3D environment', status: 'waiting' },
  { id: 'sync', label: 'Synchronizing simulation', status: 'waiting' },
];

export function LoadingScreen({ onComplete }: { onComplete: () => void }) {
  const [steps, setSteps] = useState<LoadingStep[]>(INITIAL_STEPS);
  const [currentStep, setCurrentStep] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [trackedObjects, setTrackedObjects] = useState<number | null>(null);
  const [dots, setDots] = useState('');
  const completedRef = useRef(false);

  useEffect(() => { const interval = setInterval(() => { setDots(d => (d.length >= 3 ? '' : d + '.')); }, 400); return () => clearInterval(interval); }, []);
  const updateStep = (index: number, status: LoadingStep['status']) => { setSteps(prev => prev.map((s, i) => i === index ? { ...s, status } : s)); };

  useEffect(() => {
    let cancelled = false;
    async function runLoading() {
      setCurrentStep(0); updateStep(0, 'active'); await new Promise(r => setTimeout(r, 300));
      try { const health = await apiClient.health(); if (cancelled) return; setTrackedObjects(health.tracked_objects ?? 50); updateStep(0, 'done'); }
      catch { if (cancelled) return; updateStep(0, 'error'); setErrorMsg('Orbital engine is waking up — this may take ~30s on first load.'); await new Promise(r => setTimeout(r, 1200)); if (cancelled) return; updateStep(0, 'done'); }
      await new Promise(r => setTimeout(r, 180));
      if (cancelled) return; setCurrentStep(1); updateStep(1, 'active'); await new Promise(r => setTimeout(r, 500)); if (cancelled) return; updateStep(1, 'done');
      await new Promise(r => setTimeout(r, 120));
      if (cancelled) return; setCurrentStep(2); updateStep(2, 'active'); await new Promise(r => setTimeout(r, 600)); if (cancelled) return; updateStep(2, 'done');
      await new Promise(r => setTimeout(r, 120));
      if (cancelled) return; setCurrentStep(3); updateStep(3, 'active'); await new Promise(r => setTimeout(r, 400)); if (cancelled) return; updateStep(3, 'done');
      await new Promise(r => setTimeout(r, 500));
      if (!cancelled && !completedRef.current) { completedRef.current = true; onComplete(); }
    }
    runLoading(); return () => { cancelled = true; };
  }, [onComplete]);

  return (
    <div className="loading-screen select-none" style={{ background: '#010610' }}>
      <div className="absolute top-6 left-6 w-12 h-12 border-t border-l border-cyan-500/30" />
      <div className="absolute top-6 right-6 w-12 h-12 border-t border-r border-cyan-500/30" />
      <div className="absolute bottom-6 left-6 w-12 h-12 border-b border-l border-cyan-500/30" />
      <div className="absolute bottom-6 right-6 w-12 h-12 border-b border-r border-cyan-500/30" />
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden opacity-10">
        <div className="w-[600px] h-[600px] rounded-full border border-cyan-400 animate-spin-slow-cw" />
        <div className="absolute w-[400px] h-[400px] rounded-full border border-blue-400/50 animate-spin-slow-ccw" />
      </div>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: 'easeOut' }} className="relative z-10 flex flex-col items-center max-w-md w-full px-8">
        <div className="mb-2 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/30 animate-orbital-pulse">
            <span className="text-lg font-bold text-white">⊕</span>
          </div>
        </div>
        <div className="loading-logo text-center">ORBITAL SHIELD</div>
        <p className="text-xs text-cyan-400/60 font-mono tracking-widest mb-1">SPACE DEBRIS COLLISION RISK ESTIMATOR</p>
        <p className="text-[10px] text-gray-600 font-mono tracking-widest mb-10">ISRO HACKATHON 2026 · DEPT. OF SPACE</p>
        <div className="w-full space-y-3 mb-8">
          {steps.map((step, i) => (
            <motion.div key={step.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }} className="flex items-center gap-3">
              <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
                {step.status === 'done' && <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-green-400 text-sm">✓</motion.span>}
                {step.status === 'active' && <span className="w-3 h-3 rounded-full bg-cyan-400 animate-pulse" />}
                {step.status === 'error' && <span className="text-orange-400 text-sm">!</span>}
                {step.status === 'waiting' && <span className="w-3 h-3 rounded-full border border-gray-700" />}
              </div>
              <span className={`text-xs font-mono transition-colors duration-300 ${step.status === 'done' ? 'text-gray-400' : step.status === 'active' ? 'text-cyan-300' : step.status === 'error' ? 'text-orange-400' : 'text-gray-700'}`}>
                {step.label}{step.status === 'active' && <span className="text-gray-600">{dots}</span>}{step.status === 'done' && step.id === 'connect' && trackedObjects && <span className="text-green-400 ml-2">({trackedObjects} objects)</span>}
              </span>
            </motion.div>
          ))}
        </div>
        <div className="w-full h-0.5 bg-gray-900 rounded-full overflow-hidden mb-4">
          <motion.div className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full" initial={{ width: '0%' }} animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }} transition={{ duration: 0.4, ease: 'easeInOut' }} />
        </div>
        <AnimatePresence>
          {errorMsg && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="w-full p-3 rounded border border-orange-900/50 bg-orange-950/30 text-[11px] font-mono text-orange-400 text-center leading-relaxed">
              ⚡ {errorMsg}
            </motion.div>
          )}
        </AnimatePresence>
        <p className="text-[10px] text-gray-700 font-mono mt-6">v1.0.0 · APPROXIMATE MODEL · NOT FOR OPERATIONAL USE</p>
      </motion.div>
    </div>
  );
}
```

## App Shell (App.tsx)
- **Source**: `src/App.tsx`
- **Description**: Root app shell wrapping Router, Navbar, and Routes with loading screen animation

```tsx
import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Navbar } from './components/layout/Navbar';
import { LandingPage } from './pages/LandingPage';
import { SimulationPage } from './pages/SimulationPage';
import { RiskAnalysisPage } from './pages/RiskAnalysisPage';
import { ObjectsPage } from './pages/ObjectsPage';
import { MethodologyPage } from './pages/MethodologyPage';
import { LoadingScreen } from './components/layout/LoadingScreen';

function App() {
  const [showLoading, setShowLoading] = useState(() => { try { return !sessionStorage.getItem('orbital_shield_intro_shown'); } catch { return false; } });
  const handleLoadingComplete = () => { try { sessionStorage.setItem('orbital_shield_intro_shown', 'true'); } catch {} setShowLoading(false); };

  return (
    <>
      <AnimatePresence>
        {showLoading && (
          <motion.div key="loading-screen" exit={{ opacity: 0 }} transition={{ duration: 0.6, ease: 'easeInOut' }} className="fixed inset-0 z-50">
            <LoadingScreen onComplete={handleLoadingComplete} />
          </motion.div>
        )}
      </AnimatePresence>
      <Router>
        <div className="min-h-screen bg-[#020813] text-gray-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/simulation" element={<SimulationPage />} />
              <Route path="/risk" element={<RiskAnalysisPage />} />
              <Route path="/objects" element={<ObjectsPage />} />
              <Route path="/methodology" element={<MethodologyPage />} />
            </Routes>
          </main>
        </div>
      </Router>
    </>
  );
}

export default App;
```
