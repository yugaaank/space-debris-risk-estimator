import axios from 'axios';
import type {
  SimulationRequest,
  SimulationResult,
  HealthStatus,
} from '../types';

export const PRODUCTION_API_URL = 'https://orbital-shield-api.onrender.com';

// Priority:
// 1. Explicit environment variable (VITE_API_BASE_URL / VITE_API_URL)
// 2. In production builds (!import.meta.env.DEV), default to live deployed Render backend
// 3. In local development (DEV mode), default to empty string to use Vite proxy
const rawBaseUrl =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? '' : PRODUCTION_API_URL);

const BASE_URL = (rawBaseUrl || PRODUCTION_API_URL).replace(/\/+$/, '');

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 120_000,
  headers: { 'Content-Type': 'application/json' },
});

export const apiClient = {
  health: (): Promise<HealthStatus> =>
    api.get('/api/health').then(r => r.data),

  getObjects: () =>
    api.get('/api/objects').then(r => r.data),

  simulate: (request: SimulationRequest): Promise<SimulationResult> =>
    api.post('/api/simulate', request).then(r => r.data),

  simulateDemo: (windowHours = 24, timestepSeconds = 60): Promise<SimulationResult> =>
    api
      .post(`/api/simulate/demo?window_hours=${windowHours}&timestep_seconds=${timestepSeconds}`)
      .then(r => r.data),

  getSimulation: (id: string): Promise<SimulationResult> =>
    api.get(`/api/simulation/${id}`).then(r => r.data),

  uploadDebris: (file: File) => {
    const form = new FormData();
    form.append('file', file);
    return api
      .post('/api/upload-debris', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then(r => r.data);
  },
};

export default apiClient;
