import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../api/client';

export function ObjectsPage() {
  const [objects, setObjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isNavigating, setIsNavigating] = useState<string | null>(null);

  useEffect(() => {
    apiClient.getObjects()
      .then((data: any) => {
        const list = Array.isArray(data) ? data : data.objects ?? [];
        setObjects(list);
      })
      .catch((err: any) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const filtered = searchTerm
    ? objects.filter(o =>
        (o.id ?? '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (o.name ?? '').toLowerCase().includes(searchTerm.toLowerCase())
      )
    : objects;

  const leoCount = objects.filter(o => (o.altitude_km ?? o.altitude ?? 0) < 2000).length;
  const avgAlt = objects.length > 0
    ? (objects.reduce((sum, o) => sum + (o.altitude_km ?? o.altitude ?? 0), 0) / objects.length).toFixed(0)
    : '—';
  const highInc = objects.filter(o => (o.inclination_deg ?? o.inclination ?? 0) > 60).length;

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      {/* Top Bar */}
      <header className="h-10 flex items-center justify-between px-4 border-b border-[var(--border)]">
        <div className="flex items-center gap-4">
          <Link to="/" className="text-[11px] text-[var(--dim)] no-underline hover:text-[var(--fg)]">
            &lt; HOME
          </Link>
          <span className="text-[13px] font-extrabold">OBJECTS CATALOGUE</span>
        </div>
        <div className="flex items-center gap-3 text-[10px] text-[var(--dim)] hide-mobile">
          <Link to="/simulation" className="no-underline text-[var(--dim)] hover:text-[var(--fg)]">
            SIMULATE
          </Link>
          <span>|</span>
          <Link to="/risk" className="no-underline text-[var(--dim)] hover:text-[var(--fg)]">
            RISKS
          </Link>
        </div>
      </header>

      <div className="p-4 space-y-4">
        {/* Stats Block */}
        <div className="terminal-border p-3 text-[11px] flex flex-wrap gap-4">
          <span>TOTAL: <strong>{objects.length}</strong></span>
          <span className="text-[var(--dim)]">|</span>
          <span>LEO: <strong>{leoCount}</strong></span>
          <span className="text-[var(--dim)]">|</span>
          <span>AVG ALT: <strong>{avgAlt} km</strong></span>
          <span className="text-[var(--dim)]">|</span>
          <span>HIGH INC: <strong>{highInc}</strong></span>
        </div>

        {/* Search */}
        <div className="flex gap-0">
          <input
            type="text"
            placeholder="SEARCH BY ID OR NAME..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field flex-1"
          />
        </div>

        {/* Objects Table */}
        <div className="overflow-x-auto terminal-border">
          <table>
            <thead>
              <tr>
                <th>OBJECT ID</th>
                <th>NAME</th>
                <th className="text-right">ALT (KM)</th>
                <th className="text-right">INC (DEG)</th>
                <th className="text-right">PER (MIN)</th>
                <th className="text-right">RAAN (DEG)</th>
                <th>TYPE</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(obj => (
                <tr key={obj.id ?? obj.object_id}>
                  <td className="text-[var(--dim)]">{obj.id ?? obj.object_id}</td>
                  <td>{obj.name ?? '—'}</td>
                  <td className="text-right font-bold">{(obj.altitude_km ?? obj.altitude ?? 0).toFixed(1)}</td>
                  <td className="text-right">{(obj.inclination_deg ?? obj.inclination ?? 0).toFixed(1)}</td>
                  <td className="text-right">{(obj.period_minutes ?? obj.period ?? 0).toFixed(1)}</td>
                  <td className="text-right">{(obj.raan_deg ?? obj.ascending_node_deg ?? 0).toFixed(1)}</td>
                  <td>[{(obj.object_type ?? 'UNKNOWN').toUpperCase()}]</td>
                  <td>
                    <Link
                      to={`/simulation?objectId=${obj.id ?? obj.object_id}`}
                      className="text-[var(--dim)] no-underline hover:text-[var(--fg)] hover:underline text-[11px]"
                      onClick={() => setIsNavigating(obj.id ?? obj.object_id)}
                    >
                      {isNavigating === (obj.id ?? obj.object_id) ? 'LOADING...' : 'SIMULATE'}
                    </Link>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && !loading && (
                <tr>
                  <td colSpan={8} className="text-center text-[var(--dim)] py-8">
                    NO OBJECTS FOUND
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
