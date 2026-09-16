import { useSimulationStore } from '../../store/simulationStore';

interface SimulationConfigProps {
  onRun?: () => void;
  isLoading?: boolean;
}

export function SimulationConfig({ onRun, isLoading }: SimulationConfigProps) {
  const { config, setConfig } = useSimulationStore();

  return (
    <div className="space-y-4 font-mono text-xs">
      <div>
        <label className="block text-gray-400 mb-1.5 uppercase tracking-wider font-semibold">
          Simulation Window (Hours)
        </label>
        <select
          value={config.window_hours}
          onChange={e => setConfig({ ...config, window_hours: parseFloat(e.target.value) })}
          className="w-full bg-gray-900/80 border border-blue-900/40 rounded px-3 py-2 text-gray-200 focus:outline-none focus:border-cyan-400 transition-colors"
        >
          {[1, 6, 12, 24, 48, 72, 168].map(h => (
            <option key={h} value={h}>
              {h} hours {h === 24 ? '(Standard 1-Day)' : h === 168 ? '(7-Day Horizon)' : ''}
            </option>
          ))}
        </select>
        <p className="text-[10px] text-gray-500 mt-1">Duration of forward orbital propagation.</p>
      </div>

      <div>
        <label className="block text-gray-400 mb-1.5 uppercase tracking-wider font-semibold">
          Timestep Resolution (Seconds)
        </label>
        <select
          value={config.timestep_seconds}
          onChange={e => setConfig({ ...config, timestep_seconds: parseFloat(e.target.value) })}
          className="w-full bg-gray-900/80 border border-blue-900/40 rounded px-3 py-2 text-gray-200 focus:outline-none focus:border-cyan-400 transition-colors"
        >
          {[10, 30, 60, 120, 300, 600].map(s => (
            <option key={s} value={s}>
              {s} seconds {s === 60 ? '(Recommended)' : s === 10 ? '(High Precision)' : ''}
            </option>
          ))}
        </select>
        <p className="text-[10px] text-gray-500 mt-1">Discrete sampling step for close-approach detection.</p>
      </div>

      {onRun && (
        <button
          onClick={onRun}
          disabled={isLoading}
          className="btn-primary w-full py-2.5 mt-2 text-xs"
        >
          {isLoading ? '⟳ Propagating...' : '▶ Re-run Simulation with Parameters'}
        </button>
      )}
    </div>
  );
}
