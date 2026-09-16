import { useState, useEffect, useRef } from 'react';
import { useSimulationStore } from '../store/simulationStore';
import { useSimulation } from '../hooks/useSimulation';
import { KpiCards } from '../components/dashboard/KpiCards';
import { RiskDistributionChart } from '../components/dashboard/RiskDistributionChart';
import { ApproachTimeline } from '../components/dashboard/ApproachTimeline';
import { DistanceGraph } from '../components/dashboard/DistanceGraph';
import { RiskTable } from '../components/risk/RiskTable';
import { SatelliteForm } from '../components/forms/SatelliteForm';
import { SimulationConfig } from '../components/forms/SimulationConfig';
import { CsvUpload } from '../components/forms/CsvUpload';
import type { OrbitalObjectInput } from '../types';

export function RiskAnalysisPage() {
  const { result, status, error, config, getSelectedRisk } = useSimulationStore();
  const { runDemo, runCustom } = useSimulation();
  const [customDebris, setCustomDebris] = useState<OrbitalObjectInput[] | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'table' | 'configure'>('overview');

  // Auto-initialize demo simulation if empty
  const hasAutoLoaded = useRef(false);
  useEffect(() => {
    if (!hasAutoLoaded.current && status === 'idle' && !result) {
      hasAutoLoaded.current = true;
      runDemo();
    }
  }, [status, result, runDemo]);

  const selectedRisk = getSelectedRisk();

  const handleRunSimulation = async () => {
    if (customDebris && customDebris.length > 0) {
      await runCustom(customDebris);
    } else {
      await runDemo();
    }
  };

  return (
    <div className="min-h-screen pt-14 pb-8 px-4">
      <div className="max-w-screen-xl mx-auto space-y-6 pt-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white font-mono tracking-wide">Risk Analysis</h1>
            <p className="text-gray-500 text-sm font-mono">
              {result
                ? `Simulation ID: ${result.simulation_id} · Generated ${new Date(result.stats.generated_at).toLocaleTimeString()}`
                : 'No simulation loaded'}
            </p>
          </div>
          <div className="flex gap-3">
            <button
              id="run-simulation-btn"
              onClick={handleRunSimulation}
              disabled={status === 'running'}
              className="btn-primary"
            >
              {status === 'running' ? '⟳ Simulating...' : '▶ Run Simulation'}
            </button>
            <button
              onClick={() => runDemo()}
              disabled={status === 'running'}
              className="btn-secondary"
            >
              🎯 Load Demo
            </button>
          </div>
        </div>

        {/* Status banner */}
        {status === 'running' && (
          <div className="glass-panel flex items-center gap-3 border-blue-500/30">
            <span className="text-blue-400 animate-spin text-xl">⟳</span>
            <div>
              <p className="text-blue-300 font-mono text-sm">Simulation Running...</p>
              <p className="text-gray-500 font-mono text-xs">Propagating {result?.debris_objects.length ?? 50} objects over {config.window_hours}h window</p>
            </div>
          </div>
        )}

        {/* Error banner */}
        {error && (
          <div className="glass-panel flex items-center gap-3 border-red-500/30 bg-red-950/20">
            <span className="text-red-400 text-xl">⚠</span>
            <div>
              <p className="text-red-300 font-mono text-sm">Simulation Error</p>
              <p className="text-gray-400 font-mono text-xs">{error}</p>
            </div>
          </div>
        )}

        {/* KPI Cards */}
        <KpiCards stats={result?.stats ?? null} />

        {/* Tabs - Liquid Glass Segmented Control */}
        <div className="flex gap-1.5 p-1 rounded-full bg-white/[0.04] border border-white/[0.08] shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] w-fit backdrop-blur-md">
          {(['overview', 'table', 'configure'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 rounded-full text-xs font-mono uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                activeTab === tab
                  ? 'bg-gradient-to-b from-cyan-400/30 to-cyan-600/20 border border-cyan-400/50 text-cyan-200 shadow-[inset_0_1px_1px_rgba(255,255,255,0.3),0_2px_10px_rgba(6,182,212,0.25)]'
                  : 'border border-transparent text-gray-400 hover:text-gray-200 hover:bg-white/[0.05]'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Overview tab */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <RiskDistributionChart stats={result?.stats ?? null} />
            <div className="lg:col-span-2">
              <ApproachTimeline results={result?.risk_results ?? []} />
            </div>
            <div className="lg:col-span-3">
              <DistanceGraph riskEntry={selectedRisk} />
            </div>
          </div>
        )}

        {/* Risk Table tab */}
        {activeTab === 'table' && (
          <div>
            {result ? (
              <RiskTable results={result.risk_results} />
            ) : (
              <div className="glass-panel text-center py-12">
                <p className="text-gray-500 font-mono">Run a simulation to see the risk ranking table</p>
              </div>
            )}
          </div>
        )}

        {/* Configure tab */}
        {activeTab === 'configure' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="glass-panel">
              <h3 className="section-label mb-4">Satellite Parameters</h3>
              <SatelliteForm />
            </div>
            <div className="glass-panel">
              <h3 className="section-label mb-4">Simulation Window & Parameters</h3>
              <SimulationConfig onRun={handleRunSimulation} isLoading={status === 'running'} />
              <div className="mt-6 pt-4 border-t border-blue-900/30">
                <h3 className="section-label mb-4">Upload Custom Debris CSV</h3>
                <CsvUpload onLoaded={objs => setCustomDebris(objs)} />
                {customDebris && (
                  <p className="mt-2 text-green-400 text-xs font-mono">✓ {customDebris.length} custom debris objects loaded</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Disclaimer */}
        <div className="px-4 py-3 bg-yellow-900/10 border border-yellow-900/30 rounded text-xs font-mono text-yellow-700 leading-relaxed">
          ⚠ APPROXIMATE MODEL: Results are generated using simplified circular/Keplerian orbital propagation and configurable heuristic risk thresholds. 
          Outputs are for demonstration and research purposes only and are NOT intended for operational collision avoidance. 
          Demo risk classification — NOT ISRO/NASA operational thresholds.
        </div>
      </div>
    </div>
  );
}
