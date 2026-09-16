import type { SimulationResult } from '../../types';
import { useEffect, useMemo, useState } from 'react';
import { useSimulationStore } from '../../store/simulationStore';
import { listObjects } from '../../api';
import apiClient from '../../api/client';

const MAX_OBJECTS = 200;

interface SimulationConfig {
  propagationTimeHours: number;
  timeStepMinutes: number;
  probabilityThreshold: number;
  useDefaultCatalog: boolean;
  selectedObjectId: string | null;
  customObjects: number;
}

export function SimulationConfigPanel() {
  const { config, updateConfig, status, result } = useSimulationStore();
  const [objects, setObjects] = useState<any[]>([]);

  useEffect(() => {
    listObjects(MAX_OBJECTS).then(setObjects).catch(() => {});
  }, []);

  const detectedStats = useMemo(() => {
    if (!result) return null;
    return {
      total: result.total_risks_detected,
      critical: result.risk_results.filter((r: any) => r.risk_level === 'critical').length,
      high: result.risk_results.filter((r: any) => r.risk_level === 'high').length,
    };
  }, [result]);

  const score = useMemo(() => {
    if (!result) return 0;
    return Math.min(
      100,
      Math.round(
        (result.total_risks_detected * 8) +
        (result.risk_results.filter((r: any) => r.risk_level === 'critical').length * 15) +
        (result.risk_results.filter((r: any) => r.risk_level === 'high').length * 10)
      )
    );
  }, [result]);

  return (
    <div className="terminal-border bg-[var(--bg)] overflow-hidden">
      <div className="p-3 border-b border-[var(--border)]">
        <p className="section-title mb-0">SIMULATION CONFIG</p>
      </div>

      <div className="p-3 space-y-3">
        {[
          { key: 'selectedObjectId' as const, label: 'TARGET RSO', value: config.selectedObjectId ?? '', type: 'text' },
          { key: 'customObjects' as const, label: 'ADDITIONAL OBJECTS', value: config.customObjects, type: 'number' },
          { key: 'propagationTimeHours' as const, label: 'PROPAGATION (HRS)', value: config.propagationTimeHours, type: 'number' },
          { key: 'timeStepMinutes' as const, label: 'TIME STEP (MIN)', value: config.timeStepMinutes, type: 'number' },
          { key: 'probabilityThreshold' as const, label: 'PROB THRESHOLD', value: config.probabilityThreshold, type: 'number' },
        ].map(({ key, label, value, type }) => (
          <div key={key}>
            <label className="block text-[10px] text-[var(--dim)] mb-1">{label}</label>
            <input
              type={type}
              value={value}
              onChange={(e) => updateConfig({ [key]: type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value })}
              className="input-field"
            />
          </div>
        ))}

        <div className="flex justify-between items-center">
          <label className="text-[10px] text-[var(--dim)]">USE DEFAULT CATALOG</label>
          <button
            onClick={() => updateConfig({ useDefaultCatalog: !config.useDefaultCatalog })}
            className={`w-10 h-4 border border-[var(--border)] cursor-pointer transition-colors ${
              config.useDefaultCatalog
                ? 'bg-[var(--fg)] border-[var(--fg)]'
                : 'bg-[var(--bg)]'
            }`}
          >
            <div className={`w-3 h-3 transition-transform ${
              config.useDefaultCatalog
                ? 'translate-x-[22px] bg-[var(--bg)]'
                : 'translate-x-[1px] bg-[var(--fg)]'
            }`} />
          </button>
        </div>

        {config.useDefaultCatalog && (
          <div className="terminal-border p-2 text-[10px] text-[var(--dim)]">
            Will include {objects.length} objects from catalog
          </div>
        )}
      </div>

      <div className="p-3 border-t border-[var(--border)]">
        <button
          onClick={() => apiClient.simulate(config)}
          disabled={status === 'running'}
          className="btn-terminal w-full"
        >
          {status === 'running' ? '> COMPUTING...' : '> RUN SIMULATION'}
        </button>
      </div>

      {status === 'running' && (
        <div className="p-3 border-t border-[var(--border)]">
          <div className="text-[11px] text-[var(--high)] animate-pulse">
            > COMPUTING COLLISION PROBABILITIES...
          </div>
        </div>
      )}

      {status === 'error' && (
        <div className="p-3 border-t border-[var(--border)]">
          <p className="text-[11px] text-[var(--critical)]">
            > SIMULATION FAILED — CHECK INPUTS
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
