// Global type definitions for Orbital Shield

export interface OrbitalObjectInput {
  object_id: string;
  name: string;
  altitude_km: number;
  inclination_deg: number;
  phase_deg: number;
  raan_deg: number;
  eccentricity: number;
  object_type: 'SATELLITE' | 'DEBRIS';
  period_min?: number;
}

export interface SimulationConfig {
  window_hours: number;
  timestep_seconds: number;
}

export interface SimulationRequest {
  satellite: OrbitalObjectInput;
  debris_objects: OrbitalObjectInput[];
  config: SimulationConfig;
}

export interface TimeseriesPoint {
  t: number; // seconds
  d: number; // km
}

export type RiskLevel = 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW';

export interface RiskEntry {
  rank: number;
  object_id: string;
  name: string;
  risk_level: RiskLevel;
  risk_score: number;
  min_distance_km: number;
  time_of_ca_s: number;
  tca_label: string;
  relative_velocity_km_s: number;
  dist_score: number;
  vel_score: number;
  time_score: number;
  explanation: string;
  satellite_pos_at_ca: [number, number, number];
  debris_pos_at_ca: [number, number, number];
  separation_timeseries: TimeseriesPoint[];
}

export interface ObjectInfo {
  object_id: string;
  name: string;
  object_type: string;
  altitude_km: number;
  inclination_deg: number;
  phase_deg: number;
  raan_deg: number;
  radius_km: number;
  period_min: number;
  angular_velocity_deg_s: number;
  orbital_velocity_km_s: number;
}

export interface OrbitPath {
  object_id: string;
  points: [number, number, number][];
}

export interface SimulationStats {
  total_objects: number;
  critical_count: number;
  high_count: number;
  moderate_count: number;
  low_count: number;
  closest_approach_km: number | null;
  highest_risk_object: string | null;
  next_critical_s: number | null;
  simulation_window_h: number;
  timestep_s: number;
  n_timesteps: number;
  generated_at: string;
}

export interface SimulationResult {
  simulation_id: string;
  satellite: ObjectInfo;
  debris_objects: ObjectInfo[];
  risk_results: RiskEntry[];
  orbit_paths: OrbitPath[];
  stats: SimulationStats;
  config: { window_hours: number; timestep_seconds: number };
  disclaimer: string;
}

export interface HealthStatus {
  status: string;
  orbital_engine: string;
  risk_engine: string;
  tracked_objects: number;
  version: string;
}

export interface SpaceDebris {
  id: string;
  name: string;
  altitude: number;
  inclination: number;
  period_minutes: number;
  ascending_node_deg: number;
  object_type: string;
}

export type SimulationStatus = 'idle' | 'running' | 'complete' | 'error';
export type PlayState = 'playing' | 'paused' | 'stopped';
