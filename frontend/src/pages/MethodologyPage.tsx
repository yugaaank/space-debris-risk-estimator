import { Link } from 'react-router-dom';

export function MethodologyPage() {
  return (
    <div className="min-h-screen pt-16 pb-16 px-4 max-w-5xl mx-auto space-y-8 font-sans">
      {/* Header */}
      <div className="border-b border-blue-900/40 pb-6">
        <div className="flex items-center gap-2 mb-2">
          <span className="px-2.5 py-0.5 rounded text-[11px] font-mono font-semibold bg-blue-500/10 border border-blue-500/30 text-blue-400">
            ENGINEERING WHITE PAPER
          </span>
          <span className="text-gray-500 text-xs font-mono">ISRO Hackathon 2026</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold font-mono tracking-tight text-white mb-2">
          Methodology & Mathematical Formulation
        </h1>
        <p className="text-sm md:text-base font-mono text-cyan-400/80">
          Fast Approximate Orbital Propagation, Closest Approach Detection, and Heuristic Risk Classification
        </p>
      </div>

      {/* Overview Card */}
      <div className="glass-panel p-6 border-blue-500/30 space-y-4">
        <h2 className="section-label text-sm">1. Executive Overview & Problem Context</h2>
        <p className="text-sm text-gray-300 leading-relaxed">
          Low Earth Orbit (LEO) is experiencing an exponential increase in resident space objects (RSOs),
          including active constellations, derelict rocket stages, and fragmentation debris. High-fidelity
          conjunction assessment via full numerical integration (Cowell's method with high-order Earth gravity models,
          atmospheric drag, and solar radiation pressure) is computationally intensive, requiring substantial compute clusters.
        </p>
        <p className="text-sm text-gray-300 leading-relaxed">
          <strong className="text-cyan-300">Orbital Shield</strong> provides an approximate, rapid screening pipeline designed
          to ingest orbital parameters, propagate trajectories using circular Keplerian mechanics, detect potential close
          approaches (Time of Closest Approach — TCA), and rank conjunction risk on an explainable 0–100 scale in near real-time.
        </p>
      </div>

      {/* Orbital Mechanics Section */}
      <div className="glass-panel p-6 border-blue-500/30 space-y-6">
        <h2 className="section-label text-sm">2. Orbital Mechanics & Propagation Model</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <h3 className="text-sm font-bold font-mono text-white">2.1 Fundamental Constants</h3>
            <ul className="text-xs font-mono space-y-2 text-gray-300 bg-gray-950/60 p-4 rounded border border-blue-900/30">
              <li><span className="text-cyan-400">μ (Standard Gravitational)</span> = 398,600.4418 km³/s²</li>
              <li><span className="text-cyan-400">R_E (Earth Equatorial Radius)</span> = 6,378.137 km</li>
              <li><span className="text-cyan-400">r (Orbital Radius)</span> = R_E + h (altitude)</li>
            </ul>
          </div>
          <div className="space-y-3">
            <h3 className="text-sm font-bold font-mono text-white">2.2 Kinematic Equations</h3>
            <div className="text-xs font-mono space-y-2 text-gray-300 bg-gray-950/60 p-4 rounded border border-blue-900/30">
              <p><span className="text-emerald-400">Orbital Velocity:</span> v = √(μ / r)</p>
              <p><span className="text-emerald-400">Orbital Period:</span> T = 2π √(r³ / μ)</p>
              <p><span className="text-emerald-400">Mean Motion:</span> n = 2π / T (rad/s) = √(μ / r³)</p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="text-sm font-bold font-mono text-white">2.3 Perifocal to ECI Coordinate Transformation</h3>
          <p className="text-xs text-gray-300 leading-relaxed">
            For each object with altitude <span className="text-cyan-300">h</span>, inclination <span className="text-cyan-300">i</span>,
            initial phase <span className="text-cyan-300">θ₀</span>, and RAAN (Right Ascension of Ascending Node) <span className="text-cyan-300">Ω</span>,
            the true anomaly at elapsed time <span className="text-cyan-300">t</span> is:
          </p>
          <div className="bg-gray-950/80 p-3 rounded border border-blue-900/40 text-xs font-mono text-cyan-300 text-center">
            θ(t) = θ₀ + n · t
          </div>
          <p className="text-xs text-gray-300 leading-relaxed">
            In the orbital plane (perifocal frame):
          </p>
          <div className="bg-gray-950/80 p-3 rounded border border-blue-900/40 text-xs font-mono text-gray-200">
            x_orb = r · cos(θ(t)), &nbsp; y_orb = r · sin(θ(t)), &nbsp; z_orb = 0
          </div>
          <p className="text-xs text-gray-300 leading-relaxed">
            Applying 3D rotation transforms the position vector into Earth-Centered Inertial (ECI) coordinates:
          </p>
          <div className="bg-gray-950/80 p-4 rounded border border-blue-900/40 text-xs font-mono text-blue-200 space-y-1">
            <p>X = x_orb · cos(Ω) - y_orb · cos(i) · sin(Ω)</p>
            <p>Y = x_orb · sin(Ω) + y_orb · cos(i) · cos(Ω)</p>
            <p>Z = y_orb · sin(i)</p>
          </div>
        </div>
      </div>

      {/* Closest Approach Detection */}
      <div className="glass-panel p-6 border-blue-500/30 space-y-4">
        <h2 className="section-label text-sm">3. Closest Approach Detection & TCA Refinement</h2>
        <p className="text-xs text-gray-300 leading-relaxed">
          At discrete time steps <span className="text-cyan-300">Δt</span> over the simulation window (e.g. 24 hours), the Euclidean separation between the primary satellite and each debris object is sampled:
        </p>
        <div className="bg-gray-950/80 p-3 rounded border border-blue-900/40 text-xs font-mono text-cyan-300 text-center">
          d(t) = || r_sat(t) - r_deb(t) || = √[ (X_s - X_d)² + (Y_s - Y_d)² + (Z_s - Z_d)² ]
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div className="p-3 bg-gray-900/50 rounded border border-gray-800 space-y-2">
            <h4 className="text-xs font-bold font-mono text-white">Coarse Co-planar Screening</h4>
            <p className="text-xs text-gray-400 leading-relaxed">
              Step across the simulation time domain with step size <span className="text-cyan-400">Δt = 60 s</span> to locate local distance minima where <span className="text-cyan-400">d(t_k) &lt; d(t_{'{k-1}'})</span> and <span className="text-cyan-400">d(t_k) &lt; d(t_{'{k+1}'})</span>.
            </p>
          </div>
          <div className="p-3 bg-gray-900/50 rounded border border-gray-800 space-y-2">
            <h4 className="text-xs font-bold font-mono text-white">Sub-step Parabolic Interpolation</h4>
            <p className="text-xs text-gray-400 leading-relaxed">
              Around the coarse minimum <span className="text-cyan-400">t*</span>, quadratic polynomial interpolation refines the exact Time of Closest Approach (TCA) and minimum separation down to sub-second precision.
            </p>
          </div>
        </div>
      </div>

      {/* Heuristic Risk Scoring */}
      <div className="glass-panel p-6 border-blue-500/30 space-y-6">
        <h2 className="section-label text-sm">4. Heuristic Risk Scoring Formula</h2>
        <p className="text-xs text-gray-300 leading-relaxed">
          Operational collision probability computation (e.g., Foster-1992, Akella-Alfriend) requires 3D position covariance matrices that are unavailable in approximate models. Instead, Orbital Shield employs an explainable, multi-attribute heuristic score <span className="text-cyan-300">S ∈ [0, 100]</span>:
        </p>
        <div className="bg-gray-950/80 p-4 rounded border border-cyan-900/40 text-center font-mono text-sm text-cyan-300">
          Risk Score = 0.55 · S_dist + 0.25 · S_vel + 0.20 · S_time
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-gray-950/60 rounded border border-blue-900/30 space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold font-mono text-white">Distance Score (55%)</h4>
              <span className="text-[10px] font-mono text-cyan-400">Weight: 0.55</span>
            </div>
            <p className="text-xs text-gray-400">
              Evaluates miss distance <span className="text-cyan-300">d_min</span>.
            </p>
            <ul className="text-[11px] font-mono text-gray-300 space-y-1">
              <li>&lt; 5 km: 100 pts</li>
              <li>5–20 km: 70–99 pts</li>
              <li>20–50 km: 40–69 pts</li>
              <li>50–100 km: 10–39 pts</li>
              <li>&gt; 100 km: 0 pts</li>
            </ul>
          </div>

          <div className="p-4 bg-gray-950/60 rounded border border-blue-900/30 space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold font-mono text-white">Relative Velocity (25%)</h4>
              <span className="text-[10px] font-mono text-cyan-400">Weight: 0.25</span>
            </div>
            <p className="text-xs text-gray-400">
              Kinetic energy scales quadratically with relative impact speed: <span className="text-cyan-300">E_k ∝ v_rel²</span>.
            </p>
            <ul className="text-[11px] font-mono text-gray-300 space-y-1">
              <li>&gt; 12 km/s: 100 pts (Head-on)</li>
              <li>8–12 km/s: 75 pts</li>
              <li>4–8 km/s: 50 pts</li>
              <li>&lt; 4 km/s: 25 pts (Co-orbital)</li>
            </ul>
          </div>

          <div className="p-4 bg-gray-950/60 rounded border border-blue-900/30 space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold font-mono text-white">Time Urgency (20%)</h4>
              <span className="text-[10px] font-mono text-cyan-400">Weight: 0.20</span>
            </div>
            <p className="text-xs text-gray-400">
              Reflects time remaining until event to plan avoidance maneuvers.
            </p>
            <ul className="text-[11px] font-mono text-gray-300 space-y-1">
              <li>&lt; 2 hrs: 100 pts (Immediate)</li>
              <li>2–6 hrs: 75 pts</li>
              <li>6–12 hrs: 50 pts</li>
              <li>&gt; 12 hrs: 25 pts</li>
            </ul>
          </div>
        </div>

        {/* Threshold table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs font-mono text-left border border-gray-800 rounded">
            <thead>
              <tr className="bg-gray-900/80 text-gray-400 border-b border-gray-800">
                <th className="p-2.5">Risk Level</th>
                <th className="p-2.5">Score Range</th>
                <th className="p-2.5">Distance Criteria</th>
                <th className="p-2.5">Recommended Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              <tr className="bg-red-950/20 text-red-300">
                <td className="p-2.5 font-bold">CRITICAL</td>
                <td className="p-2.5">Score ≥ 75</td>
                <td className="p-2.5">d_min ≤ 5 km</td>
                <td className="p-2.5">Immediate Conjunction Assessment & Thruster Burn Planning</td>
              </tr>
              <tr className="bg-orange-950/20 text-orange-300">
                <td className="p-2.5 font-bold">HIGH</td>
                <td className="p-2.5">50 ≤ Score &lt; 75</td>
                <td className="p-2.5">5 km &lt; d_min ≤ 20 km</td>
                <td className="p-2.5">High-cadence tracking & preliminary maneuver preparation</td>
              </tr>
              <tr className="bg-yellow-950/20 text-yellow-300">
                <td className="p-2.5 font-bold">MODERATE</td>
                <td className="p-2.5">25 ≤ Score &lt; 50</td>
                <td className="p-2.5">20 km &lt; d_min ≤ 50 km</td>
                <td className="p-2.5">Log encounter in collision avoidance manifest</td>
              </tr>
              <tr className="bg-emerald-950/10 text-emerald-300">
                <td className="p-2.5 font-bold">LOW</td>
                <td className="p-2.5">Score &lt; 25</td>
                <td className="p-2.5">d_min &gt; 50 km</td>
                <td className="p-2.5">Nominal observation; no operational action required</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Model Limitations & Disclaimers */}
      <div className="glass-panel p-6 border-yellow-500/30 space-y-4">
        <h2 className="section-label text-sm text-yellow-400">5. Operational Limitations & Disclaimers</h2>
        <div className="p-4 bg-yellow-900/10 border border-yellow-700/30 rounded text-xs font-mono text-yellow-200 leading-relaxed space-y-3">
          <p>
            <strong>⚠ HACKATHON RESEARCH & DEMONSTRATION NOTICE:</strong> This application employs a simplified
            Keplerian two-body propagation model with circular orbit approximations. It does NOT incorporate:
          </p>
          <ul className="list-disc list-inside space-y-1 text-yellow-300/90 pl-2">
            <li>Earth geopotential zonal harmonics (J₂, J₃, J₄, etc.) causing nodal precession and apsidal rotation.</li>
            <li>Thermospheric and exospheric atmospheric drag deceleration (NRLMSISE-00 / JB2008 models).</li>
            <li>Solar radiation pressure (SRP) and spacecraft area-to-mass ratio perturbations.</li>
            <li>Third-body gravitational perturbations from the Moon and the Sun.</li>
            <li>TLE/SGP4/SDP4 covariance matrix propagations for formal probability of collision (Pc).</li>
          </ul>
          <p className="text-[11px] text-yellow-400/80">
            For operational satellite collision avoidance missions, operators must utilize certified systems
            such as ISRO NETRA or NASA CARA utilizing high-fidelity numerical orbit determination.
          </p>
        </div>
      </div>

      {/* Call to action */}
      <div className="flex justify-between items-center pt-4">
        <Link to="/simulation" className="btn-primary text-xs no-underline">
          ← Launch 3D Simulation
        </Link>
        <Link to="/risk" className="btn-secondary text-xs no-underline">
          View Risk Analysis →
        </Link>
      </div>
    </div>
  );
}
