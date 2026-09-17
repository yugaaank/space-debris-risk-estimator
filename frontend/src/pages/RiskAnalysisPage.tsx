import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useSimulationStore } from '../store/simulationStore';
import { RiskTable } from '../components/risk/RiskTable';
import { KpiCards } from '../components/dashboard/KpiCards';

export function RiskAnalysisPage() {
  const { status, result } = useSimulationStore();

  const metrics = useMemo(() => {
    if (!result) return null;
    return {
      'Total Objects': result.debris_objects.length + 1,
      'Risks Found': result.risk_results.length,
      'Critical': result.risk_results.filter(r => r.risk_level === 'CRITICAL').length,
      'High': result.risk_results.filter(r => r.risk_level === 'HIGH').length,
      'Moderate': result.risk_results.filter(r => r.risk_level === 'MODERATE').length,
      'Low': result.risk_results.filter(r => r.risk_level === 'LOW').length,
      'Min Distance': result.risk_results.length > 0
        ? `${Math.min(...result.risk_results.map(r => r.min_distance_km)).toFixed(1)} km`
        : '—',
      'Max Velocity': result.risk_results.length > 0
        ? `${Math.max(...result.risk_results.map(r => r.relative_velocity_km_s)).toFixed(2)} km/s`
        : '—',
    };
  }, [result]);

  const riskDistribution = useMemo(() => {
    if (!result) return null;
    const counts = { CRITICAL: 0, HIGH: 0, MODERATE: 0, LOW: 0 };
    result.risk_results.forEach(r => { counts[r.risk_level]++; });
    const total = result.risk_results.length || 1;
    return {
      CRITICAL: Math.round((counts.CRITICAL / total) * 100),
      HIGH: Math.round((counts.HIGH / total) * 100),
      MODERATE: Math.round((counts.MODERATE / total) * 100),
      LOW: Math.round((counts.LOW / total) * 100),
      raw: counts,
    };
  }, [result]);

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      {/* Top Bar */}
      <header className="h-10 flex items-center justify-between px-4 border-b border-[var(--border)]">
        <div className="flex items-center gap-4">
          <Link to="/" className="text-[11px] text-[var(--dim)] no-underline hover:text-[var(--fg)]">
            &lt; HOME
          </Link>
          <span className="text-[13px] font-extrabold">RISK ANALYSIS</span>
        </div>
        <div className="text-[10px] text-[var(--dim)]">
          {status === 'complete' && result && (
            <span>SIM {result.simulation_id}</span>
          )}
        </div>
      </header>

      {/* Status Line */}
      <div className="border-b border-[var(--border)] px-4 py-2 text-[11px]">
        <span className="text-[var(--dim)]">STATUS: </span>
        <span className={
          status === 'running' ? 'text-[var(--high)]' :
          status === 'complete' ? 'text-[#22c55e]' :
          status === 'error' ? 'text-[var(--critical)]' :
          'text-[var(--dim)]'
        }>
          {status === 'running' ? 'COMPUTING...' :
           status === 'complete' ? `${result?.risk_results?.length ?? 0} RISKS DETECTED` :
           status === 'error' ? 'ERROR — CHECK INPUTS' :
           'AWAITING SIMULATION'}
        </span>
      </div>

      <div className="p-4 space-y-4">
        {/* KPI Cards */}
        {metrics && <KpiCards metrics={metrics} />}

        {/* No Data State */}
        {status === 'idle' && (
          <div className="border border-[var(--border)] p-8 text-center">
            <p className="text-[var(--dim)] mb-2">NO SIMULATION DATA</p>
            <p className="text-[11px] text-[#404040] mb-4">
              Run a simulation first to generate risk analysis.
            </p>
            <Link
              to="/simulation"
              className="btn-terminal inline-block text-[11px] no-underline"
            >
              GO TO SIMULATION
            </Link>
          </div>
        )}

        {/* Running State */}
        {status === 'running' && (
          <div className="border border-[var(--border)] p-8 text-center">
            <div className="inline-block w-4 h-4 border-2 border-[var(--fg)] border-t-transparent animate-spin mb-4" />
            <p className="text-[11px] text-[var(--high)]">
              COMPUTING COLLISION PROBABILITIES...
            </p>
          </div>
        )}

        {/* Results */}
        {status === 'complete' && result && (
          <>
            {/* Risk Distribution */}
            {riskDistribution && (
              <div className="border border-[var(--border)] p-4">
                <p className="section-title">RISK DISTRIBUTION</p>
                <div className="space-y-2">
                  {(['CRITICAL', 'HIGH', 'MODERATE', 'LOW'] as const).map(level => (
                    <div key={level} className="flex items-center gap-3 text-[11px]">
                      <span className={`w-20 ${level === 'CRITICAL' ? 'risk-critical' : level === 'HIGH' ? 'risk-high' : 'text-[var(--dim)]'}`}>
                        {level}
                      </span>
                      <div className="flex-1 h-2 border border-[var(--border)] bg-[var(--bg)]">
                        <div
                          className={`h-full ${
                            level === 'CRITICAL' ? 'bg-[var(--critical)]' :
                            level === 'HIGH' ? 'bg-[var(--high)]' :
                            level === 'MODERATE' ? 'bg-[var(--muted)]' :
                            'bg-[#404040]'
                          }`}
                          style={{ width: `${riskDistribution[level]}%` }}
                        />
                      </div>
                      <span className="w-12 text-right text-[var(--dim)]">
                        {riskDistribution.raw[level]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Risk Table */}
            <div>
              <p className="section-title">RISK TABLE</p>
              <RiskTable risks={result.risk_results} compact={false} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
