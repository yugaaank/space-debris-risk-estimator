import { Link, useLocation } from 'react-router-dom';
import { useSimulationStore } from '../../store/simulationStore';

const NAV_LINKS = [
  { to: '/', label: 'Overview' },
  { to: '/simulation', label: '3D Simulation' },
  { to: '/risk', label: 'Risk Analysis' },
  { to: '/objects', label: 'Objects' },
  { to: '/methodology', label: 'Methodology' },
];

export function Navbar() {
  const location = useLocation();
  const { status } = useSimulationStore();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-14 flex items-center justify-between px-6 border-b border-blue-900/30 bg-gray-950/80 backdrop-blur-md">
      {/* Logo */}
      <Link to="/" className="flex items-center gap-3 no-underline">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/30">
          <span className="text-sm font-bold text-white">⊕</span>
        </div>
        <div>
          <p className="text-white font-bold tracking-widest font-mono text-sm leading-tight">ORBITAL SHIELD</p>
          <p className="text-blue-400/60 text-xs font-mono leading-tight">Space Debris Collision Risk Estimator</p>
        </div>
      </Link>

      {/* Navigation */}
      <div className="flex items-center gap-1">
        {NAV_LINKS.map(link => {
          const isActive = location.pathname === link.to;
          return (
            <Link
              key={link.to}
              to={link.to}
              className={`px-3 py-1.5 rounded text-xs font-mono transition-all no-underline ${isActive
                ? 'bg-blue-600/20 text-blue-300 border border-blue-600/30'
                : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'}`}
            >
              {link.label}
            </Link>
          );
        })}
      </div>

      {/* Status indicator */}
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${
          status === 'running' ? 'bg-yellow-400 animate-pulse'
          : status === 'complete' ? 'bg-green-400'
          : status === 'error' ? 'bg-red-400'
          : 'bg-gray-600'
        }`} />
        <span className="text-xs font-mono text-gray-400">
          {status === 'running' ? 'SIMULATING...'
          : status === 'complete' ? 'ANALYSIS COMPLETE'
          : status === 'error' ? 'ERROR'
          : 'SYSTEM ONLINE'}
        </span>
      </div>
    </nav>
  );
}
