import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import apiClient from '../api/client';
import { OrbitalScene } from '../components/three/Scene';
import { useSimulationStore } from '../store/simulationStore';
import { useSimulation } from '../hooks/useSimulation';
import type { SpaceDebris } from '../types';

const SPEED_OPTIONS = [1, 10, 100, 1000, 10000];

export function SimulationPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [objects, setObjects] = useState<SpaceDebris[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const {
    playState, setPlayState,
    simulationTime, setSimulationTime,
    playbackSpeed, setPlaybackSpeed,
    selectedObjectId, setSelectedObject,
    status: simStatus, result: simResult,
    showOrbits, toggleOrbits,
    showApproachLines, toggleApproachLines,
    showGrid, toggleGrid,
    config,
  } = useSimulationStore();

  const { runDemo } = useSimulation();

  const windowSeconds = config.window_hours * 3600;
  const progress = windowSeconds > 0 ? simulationTime / windowSeconds : 0;

  // Load objects
  useEffect(() => {
    apiClient.getObjects()
      .then((data: any) => {
        const list: SpaceDebris[] = Array.isArray(data) ? data : data.objects ?? [];
        setObjects(list);
      })
      .catch(() => {});
  }, []);

  // Select object from URL
  useEffect(() => {
    const id = searchParams.get('objectId');
    if (id) setSelectedObject(id);
  }, [searchParams, setSelectedObject]);

  const handleObjectClick = (id: string) => {
    setSelectedObject(id);
    setSearchParams({ objectId: id }, { replace: true });
  };

  const handlePlayPause = () => {
    if (playState === 'playing') {
      setPlayState('paused');
    } else {
      if (progress >= 1) setSimulationTime(0);
      setPlayState('playing');
    }
  };

  const handleReset = () => {
    setPlayState('stopped');
    setSimulationTime(0);
  };

  const filteredObjects = useMemo(() => {
    if (!searchTerm) return objects;
    const term = searchTerm.toLowerCase();
    return objects.filter(o =>
      o.id.toLowerCase().includes(term) ||
      o.name.toLowerCase().includes(term)
    );
  }, [objects, searchTerm]);

  const selectedObj = useMemo(() => {
    if (!selectedObjectId) return null;
    return objects.find(o => o.id === selectedObjectId) ?? null;
  }, [objects, selectedObjectId]);

  const criticalCount = useMemo(() => {
    if (!simResult) return 0;
    return simResult.risks.filter(r => r.risk_level === 'critical').length;
  }, [simResult]);

  return (
    <div className="h-screen flex flex-col bg-[var(--bg)]">
      {/* Top Bar */}
      <header className="h-12 flex items-center justify-between px-4 border-b-[3px] border-[var(--fg)] shrink-0">
        <div className="flex items-center gap-4">
          <span className="text-[14px] font-extrabold">ORBITAL SIMULATION</span>
          <span className={`text-[10px] font-bold ${
            simStatus === 'running' ? 'text-[var(--high)]' :
            simStatus === 'complete' ? 'text-[#00cc00]' :
            'text-[var(--dim)]'
          }`}>
            {simStatus === 'running' ? 'COMPUTING' :
             simStatus === 'complete' ? `${simResult?.risks?.length ?? 0} RISKS` :
             'IDLE'}
          </span>
        </div>
        <div className="flex items-center gap-3 text-[10px] text-[var(--dim)] hide-mobile">
          {criticalCount > 0 && (
            <span className="text-[var(--critical)]">{criticalCount} CRITICAL</span>
          )}
          <span>{objects.length} LOADED</span>
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <aside className="w-[280px] border-r border-[var(--border)] flex flex-col shrink-0 hide-mobile overflow-y-auto">
          {/* Run Simulation */}
          {simStatus !== 'complete' && (
            <div className="p-3 border-b-[3px] border-[var(--fg)]">
              <button
                onClick={runDemo}
                disabled={simStatus === 'running'}
                className="w-full py-3 text-[12px] font-extrabold border-[3px] border-[var(--fg)] cursor-pointer bg-[var(--fg)] text-[var(--bg)] hover:bg-[var(--critical)] hover:border-[var(--critical)] hover:text-[var(--fg)] transition-colors disabled:opacity-40 disabled:cursor-wait"
              >
                {simStatus === 'running' ? '> COMPUTING...' : '> RUN SIMULATION'}
              </button>
            </div>
          )}

          {/* Playback Controls */}
          {simStatus === 'complete' && (
            <div className="p-3 border-b border-[var(--border)]">
              <p className="section-label mb-2">PLAYBACK</p>
              <div className="flex gap-0 mb-2">
                <button
                  onClick={handlePlayPause}
                  className={`flex-1 py-2 text-[11px] font-bold border border-[var(--border)] cursor-pointer ${
                    playState === 'playing'
                      ? 'bg-[var(--fg)] text-[var(--bg)] border-[var(--fg)]'
                      : 'bg-transparent text-[var(--fg)] hover:bg-[#111]'
                  }`}
                >
                  {playState === 'playing' ? 'PAUSE' : 'PLAY'}
                </button>
                <button
                  onClick={handleReset}
                  className="flex-1 py-2 text-[11px] font-bold border border-[var(--border)] border-l-0 bg-transparent text-[var(--dim)] hover:text-[var(--fg)] hover:bg-[#111] cursor-pointer"
                >
                  RESET
                </button>
              </div>
              <input
                type="range"
                min={0}
                max={1}
                step={0.001}
                value={progress}
                onChange={(e) => setSimulationTime(parseFloat(e.target.value) * windowSeconds)}
                className="w-full"
              />
              <div className="flex justify-between text-[9px] text-[var(--dim)] mt-1">
                <span>T+0h</span>
                <span>{(progress * 100).toFixed(1)}%</span>
                <span>T+{config.window_hours}h</span>
              </div>
            </div>
          )}

          {/* Speed Selector */}
          {simStatus === 'complete' && (
            <div className="p-3 border-b border-[var(--border)]">
              <p className="section-label mb-2">SPEED</p>
              <div className="flex gap-0">
                {SPEED_OPTIONS.map((s, i) => (
                  <button
                    key={s}
                    onClick={() => setPlaybackSpeed(s)}
                    className={`flex-1 py-1.5 text-[10px] font-bold border border-[var(--border)] cursor-pointer ${
                      playbackSpeed === s
                        ? 'bg-[var(--fg)] text-[var(--bg)] border-[var(--fg)]'
                        : 'bg-transparent text-[var(--dim)] hover:text-[var(--fg)] hover:bg-[#111]'
                    } ${i > 0 ? 'border-l-0' : ''}`}
                  >
                    {s >= 1000 ? `${s / 1000}k` : s}x
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* View Toggles */}
          <div className="p-3 border-b border-[var(--border)]">
            <p className="section-label mb-2">VIEW</p>
            <div className="space-y-1.5">
              {[
                { active: showOrbits, toggle: toggleOrbits, label: 'ORBITS' },
                { active: showApproachLines, toggle: toggleApproachLines, label: 'RISK LINES' },
                { active: showGrid, toggle: toggleGrid, label: 'GRID' },
              ].map(({ active, toggle, label }) => (
                <button
                  key={label}
                  onClick={toggle}
                  className="w-full flex items-center gap-2 text-[11px] cursor-pointer bg-transparent border-none text-left py-0.5"
                >
                  <span className={`inline-block w-3 h-3 border border-[var(--border)] text-[8px] leading-none flex items-center justify-center ${
                    active ? 'bg-[var(--fg)] text-[var(--bg)]' : 'bg-transparent text-transparent'
                  }`}>
                    {active ? 'x' : ''}
                  </span>
                  <span className={active ? 'text-[var(--fg)]' : 'text-[var(--dim)]'}>{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Selected Object */}
          {selectedObj && (
            <div className="p-3 border-b border-[var(--border)]">
              <p className="section-label mb-2">SELECTED RSO</p>
              <div className="space-y-1 text-[11px]">
                {[
                  ['ID', selectedObj.id],
                  ['NAME', selectedObj.name],
                  ['ALT', `${selectedObj.altitude.toFixed(1)} km`],
                  ['INC', `${selectedObj.inclination.toFixed(1)}°`],
                  ['PER', `${selectedObj.period_minutes.toFixed(1)} min`],
                  ['RAAN', `${selectedObj.ascending_node_deg.toFixed(1)}°`],
                  ['TYPE', `[${selectedObj.object_type.toUpperCase()}]`],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between">
                    <span className="text-[var(--dim)]">{label}</span>
                    <span className="font-bold">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Object List */}
          <div className="flex-1 p-3 overflow-y-auto">
            <div className="flex items-center justify-between mb-2">
              <p className="section-label mb-0">OBJECTS</p>
              <span className="text-[10px] text-[var(--dim)]">{filteredObjects.length}</span>
            </div>
            <input
              type="text"
              placeholder="SEARCH..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[var(--bg)] border border-[var(--border)] text-[var(--fg)] px-2 py-1 text-[11px] font-[var(--font-mono)] outline-none mb-2"
            />
            <div className="space-y-0 max-h-[200px] overflow-y-auto">
              {filteredObjects.map(obj => (
                <button
                  key={obj.id}
                  onClick={() => handleObjectClick(obj.id)}
                  className={`w-full text-left px-2 py-1.5 text-[11px] cursor-pointer border-none ${
                    selectedObjectId === obj.id
                      ? 'bg-[var(--fg)] text-[var(--bg)]'
                      : 'bg-transparent text-[var(--dim)] hover:bg-[#111] hover:text-[var(--fg)]'
                  }`}
                >
                  {obj.id} — {obj.name}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* 3D Scene */}
        <main className="flex-1 relative">
          <div className="absolute inset-0 bg-[#020a14]">
            <OrbitalScene />
          </div>

          {/* HUD Overlay */}
          <div className="absolute top-3 left-3 pointer-events-none z-10">
            <div className="border border-[var(--border)] p-2 bg-[var(--bg)] opacity-90">
              <div className="space-y-0.5 text-[10px]">
                <div className="flex gap-3">
                  <span className="text-[var(--dim)]">SIM TIME</span>
                  <span className="font-bold">
                    {Math.floor(simulationTime / 3600)}h{' '}
                    {Math.floor((simulationTime % 3600) / 60)}m
                  </span>
                </div>
                <div className="flex gap-3">
                  <span className="text-[var(--dim)]">OBJECTS</span>
                  <span className="font-bold">{objects.length}</span>
                </div>
                {selectedObj && (
                  <div className="flex gap-3">
                    <span className="text-[var(--dim)]">SELECTED</span>
                    <span className="font-bold">{selectedObj.id}</span>
                  </div>
                )}
                <div className="flex gap-3">
                  <span className="text-[var(--dim)]">SPEED</span>
                  <span className="font-bold">{playbackSpeed}x</span>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
