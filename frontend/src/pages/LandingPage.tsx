import { Link } from 'react-router-dom';
import { useSystemStatus } from '../components/layout/SystemStatus';

export function LandingPage() {
  const status = useSystemStatus();
  const isOnline = status.status === 'online';

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--fg)] flex flex-col">
      {/* ── Hero ────────────────────────────────────────────── */}
      <div className="border-b-[3px] border-[var(--fg)]">
        <div className="max-w-[1200px] mx-auto px-6 py-12 md:py-20">
          <p className="text-[11px] text-[var(--dim)] tracking-[0.2em] mb-4">
            ISRO CHALLENGE 2026
          </p>
          <h1 className="text-[48px] md:text-[72px] font-extrabold leading-[0.9] tracking-tight mb-6">
            ORBITAL<br />SHIELD
          </h1>
          <p className="text-[13px] text-[var(--muted)] max-w-[500px] leading-relaxed">
            Space debris collision risk estimation system.
            Multi-agency space situational awareness platform.
          </p>
        </div>
      </div>

      {/* ── Status Strip ────────────────────────────────────── */}
      <div className="border-b-[3px] border-[var(--fg)] bg-[var(--fg)] text-[var(--bg)]">
        <div className="max-w-[1200px] mx-auto px-6 py-3 flex flex-wrap items-center gap-6 text-[11px] font-bold">
          <div className="flex items-center gap-2">
            <span className={`w-[6px] h-[6px] ${isOnline ? 'bg-[#00cc00]' : 'bg-[var(--critical)]'}`} />
            <span>{isOnline ? 'ENGINE ONLINE' : 'ENGINE OFFLINE'}</span>
          </div>
          <span className="text-[var(--dim)]">|</span>
          <span>{status.health?.tracked_objects ?? '—'} RSOs TRACKED</span>
          <span className="text-[var(--dim)]">|</span>
          <span>LEO: 50</span>
          <span className="text-[var(--dim)]">|</span>
          <span>RISK ENGINE: {status.health?.risk_engine?.toUpperCase() ?? '—'}</span>
          <span className="text-[var(--dim)]">|</span>
          <span>{new Date().toISOString().slice(0, 10)}</span>
        </div>
      </div>

      {/* ── Main Content ────────────────────────────────────── */}
      <div className="flex-1">
        <div className="max-w-[1200px] mx-auto px-6">

          {/* ── Threat Levels ──────────────────────────────── */}
          <div className="border-b-[3px] border-[var(--fg)] py-8">
            <h2 className="text-[11px] font-bold tracking-[0.2em] text-[var(--dim)] mb-6">
              THREAT CLASSIFICATION
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-[3px]">
              {[
                { level: 'CRITICAL', color: 'bg-[var(--critical)]', desc: 'Collision probability above 1e-4. Immediate maneuver assessment required.' },
                { level: 'HIGH', color: 'bg-[var(--high)]', desc: 'Probability between 1e-5 and 1e-4. Active monitoring within 72 hours.' },
                { level: 'MODERATE', color: 'bg-[var(--dim)]', desc: 'Probability between 1e-6 and 1e-5. Routine tracking.' },
                { level: 'LOW', color: 'bg-[#333]', desc: 'Below monitoring threshold. Catalog maintenance only.' },
              ].map(item => (
                <div key={item.level} className="border border-[var(--border)] p-4 flex gap-4 items-start">
                  <div className={`w-[3px] h-[40px] shrink-0 mt-0.5 ${item.color}`} />
                  <div>
                    <p className="text-[13px] font-bold mb-1">{item.level}</p>
                    <p className="text-[12px] text-[var(--dim)] leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Capabilities ────────────────────────────────── */}
          <div className="border-b-[3px] border-[var(--fg)] py-8">
            <h2 className="text-[11px] font-bold tracking-[0.2em] text-[var(--dim)] mb-6">
              SYSTEM CAPABILITIES
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-[3px]">
              {[
                { title: 'DATA FUSION', items: ['NORAD Two-Line Elements', 'ESA debris population', 'ISRO tracking data', 'CelesTrak catalog'] },
                { title: 'PROPAGATION', items: ['SGP4/SDP4 analytical model', 'WGS84 gravity field', 'Configurable time steps', '30-day forecasting'] },
                { title: 'ANALYSIS', items: ['Monte Carlo probability', 'Conjunction screening', 'Risk classification', '3D visualization'] },
              ].map(block => (
                <div key={block.title} className="border border-[var(--border)] p-4">
                  <p className="text-[11px] font-bold mb-3">{block.title}</p>
                  <ul className="space-y-1">
                    {block.items.map((item, i) => (
                      <li key={i} className="text-[12px] text-[var(--dim)] flex gap-2">
                        <span className="text-[var(--border)]">{'>'}</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* ── Quick Access ────────────────────────────────── */}
          <div className="py-8">
            <h2 className="text-[11px] font-bold tracking-[0.2em] text-[var(--dim)] mb-6">
              QUICK ACCESS
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-[3px]">
              {[
                { to: '/simulation', label: 'SIMULATION', sub: '3D orbital view' },
                { to: '/risk', label: 'RISK ANALYSIS', sub: 'Collision reports' },
                { to: '/objects', label: 'OBJECTS', sub: 'Debris catalog' },
                { to: '/methodology', label: 'METHODOLOGY', sub: 'Technical docs' },
              ].map((link, i) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`border-[3px] border-[var(--fg)] p-5 no-underline group transition-colors ${
                    i === 0
                      ? 'bg-[var(--fg)] text-[var(--bg)]'
                      : 'bg-transparent text-[var(--fg)]'
                  } hover:bg-[var(--critical)] hover:text-[var(--fg)] hover:border-[var(--critical)]`}
                >
                  <p className="text-[14px] font-extrabold mb-1">{link.label}</p>
                  <p className="text-[11px] opacity-60">{link.sub}</p>
                </Link>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* ── Footer ──────────────────────────────────────────── */}
      <footer className="border-t-[3px] border-[var(--fg)]">
        <div className="max-w-[1200px] mx-auto px-6 py-4 flex flex-wrap items-center justify-between gap-4 text-[10px] text-[var(--dim)]">
          <span className="font-bold">ORBITAL SHIELD v1.0.0</span>
          <span>ISRO HACKATHON 2026</span>
          <span>NOT FOR OPERATIONAL USE</span>
        </div>
      </footer>
    </div>
  );
}
