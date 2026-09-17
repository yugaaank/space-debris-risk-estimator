import { useMemo } from 'react';
import { useSimulationStore } from '../../store/simulationStore';
import apiClient from '../../api/client';

export function SimulationConfigPanel() {
  const { config, setConfig, status, result } = useSimulationStore();

  const detectedStats = useMemo(() => {
    if (!result) return null;
    return {
      total: result.risk_results.length,
      critical: result.risk_results.filter((r) => r.risk_level === 'CRITICAL').length,
      high: result.risk_results.filter((r) => r.risk_level === 'HIGH').length,
    };
  }, [result]);

  const score = useMemo(() => {
    if (!result) return 0;
    return Math.min(
      100,
      Math.round(
        (result.risk_results.length * 8) +
        (result.risk_results.filter((r) => r.risk_level === 'CRITICAL').length * 15) +
        (result.risk_results.filter((r) => r.risk_level === 'HIGH').length * 10)
      )
    );
  }, [result]);

  const handleRunSimulation = () => {
    apiClient.simulateDemo(config.window_hours, config.timestep_seconds);
  };

  return (
    <div className="terminal-border bg-[var(--bg)] overflow-hidden">
      <div className="p-3 border-b border-[var(--border)]">
        <p className="section-title mb-0">SIMULATION CONFIG</p>
      </div>

      <div className="p-3 space-y-3">
        <div>
          <label className="block text-[10px] text-[var(--dim)] mb-1">PROPAGATION (HRS)</label>
          <input
            type="number"
            value={config.window_hours}
            onChange={(e) => setConfig({ ...config, window_hours: parseFloat(e.target.value) || 24 })}
            className="input-field"
          />
        </div>
        <div>
          <label className="block text-[10px] text-[var(--dim)] mb-1">TIME STEP (SEC)</label>
          <input
            type="number"
            value={config.timestep_seconds}
            onChange={(e) => setConfig({ ...config, timestep_seconds: parseFloat(e.target.value) || 60 })}
            className="input-field"
          />
        </div>
      </div>

      <div className="p-3 border-t border-[var(--border)]">
        <button
          onClick={handleRunSimulation}
          disabled={status === 'running'}
          className="btn-terminal w-full"
        >
          {status === 'running' ? '> COMPUTING...' : '> RUN SIMULATION'}
        </button>
      </div>

      {status === 'running' && (
        <div className="p-3 border-t border-[var(--border)]">
          <div className="text-[11px] text-[var(--high)] animate-pulse">
            &gt; COMPUTING COLLISION PROBABILITIES...
          </div>
        </div>
      )}

      {status === 'error' && (
        <div className="p-3 border-t border-[var(--border)]">
          <p className="text-[11px] text-[var(--critical)]">
            &gt; SIMULATION FAILED — CHECK INPUTS
          </p>
        </div>
      )}

      {detectedStats && (
        <div className="p-3 border-t border-[var(--border)]">
          <p className="section-title mb-2">RESULTS SUMMARY</p>
          <div className="space-y-1 text-[11px]">
            <div className="flex justify-between">
              <span className="text-[var(--dim)]">SCORE</span>
              <span className="font-bold">{score}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--dim)]">TOTAL RISKS</span>
              <span>{detectedStats.total}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--dim)]">CRITICAL</span>
              <span className="text-[var(--critical)]">{detectedStats.critical}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--dim)]">HIGH</span>
              <span className="text-[var(--high)]">{detectedStats.high}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--dim)]">SIM ID</span>
              <span className="text-[var(--dim)]">{result?.simulation_id}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
