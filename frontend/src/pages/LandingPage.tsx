import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Earth } from '../components/three/Earth';
import { Starfield } from '../components/three/Starfield';
import { useSimulation } from '../hooks/useSimulation';
import { useSystemStatus } from '../components/layout/SystemStatus';
import { useSimulationStore } from '../store/simulationStore';

function LandingScene() {
  return (
    <Canvas camera={{ position: [0, 8, 22], fov: 45 }} gl={{ antialias: true }} style={{ background: '#020a14' }}>
      <ambientLight intensity={0.25} color="#152238" />
      <directionalLight position={[60, 25, 45]} intensity={2.2} color="#fffdf6" />
      <directionalLight position={[-40, -15, -35]} intensity={0.12} color="#0c1828" />
      <Starfield />
      <Earth rotationSpeed={0.003} />
      <OrbitControls enablePan={false} enableZoom={false} autoRotate autoRotateSpeed={0.3} />
    </Canvas>
  );
}

const features = [
  { icon: '⟳', label: 'Keplerian Propagation' },
  { icon: '⊕', label: '3D Visualization' },
  { icon: '⚠', label: 'Risk Scoring' },
  { icon: '▶', label: 'Real-time Simulation' },
  { icon: '⇪', label: 'CSV Import' },
];

import type { Variants } from 'framer-motion';

const stagger: { container: Variants; item: Variants } = {
  container: {
    hidden: {},
    show: { transition: { staggerChildren: 0.08, delayChildren: 0.3 } },
  },
  item: {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
  },
};

export function LandingPage() {
  const navigate = useNavigate();
  const { status, runDemo } = useSimulation();
  const { result } = useSimulationStore();
  const { status: sysStatus, health } = useSystemStatus();

  const handleLaunch = async () => {
    await runDemo();
    navigate('/simulation');
  };

  return (
    <div className="relative h-screen overflow-hidden">
      {/* 3D Background */}
      <div className="absolute inset-0">
        <LandingScene />
      </div>

      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-r from-gray-950/95 via-gray-950/65 to-transparent pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-t from-gray-950/85 via-transparent to-transparent pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col justify-center px-8 md:px-16 max-w-3xl">
        <motion.div
          variants={stagger.container}
          initial="hidden"
          animate="show"
          className="space-y-0"
        >
          {/* Status pills */}
          <motion.div variants={stagger.item} className="flex items-center gap-3 mb-7">
            <div className="flex items-center gap-2 px-3 py-1 rounded-full liquid-glass-pill"
              style={{ border: '1px solid rgba(34, 197, 94, 0.35)', background: 'linear-gradient(180deg, rgba(34,197,94,0.12) 0%, rgba(34,197,94,0.02) 100%), rgba(4,16,24,0.6)' }}>
              <span className={sysStatus === 'online' ? 'status-dot-green' : sysStatus === 'checking' ? 'status-dot-yellow' : 'status-dot-red'} />
              <span className="text-emerald-300 text-[10px] font-mono font-bold tracking-widest">
                {sysStatus === 'online' ? 'SYSTEM OPERATIONAL' : sysStatus === 'checking' ? 'CONNECTING...' : 'ENGINE OFFLINE'}
              </span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 rounded-full liquid-glass-pill"
              style={{ border: '1px solid rgba(56, 189, 248, 0.3)', background: 'linear-gradient(180deg, rgba(56,189,248,0.12) 0%, rgba(56,189,248,0.02) 100%), rgba(4,16,36,0.6)' }}>
              <span className="text-cyan-300 text-[10px] font-mono tracking-widest font-bold">ISRO HACKATHON 2026</span>
            </div>
            {health && (
              <div className="flex items-center gap-2 px-3 py-1 rounded-full liquid-glass-pill hidden md:flex"
                style={{ border: '1px solid rgba(20, 184, 166, 0.3)', background: 'linear-gradient(180deg, rgba(20,184,166,0.12) 0%, rgba(20,184,166,0.02) 100%), rgba(4,20,32,0.6)' }}>
                <span className="text-teal-300 text-[10px] font-mono tracking-widest">{health.tracked_objects} RSOs TRACKED</span>
              </div>
            )}
          </motion.div>

          {/* Title */}
          <motion.div variants={stagger.item}>
            <h1 className="text-5xl md:text-7xl font-black text-white tracking-tight leading-none mb-2"
              style={{ fontFamily: "'Orbitron', 'Exo 2', sans-serif" }}>
              ORBITAL
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-teal-300 drop-shadow-[0_0_24px_rgba(56,189,248,0.35)]">
                SHIELD
              </span>
            </h1>
          </motion.div>

          <motion.div variants={stagger.item}>
            <h2 className="text-sm text-cyan-300/80 font-mono tracking-widest uppercase mb-5">
              Space Debris Collision Risk Estimator
            </h2>
          </motion.div>

          {/* Description */}
          <motion.div variants={stagger.item}>
            <p className="text-gray-300 text-sm leading-relaxed mb-6 max-w-lg"
              style={{ fontFamily: "'Exo 2', sans-serif" }}>
              A rapid, explainable orbital simulation platform for identifying approximate 
              satellite–debris close approaches. Powered by simplified Keplerian orbital mechanics.
            </p>
          </motion.div>

          {/* Feature pills */}
          <motion.div variants={stagger.item} className="flex flex-wrap gap-2 mb-8">
            {features.map(f => (
              <span key={f.label}
                className="liquid-glass-pill text-[11px] font-mono text-gray-300 px-3 py-1.5 cursor-default transition-all duration-200 hover:text-cyan-200 hover:border-cyan-400/40"
              >
                <span className="mr-1.5 text-cyan-400 opacity-80">{f.icon}</span>{f.label}
              </span>
            ))}
          </motion.div>

          {/* Action buttons */}
          <motion.div variants={stagger.item} className="flex gap-4">
            <button
              id="launch-simulation-btn"
              onClick={handleLaunch}
              disabled={status === 'running'}
              className="btn-primary px-8 py-3 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {status === 'running' ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin">⟳</span> Loading Demo...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <span>▶</span> Launch Simulation
                </span>
              )}
            </button>
            <button
              id="methodology-btn"
              onClick={() => navigate('/methodology')}
              className="btn-secondary px-8 py-3 text-sm"
            >
              Methodology
            </button>
          </motion.div>

          {/* Result stats if available */}
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-panel flex gap-6 mt-6 py-3 px-5 max-w-md"
            >
              <div>
                <p className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">Last Simulation</p>
                <p className="text-xs font-mono text-cyan-300 font-bold">{result.simulation_id.toUpperCase()}</p>
              </div>
              <div>
                <p className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">Objects</p>
                <p className="text-xs font-mono text-gray-200 font-semibold">{result.debris_objects.length}</p>
              </div>
              <div>
                <p className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">Min Separation</p>
                <p className="text-xs font-mono text-amber-300 font-bold">{result.stats.closest_approach_km?.toFixed(1)} km</p>
              </div>
            </motion.div>
          )}

          {/* Disclaimer */}
          <motion.div variants={stagger.item}>
            <p className="text-gray-500 text-[10px] font-mono mt-6 max-w-lg leading-relaxed">
              ⚠ APPROXIMATE MODEL — Simplified Keplerian propagation. Not intended for operational collision avoidance.
            </p>
          </motion.div>
        </motion.div>
      </div>

      {/* System status overlay (bottom-right) - Floating Liquid Glass Tile */}
      <div className="absolute bottom-6 right-6 z-10 p-3.5 rounded-2xl liquid-glass-dock space-y-2 text-right">
        {[
          { label: 'Simulation Engine', online: sysStatus === 'online' },
          { label: 'Orbital Engine', online: sysStatus === 'online' },
          { label: 'Risk Engine', online: sysStatus === 'online' },
        ].map(({ label, online }) => (
          <div key={label} className="flex items-center justify-end gap-2.5">
            <span className="text-[10px] font-mono text-gray-300 font-medium">{label}</span>
            <span className={online ? 'status-dot-green' : 'status-dot-red'} />
          </div>
        ))}
        <p className="text-gray-400/70 text-[9px] font-mono pt-1.5 border-t border-white/[0.08]">Dept. of Space / ISRO · 2026</p>
      </div>
    </div>
  );
}
