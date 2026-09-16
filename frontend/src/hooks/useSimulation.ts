import { useCallback } from 'react';
import { useSimulationStore } from '../store/simulationStore';
import apiClient from '../api/client';
import type { OrbitalObjectInput } from '../types';

export function useSimulation() {
  const store = useSimulationStore();

  const runDemo = useCallback(async () => {
    store.setStatus('running');
    store.setError(null);
    store.setSimulationTime(0);
    store.setPlayState('stopped');
    try {
      const result = await apiClient.simulateDemo(
        store.config.window_hours,
        store.config.timestep_seconds,
      );
      store.setResult(result);
      store.setStatus('complete');
      // Auto-select highest risk
      if (result.risk_results.length > 0) {
        store.setSelectedObject(result.risk_results[0].object_id);
      }
    } catch (err: any) {
      store.setError(err?.response?.data?.detail || err?.message || 'Simulation failed');
      store.setStatus('error');
    }
  }, [store]);

  const runCustom = useCallback(
    async (debrisObjects: OrbitalObjectInput[]) => {
      store.setStatus('running');
      store.setError(null);
      store.setSimulationTime(0);
      store.setPlayState('stopped');
      try {
        const result = await apiClient.simulate({
          satellite: store.satellite,
          debris_objects: debrisObjects,
          config: store.config,
        });
        store.setResult(result);
        store.setStatus('complete');
        if (result.risk_results.length > 0) {
          store.setSelectedObject(result.risk_results[0].object_id);
        }
      } catch (err: any) {
        store.setError(err?.response?.data?.detail || err?.message || 'Simulation failed');
        store.setStatus('error');
      }
    },
    [store],
  );

  return { runDemo, runCustom, ...store };
}
