import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/client';
import type { OrbitalObjectInput } from '../types';
import { useSimulationStore } from '../store/simulationStore';
import { CsvUpload } from '../components/forms/CsvUpload';

export function ObjectsPage() {
  const navigate = useNavigate();
  const { setSatellite, setSelectedObject } = useSimulationStore();
  const [objects, setObjects] = useState<OrbitalObjectInput[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'DEBRIS' | 'SATELLITE' | 'ROCKET BODY'>('ALL');
  const [altitudeFilter, setAltitudeFilter] = useState<'ALL' | 'LEO' | 'MEO' | 'GEO'>('ALL');
  const [sortBy, setSortBy] = useState<'altitude_km' | 'inclination_deg' | 'name' | 'object_id'>('altitude_km');
  const [sortAsc, setSortAsc] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showUpload, setShowUpload] = useState(false);

  // New object manual form
  const [newObj, setNewObj] = useState<OrbitalObjectInput>({
    object_id: '',
    name: '',
    altitude_km: 600,
    inclination_deg: 53.0,
    phase_deg: 0,
    raan_deg: 0,
    eccentricity: 0,
    object_type: 'DEBRIS',
  });

  useEffect(() => {
    async function fetchObjects() {
      try {
        setLoading(true);
        const res = await apiClient.getObjects();
        setObjects(res.objects || []);
      } catch (err) {
        console.error('Failed to load objects:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchObjects();
  }, []);

  // Filtered & sorted
  const filtered = useMemo(() => {
    return objects
      .filter(obj => {
        const matchesSearch =
          obj.object_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          obj.name.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesType =
          typeFilter === 'ALL' ||
          (typeFilter === 'DEBRIS' && obj.object_type === 'DEBRIS') ||
          (typeFilter === 'SATELLITE' && obj.object_type === 'SATELLITE') ||
          (typeFilter === 'ROCKET BODY' && obj.name.toUpperCase().includes('DEB') === false);

        let matchesAlt = true;
        if (altitudeFilter === 'LEO') matchesAlt = obj.altitude_km < 2000;
        else if (altitudeFilter === 'MEO') matchesAlt = obj.altitude_km >= 2000 && obj.altitude_km < 35786;
        else if (altitudeFilter === 'GEO') matchesAlt = obj.altitude_km >= 35786;

        return matchesSearch && matchesType && matchesAlt;
      })
      .sort((a, b) => {
        const valA = a[sortBy];
        const valB = b[sortBy];
        if (typeof valA === 'string' && typeof valB === 'string') {
          return sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
        }
        return sortAsc ? (Number(valA) - Number(valB)) : (Number(valB) - Number(valA));
      });
  }, [objects, searchQuery, typeFilter, altitudeFilter, sortBy, sortAsc]);

  const stats = useMemo(() => {
    const total = objects.length;
    const avgAlt = total ? objects.reduce((s, o) => s + o.altitude_km, 0) / total : 0;
    const leoCount = objects.filter(o => o.altitude_km < 2000).length;
    const highInc = objects.filter(o => o.inclination_deg > 60).length;
    return { total, avgAlt, leoCount, highInc };
  }, [objects]);

  const handleAddObject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newObj.object_id || !newObj.name) return;
    setObjects(prev => [newObj, ...prev]);
    setShowAddModal(false);
    setNewObj({
      object_id: '',
      name: '',
      altitude_km: 600,
      inclination_deg: 53.0,
      phase_deg: 0,
      raan_deg: 0,
      eccentricity: 0,
      object_type: 'DEBRIS',
    });
  };

  const handleSelectAsTarget = (obj: OrbitalObjectInput) => {
    setSelectedObject(obj.object_id);
    navigate('/simulation');
  };

  const handleSetAsSatellite = (obj: OrbitalObjectInput) => {
    setSatellite({
      ...obj,
      object_type: 'SATELLITE',
    });
    navigate('/simulation');
  };

  return (
    <div className="min-h-screen pt-16 pb-12 px-4 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-blue-900/30 pb-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold font-mono tracking-wider text-white">
            ORBITAL OBJECT CATALOGUE
          </h1>
          <p className="text-xs md:text-sm font-mono text-cyan-400/80">
            Database of tracked resident space objects, orbital debris, and operational spacecraft
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowUpload(!showUpload)}
            className="btn-secondary text-xs"
          >
            {showUpload ? '✕ Close Upload' : '📤 Import CSV'}
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-primary text-xs"
          >
            + Add Object
          </button>
        </div>
      </div>

      {/* CSV Upload Drawer */}
      {showUpload && (
        <div className="glass-panel p-6 border-blue-500/40 animate-fadeIn">
          <h3 className="section-label mb-3">Upload Custom Debris File</h3>
          <p className="text-xs font-mono text-gray-400 mb-4">
            Upload a CSV with columns: <code className="text-cyan-300">object_id, name, altitude_km, inclination_deg, phase_deg, raan_deg</code>
          </p>
          <CsvUpload
            onLoaded={newObjs => {
              setObjects(prev => [...newObjs, ...prev]);
              setShowUpload(false);
            }}
          />
        </div>
      )}

      {/* Quick KPI stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-panel p-4">
          <p className="text-[11px] font-mono text-gray-400 uppercase">Tracked Objects</p>
          <p className="text-2xl font-bold font-mono text-cyan-300">{stats.total}</p>
          <p className="text-[10px] font-mono text-gray-500">In memory catalogue</p>
        </div>
        <div className="glass-panel p-4">
          <p className="text-[11px] font-mono text-gray-400 uppercase">LEO Population</p>
          <p className="text-2xl font-bold font-mono text-blue-400">{stats.leoCount}</p>
          <p className="text-[10px] font-mono text-gray-500">Alt &lt; 2,000 km</p>
        </div>
        <div className="glass-panel p-4">
          <p className="text-[11px] font-mono text-gray-400 uppercase">Average Altitude</p>
          <p className="text-2xl font-bold font-mono text-emerald-400">{stats.avgAlt.toFixed(0)} km</p>
          <p className="text-[10px] font-mono text-gray-500">Mean orbital height</p>
        </div>
        <div className="glass-panel p-4">
          <p className="text-[11px] font-mono text-gray-400 uppercase">High Inclination</p>
          <p className="text-2xl font-bold font-mono text-yellow-400">{stats.highInc}</p>
          <p className="text-[10px] font-mono text-gray-500">i &gt; 60° (Polar/SSO)</p>
        </div>
      </div>

      {/* Filters and search */}
      <div className="glass-panel p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <span className="absolute left-3 top-2.5 text-xs text-gray-500 font-mono">🔍</span>
          <input
            type="text"
            placeholder="Search by ID or name..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs font-mono bg-gray-900/80 border border-blue-900/40 rounded focus:border-cyan-400 focus:outline-none text-gray-200"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-gray-400">Type:</span>
            <select
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value as any)}
              className="px-2 py-1 text-xs font-mono bg-gray-900 border border-blue-900/40 rounded text-gray-300 focus:outline-none"
            >
              <option value="ALL">All Types</option>
              <option value="DEBRIS">Debris</option>
              <option value="SATELLITE">Satellite</option>
              <option value="ROCKET BODY">Rocket Body</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-gray-400">Regime:</span>
            <select
              value={altitudeFilter}
              onChange={e => setAltitudeFilter(e.target.value as any)}
              className="px-2 py-1 text-xs font-mono bg-gray-900 border border-blue-900/40 rounded text-gray-300 focus:outline-none"
            >
              <option value="ALL">All Altitudes</option>
              <option value="LEO">LEO (&lt;2000 km)</option>
              <option value="MEO">MEO (2k-35k km)</option>
              <option value="GEO">GEO (&gt;35k km)</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-gray-400">Sort:</span>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="px-2 py-1 text-xs font-mono bg-gray-900 border border-blue-900/40 rounded text-gray-300 focus:outline-none"
            >
              <option value="altitude_km">Altitude</option>
              <option value="inclination_deg">Inclination</option>
              <option value="object_id">Object ID</option>
              <option value="name">Name</option>
            </select>
            <button
              onClick={() => setSortAsc(!sortAsc)}
              className="px-2 py-1 text-xs font-mono bg-gray-900 border border-blue-900/40 rounded text-cyan-400 hover:bg-gray-800"
              title="Toggle sort direction"
            >
              {sortAsc ? '▲ ASC' : '▼ DESC'}
            </button>
          </div>
        </div>
      </div>

      {/* Objects Table */}
      <div className="glass-panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead>
              <tr className="border-b border-blue-900/30 text-gray-400 uppercase bg-blue-950/20 text-[11px]">
                <th className="py-3 px-4">Object ID</th>
                <th className="py-3 px-4">Name / Designator</th>
                <th className="py-3 px-4">Altitude (km)</th>
                <th className="py-3 px-4">Inclination</th>
                <th className="py-3 px-4">Phase (θ)</th>
                <th className="py-3 px-4">RAAN (Ω)</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-blue-900/20">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-gray-400">
                    <span className="animate-spin inline-block mr-2">⟳</span> Loading orbital objects...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-gray-500">
                    No objects match the current search or filters.
                  </td>
                </tr>
              ) : (
                filtered.map(obj => (
                  <tr
                    key={obj.object_id}
                    className="hover:bg-blue-900/10 transition-colors"
                  >
                    <td className="py-2.5 px-4 font-semibold text-cyan-300">
                      {obj.object_id}
                    </td>
                    <td className="py-2.5 px-4 text-gray-200">
                      {obj.name}
                    </td>
                    <td className="py-2.5 px-4 text-emerald-400">
                      {obj.altitude_km.toFixed(1)} km
                    </td>
                    <td className="py-2.5 px-4 text-yellow-300">
                      {obj.inclination_deg.toFixed(1)}°
                    </td>
                    <td className="py-2.5 px-4 text-gray-400">
                      {obj.phase_deg.toFixed(1)}°
                    </td>
                    <td className="py-2.5 px-4 text-gray-400">
                      {obj.raan_deg.toFixed(1)}°
                    </td>
                    <td className="py-2.5 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        obj.object_type === 'SATELLITE'
                          ? 'bg-blue-950 text-blue-300 border border-blue-500/40'
                          : 'bg-red-950/50 text-red-300 border border-red-500/30'
                      }`}>
                        {obj.object_type || 'DEBRIS'}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-right space-x-2">
                      <button
                        onClick={() => handleSelectAsTarget(obj)}
                        className="px-2 py-1 bg-cyan-950/60 hover:bg-cyan-900/80 text-cyan-300 border border-cyan-700/50 rounded text-[11px] transition-all"
                        title="Highlight in 3D Scene"
                      >
                        Track 3D
                      </button>
                      <button
                        onClick={() => handleSetAsSatellite(obj)}
                        className="px-2 py-1 bg-blue-950/60 hover:bg-blue-900/80 text-blue-300 border border-blue-700/50 rounded text-[11px] transition-all"
                        title="Designate as primary satellite"
                      >
                        Set as Primary
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Object Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel max-w-md w-full p-6 border-cyan-500/40">
            <h3 className="text-lg font-bold font-mono text-white mb-4">Register Orbital Object</h3>
            <form onSubmit={handleAddObject} className="space-y-4 font-mono text-xs">
              <div>
                <label className="block text-gray-400 mb-1">Object ID (e.g., DEB-999)</label>
                <input
                  required
                  type="text"
                  value={newObj.object_id}
                  onChange={e => setNewObj({ ...newObj, object_id: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-1.5 bg-gray-900 border border-gray-700 rounded text-gray-200"
                />
              </div>
              <div>
                <label className="block text-gray-400 mb-1">Object Name</label>
                <input
                  required
                  type="text"
                  value={newObj.name}
                  onChange={e => setNewObj({ ...newObj, name: e.target.value })}
                  className="w-full px-3 py-1.5 bg-gray-900 border border-gray-700 rounded text-gray-200"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-400 mb-1">Altitude (km)</label>
                  <input
                    required
                    type="number"
                    value={newObj.altitude_km}
                    onChange={e => setNewObj({ ...newObj, altitude_km: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-1.5 bg-gray-900 border border-gray-700 rounded text-gray-200"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-1">Inclination (deg)</label>
                  <input
                    required
                    type="number"
                    step="0.1"
                    value={newObj.inclination_deg}
                    onChange={e => setNewObj({ ...newObj, inclination_deg: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-1.5 bg-gray-900 border border-gray-700 rounded text-gray-200"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-400 mb-1">Phase θ (deg)</label>
                  <input
                    type="number"
                    value={newObj.phase_deg}
                    onChange={e => setNewObj({ ...newObj, phase_deg: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-1.5 bg-gray-900 border border-gray-700 rounded text-gray-200"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-1">RAAN Ω (deg)</label>
                  <input
                    type="number"
                    value={newObj.raan_deg}
                    onChange={e => setNewObj({ ...newObj, raan_deg: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-1.5 bg-gray-900 border border-gray-700 rounded text-gray-200"
                  />
                </div>
              </div>
              <div>
                <label className="block text-gray-400 mb-1">Type</label>
                <select
                  value={newObj.object_type}
                  onChange={e => setNewObj({ ...newObj, object_type: e.target.value as any })}
                  className="w-full px-3 py-1.5 bg-gray-900 border border-gray-700 rounded text-gray-200"
                >
                  <option value="DEBRIS">DEBRIS</option>
                  <option value="SATELLITE">SATELLITE</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="btn-secondary text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary text-xs"
                >
                  Add Object
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
