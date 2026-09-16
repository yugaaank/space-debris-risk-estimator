import { useState, useEffect, useCallback } from 'react';
import apiClient from '../../api/client';
import type { HealthStatus } from '../../types';

interface SystemState {
  status: 'checking' | 'online' | 'offline' | 'waking';
  health: HealthStatus | null;
  lastChecked: Date | null;
}

// Shared health state (singleton pattern for cross-component use)
let cachedState: SystemState = { status: 'checking', health: null, lastChecked: null };
const listeners = new Set<(s: SystemState) => void>();

function notifyListeners() {
  listeners.forEach(l => l({ ...cachedState }));
}

let checkTimer: ReturnType<typeof setTimeout> | null = null;

async function checkHealth() {
  try {
    const health = await apiClient.health();
    cachedState = { status: 'online', health, lastChecked: new Date() };
  } catch {
    cachedState = { status: 'offline', health: null, lastChecked: new Date() };
  }
  notifyListeners();

  // Schedule next check every 30s
  checkTimer = setTimeout(checkHealth, 30_000);
}

// Start polling immediately
checkHealth();

export function useSystemStatus() {
  const [state, setState] = useState<SystemState>(cachedState);

  useEffect(() => {
    listeners.add(setState);
    setState({ ...cachedState });
    return () => { listeners.delete(setState); };
  }, []);

  const retry = useCallback(async () => {
    cachedState = { ...cachedState, status: 'waking' };
    notifyListeners();
    if (checkTimer) clearTimeout(checkTimer);
    await checkHealth();
  }, []);

  return { ...state, retry };
}

// Compact status display for navbar
export function SystemStatusCompact() {
  const { status, health } = useSystemStatus();

  const color =
    status === 'online' ? 'text-emerald-400' :
    status === 'waking' ? 'text-yellow-400' :
    status === 'checking' ? 'text-blue-400' :
    'text-red-400';

  const dotClass =
    status === 'online' ? 'status-dot-green' :
    status === 'waking' ? 'status-dot-yellow' :
    status === 'checking' ? 'status-dot-yellow' :
    'status-dot-red';

  const label =
    status === 'online' ? 'ONLINE' :
    status === 'waking' ? 'WAKING' :
    status === 'checking' ? '...' :
    'OFFLINE';

  return (
    <div className="flex items-center gap-2">
      <span className={dotClass} />
      <span className={`text-[10px] font-mono font-bold tracking-widest ${color}`}>
        {label}
      </span>
      {status === 'online' && health && (
        <span className="text-[10px] font-mono text-gray-600">
          {health.tracked_objects} RSOs
        </span>
      )}
    </div>
  );
}

// Full status panel
export function SystemStatusPanel() {
  const { status, health, retry } = useSystemStatus();

  const isOnline = status === 'online';

  return (
    <div className="mission-panel p-3 space-y-2 min-w-[200px]">
      <p className="section-label text-[10px]">System Status</p>
      <div className="space-y-1.5 text-[11px] font-mono">
        {[
          { label: 'Backend API', value: isOnline ? 'ONLINE' : (status === 'checking' ? 'CHECKING' : 'OFFLINE') },
          { label: 'Orbital Engine', value: health?.orbital_engine?.toUpperCase() ?? '—' },
          { label: 'Risk Engine', value: health?.risk_engine?.toUpperCase() ?? '—' },
          { label: 'Tracked Objects', value: health ? `${health.tracked_objects} RSOs` : '—' },
        ].map(({ label, value }) => (
          <div key={label} className="flex justify-between items-center">
            <span className="text-gray-500">{label}</span>
            <span className={
              value === 'ONLINE' || value === 'ONLINE' || value.includes('RSOs')
                ? 'text-emerald-400 font-semibold'
                : value === 'OFFLINE' ? 'text-red-400 font-semibold'
                : value === 'CHECKING' ? 'text-yellow-400'
                : 'text-gray-300'
            }>{value}</span>
          </div>
        ))}
      </div>
      {!isOnline && status !== 'checking' && (
        <button
          onClick={retry}
          className="btn-secondary w-full text-[10px] py-1 mt-1"
        >
          {status === 'waking' ? '⟳ Waking...' : '⟳ Retry Connection'}
        </button>
      )}
    </div>
  );
}
