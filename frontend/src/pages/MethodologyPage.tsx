import { Link } from 'react-router-dom';

export function MethodologyPage() {
  return (
    <div className="min-h-screen bg-[var(--bg)]">
      {/* ── Top Bar ──────────────────────────────────────── */}
      <header className="h-10 flex items-center justify-between px-4 border-b border-[var(--border)]">
        <div className="flex items-center gap-4">
          <Link to="/" className="text-[11px] text-[var(--dim)] no-underline hover:text-[var(--fg)]">
            &lt; HOME
          </Link>
          <span className="text-[13px] font-extrabold">METHODOLOGY</span>
        </div>
        <div className="text-[10px] text-[var(--dim)]">
          v1.0.0
        </div>
      </header>

      {/* ── Content ──────────────────────────────────────── */}
      <div className="max-w-[900px] mx-auto px-4 py-8 space-y-6 text-[12px] leading-relaxed">

        <p className="text-[var(--dim)]">
          Space Debris Collision Risk Estimation System<br />
          ISRO Multi-Agency Space Situational Awareness Challenge 2026
        </p>

        {/* ── 1. Overview ────────────────────────────────── */}
        <section>
          <h2 className="font-bold border-b border-[var(--border)] pb-1 mb-3 uppercase">
            1. System Overview
          </h2>
          <p className="mb-3">
            The Orbital Shield system estimates collision risk between a tracked space object
            (satellite or debris) and the broader orbital population. It felines data from
            multiple sources, propagates orbits forward in time, and computes collision
            probabilities using Monte Carlo sampling.
          </p>
          <p className="text-[var(--dim)]">
            Pipeline: Data Ingestion → Orbit Propagation → Conjunction Screening →
            Probability Assessment → Risk Visualization
          </p>
        </section>

        {/* ── 2. Orbital Mechanics ───────────────────────── */}
        <section>
          <h2 className="font-bold border-b border-[var(--border)] pb-1 mb-3 uppercase">
            2. Orbital Mechanics
          </h2>
          <p className="mb-3">
            Positions propagated using SGP4/SDP4 analytical model. State vectors updated
            at configurable time steps. Earth gravitational model: WGS84.
          </p>
          <div className="border border-[var(--border)] p-3 bg-[#0a0a0a] font-bold text-[11px]">
            Keplerian Elements: a, e, i, Ω, ω, ν
          </div>
          <p className="mt-3 text-[var(--dim)]">
            Semi-major axis, eccentricity, inclination, RAAN, argument of perigee, true anomaly.
          </p>
        </section>

        {/* ── 3. Risk Assessment ─────────────────────────── */}
        <section>
          <h2 className="font-bold border-b border-[var(--border)] pb-1 mb-3 uppercase">
            3. Risk Assessment Methodology
          </h2>
          <p className="mb-3">
            Collision probability computed using Monte Carlo method with 10,000 samples per
            conjunction event. Position uncertainty modeled as 3D Gaussian around predicted state.
          </p>
          <div className="border border-[var(--border)] p-3 bg-[#0a0a0a] font-bold text-[11px]">
            P(collision) = Ncollisions / Ntotal × (R₁ + R₂)²
          </div>
          <p className="mt-3 mb-3 text-[var(--dim)]">
            Where R₁, R₂ are hard-body radii of objects.
          </p>

          <h3 className="font-bold mt-4 mb-2 uppercase">Risk Classification Thresholds</h3>
          <div className="overflow-x-auto terminal-border">
            <table>
              <thead>
                <tr>
                  <th className="w-2" />
                  <th>RISK LEVEL</th>
                  <th>PROBABILITY</th>
                  <th>ACTION</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="bg-[var(--critical)] border-[var(--bg)]" />
                  <td className="risk-critical font-bold">CRITICAL</td>
                  <td>{'>'} 1e-4</td>
                  <td>IMMEDIATE MANEUVER</td>
                </tr>
                <tr>
                  <td className="bg-[var(--high)] border-[var(--bg)]" />
                  <td className="risk-high font-bold">HIGH</td>
                  <td>1e-5 to 1e-4</td>
                  <td>ACTIVE MONITORING</td>
                </tr>
                <tr>
                  <td className="bg-[var(--muted)] border-[var(--bg)]" />
                  <td className="risk-moderate">MODERATE</td>
                  <td>1e-6 to 1e-5</td>
                  <td>Routine tracking</td>
                </tr>
                <tr>
                  <td className="bg-[#404040] border-[var(--bg)]" />
                  <td className="risk-low">LOW</td>
                  <td>{'<' } 1e-6</td>
                  <td>Catalog maintenance</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* ── 4. Data Sources ────────────────────────────── */}
        <section>
          <h2 className="font-bold border-b border-[var(--border)] pb-1 mb-3 uppercase">
            4. Data Sources
          </h2>
          <ul className="square-list space-y-1 mb-3">
            <li>NORAD Two-Line Element Sets (TLEs)</li>
            <li>ESA Space Debris Office population models</li>
            <li>ISRO Space Situational Awareness data</li>
            <li>CelesTrak orbital element database</li>
          </ul>
          <p className="text-[var(--dim)]">
            Default catalog: 50 objects in LEO/MEO/GEO regimes. Custom CSV upload supported
            for user-defined constellations.
          </p>
        </section>

        {/* ── 5. Simulation Parameters ───────────────────── */}
        <section>
          <h2 className="font-bold border-b border-[var(--border)] pb-1 mb-3 uppercase">
            5. Simulation Parameters
          </h2>
          <div className="grid grid-cols-2 gap-px">
            {[
              { label: 'PROPAGATION TIME', value: '24-720 hours (1-30 days)' },
              { label: 'TIME STEP', value: '1-60 minutes' },
              { label: 'MONTE CARLO SAMPLES', value: '10,000 per event' },
              { label: 'HARD-BODY RADIUS', value: '10-50 meters' },
              { label: 'POSITION UNCERTAINTY', value: '1-10 km (1σ)' },
              { label: 'PROBABILITY THRESHOLD', value: '1e-6 (configurable)' },
            ].map(({ label, value }) => (
              <div key={label} className="terminal-border p-3 bg-[var(--bg)]">
                <div className="text-[10px] text-[var(--dim)] mb-1">{label}</div>
                <div className="font-bold">{value}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── 6. Limitations ─────────────────────────────── */}
        <section>
          <h2 className="font-bold border-b border-[var(--border)] pb-1 mb-3 uppercase">
            6. Limitations & Assumptions
          </h2>
          <ul className="square-list space-y-1 mb-3">
            <li>SGP4 accuracy degrades beyond ~30 days</li>
            <li>No atmospheric drag modeling</li>
            <li>No solar radiation pressure effects</li>
            <li>Position uncertainty is simplified</li>
            <li>Monte Carlo convergence varies by geometry</li>
          </ul>
        </section>

        {/* ── 7. References ──────────────────────────────── */}
        <section>
          <h2 className="font-bold border-b border-[var(--border)] pb-1 mb-3 uppercase">
            7. References
          </h2>
          <ol className="list-decimal pl-6 space-y-1 text-[var(--dim)]">
            <li>Vallado, D.A. — "Fundamentals of Astrodynamics and Applications"</li>
            <li>Hoots, F.R. &amp; Roehrich, R.L. — "Spacetrack Report No. 3"</li>
            <li>Chan, F.K. — "Spacecraft Collision Avoidance" (2008)</li>
            <li>Shepperd, S.W. — "Universal Keplerian State Transition Matrix"</li>
            <li>Foster, J.L. — "The 1998ESA Conjunction Event Model"</li>
          </ol>
        </section>

        {/* ── Disclaimer ─────────────────────────────────── */}
        <div className="border border-[var(--critical)] p-4 mt-8 text-[var(--critical)]">
          <p className="font-bold mb-1">DISCLAIMER</p>
          <p className="text-[#fca5a5]">
            This system is for educational and research purposes only. Not for operational
            use. Always verify conjunction assessments with official SSA providers before
            making maneuvering decisions.
          </p>
        </div>
      </div>
    </div>
  );
}
