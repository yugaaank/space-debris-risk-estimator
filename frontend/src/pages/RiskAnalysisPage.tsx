import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useSimulationStore } from '../store/simulationStore';
import { RiskBadge } from '../components/risk/RiskBadge';
import { RiskTable } from '../components/risk/RiskTable';
import { KpiCards } from '../components/dashboard/KpiCards';

export function RiskAnalysisPage() {
  const { status, result } = useSimulationStore();

  const metrics = useMemo(() => {
    if (!result) return null;
    return {
      'Total Objects': result.total_objects_analyzed,
      'Risks Found': result.total_risks_detected,
      'Critical': result.risk_results.filter(r => r.risk_level === 'critical').length,
      'High': result.risk_results.filter(r => r.risk_level === 'high').length,
      'Moderate': result.risk_results.filter(r => r.risk_level === 'moderate').length,
      'Low': result.risk_results.filter(r => r.risk_level === 'low').length,
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
    const counts = { critical: 0, high: 0, moderate: 0, low: 0 };
    result.risk_results.forEach(r => { counts[r.risk_level.toLowerCase() as keyof typeof counts]++; });
    const total = result.risk_results.length || 1;
    return {
      critical: Math.round((counts.critical / total) * 100),
      high: Math.round((counts.high / total) * 100),
      moderate: Math.round((counts.moderate / total) * 100),
      low: Math.round((counts.low / total) * 100),
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
           status === 'complete' ? `${result?.total_risks_detected ?? 0} RISKS DETECTED` :
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
                  {(['critical', 'high', 'moderate', 'low'] as const).map(level => (
                    <div key={level} className="flex items-center gap-3 text-[11px]">
                      <span className={`w-20 ${level === 'critical' ? 'risk-critical' : level === 'high' ? 'risk-high' : 'text-[var(--dim)]'}`}>
                        {level.toUpperCase()}
                      </span>
                      <div className="flex-1 h-2 border border-[var(--border)] bg-[var(--bg)]">
                        <div
                          className={`h-full ${
                            level === 'critical' ? 'bg-[var(--critical)]' :
                            level === 'high' ? 'bg-[var(--high)]' :
                            level === 'moderate' ? 'bg-[var(--muted)]' :
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
