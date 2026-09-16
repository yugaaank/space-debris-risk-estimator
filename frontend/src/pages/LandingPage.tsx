import { useNavigate } from 'react-router-dom';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Earth } from '../components/three/Earth';
import { Starfield } from '../components/three/Starfield';
import { useSimulation } from '../hooks/useSimulation';

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

export function LandingPage() {
  const navigate = useNavigate();
  const { status, runDemo } = useSimulation();

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

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-gray-950/90 via-gray-950/60 to-transparent pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-t from-gray-950/80 via-transparent to-transparent pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col justify-center px-8 md:px-16 max-w-3xl">
        {/* Status pills */}
        <div className="flex items-center gap-3 mb-8">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/30">
            <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            <span className="text-green-400 text-xs font-mono">SYSTEM OPERATIONAL</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30">
            <span className="text-blue-400 text-xs font-mono">ISRO HACKATHON 2026</span>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-6xl md:text-7xl font-bold text-white tracking-tight leading-none mb-2">
          ORBITAL
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
            SHIELD
          </span>
        </h1>
        <h2 className="text-lg text-blue-300/80 font-mono tracking-widest uppercase mb-6">
          Space Debris Collision Risk Estimator
        </h2>

        {/* Description */}
        <p className="text-gray-400 text-base leading-relaxed mb-8 max-w-xl">
          A rapid, explainable orbital simulation platform for identifying approximate 
          satellite–debris close approaches. Powered by simplified Keplerian orbital mechanics.
        </p>

        {/* Feature pills */}
        <div className="flex flex-wrap gap-2 mb-10">
          {['Keplerian Propagation', '3D Visualization', 'Risk Scoring', 'Real-time Simulation', 'CSV Import'].map(f => (
            <span key={f} className="text-xs font-mono text-gray-400 px-2.5 py-1 rounded border border-gray-700 bg-gray-900/40">
              {f}
            </span>
          ))}
        </div>

        {/* Buttons */}
        <div className="flex gap-4">
          <button
            id="launch-simulation-btn"
            onClick={handleLaunch}
            disabled={status === 'running'}
            className="btn-primary px-8 py-3 text-base disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {status === 'running' ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin">⟳</span> Loading Demo...
              </span>
            ) : (
              '🚀 Launch Simulation'
            )}
          </button>
          <button
            id="methodology-btn"
            onClick={() => navigate('/methodology')}
            className="btn-secondary px-8 py-3 text-base"
          >
            Explore Methodology
          </button>
        </div>

        {/* Disclaimer */}
        <p className="text-gray-600 text-xs font-mono mt-8 max-w-lg leading-relaxed">
          APPROXIMATE MODEL — Results use simplified circular/Keplerian orbital propagation.
          Not intended for operational collision avoidance.
        </p>
      </div>

      {/* System status overlay (bottom-right) */}
      <div className="absolute bottom-6 right-6 z-10 space-y-1.5 text-right">
        <div className="flex items-center justify-end gap-2">
          <span className="text-xs font-mono text-gray-500">Simulation Engine</span>
          <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
        </div>
        <div className="flex items-center justify-end gap-2">
          <span className="text-xs font-mono text-gray-500">Orbital Engine</span>
          <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
        </div>
        <div className="flex items-center justify-end gap-2">
          <span className="text-xs font-mono text-gray-500">Risk Engine</span>
          <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
        </div>
        <p className="text-gray-700 text-xs font-mono">Dept. of Space / ISRO · 2026</p>
      </div>
    </div>
  );
}
