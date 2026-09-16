import { useState, useEffect, useCallback } from 'react';
import apiClient from '../../api/client';
import type { HealthStatus } from '../../types';

interface SystemState {
  status: 'checking' | 'online' | 'offline' | 'waking';
  health: HealthStatus | null;
  lastChecked: Date | null;
}

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
  checkTimer = setTimeout(checkHealth, 30_000);
}

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

export function SystemStatusCompact() {
  const { status, health } = useSystemStatus();

  const dotClass =
    status === 'online' ? 'status-dot status-dot-green' :
    status === 'waking' ? 'status-dot status-dot-yellow' :
    status === 'checking' ? 'status-dot status-dot-yellow' :
    'status-dot status-dot-red';

  const label =
    status === 'online' ? 'ONLINE' :
    status === 'waking' ? 'WAKING' :
    status === 'checking' ? '...' :
    'OFFLINE';

  return (
    <div className="flex items-center gap-2">
      <span className={dotClass} />
      <span className={`text-[10px] font-bold ${
        status === 'online' ? 'text-[#22c55e]' :
        status === 'waking' ? 'text-[var(--high)]' :
        status === 'checking' ? 'text-[var(--high)]' :
        'text-[var(--critical)]'
      }`}>
        {label}
      </span>
      {status === 'online' && health && (
        <span className="text-[10px] text-[var(--dim)]">
          {health.tracked_objects} RSOs
        </span>
      )}
    </div>
  );
}

export function SystemStatusPanel() {
  const { status, health, retry } = useSystemStatus();

  const isOnline = status === 'online';

  return (
    <div className="terminal-border p-3 min-w-[200px] bg-[var(--bg)]">
      <p className="section-title text-[10px]">SYSTEM STATUS</p>
      <div className="space-y-1.5 text-[11px]">
        {[
          { label: 'BACKEND_API', value: isOnline ? 'ONLINE' : (status === 'checking' ? 'CHECKING' : 'OFFLINE') },
          { label: 'ORBITAL_ENGINE', value: health?.orbital_engine?.toUpperCase() ?? '—' },
          { label: 'RISK_ENGINE', value: health?.risk_engine?.toUpperCase() ?? '—' },
          { label: 'TRACKED_OBJS', value: health ? `${health.tracked_objects}` : '—' },
        ].map(({ label, value }) => (
          <div key={label} className="flex justify-between">
            <span className="text-[var(--dim)]">{label}</span>
            <span className={
              value === 'ONLINE' ? 'text-[#22c55e] font-bold' :
              value === 'OFFLINE' ? 'text-[var(--critical)] font-bold' :
              value === 'CHECKING' ? 'text-[var(--high)]' :
              'text-[var(--fg)]'
            }>{value}</span>
          </div>
        ))}
      </div>
      {!isOnline && status !== 'checking' && (
        <button
          onClick={retry}
          className="btn-terminal w-full text-[10px] mt-2"
        >
          {status === 'waking' ? '> WAKING...' : '> RETRY'}
        </button>
      )}
    </div>
  );
}
