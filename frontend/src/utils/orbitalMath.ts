/**
 * Orbital position calculation for the frontend.
 * Mirrors the backend propagator for real-time animation.
 *
 * Circular Keplerian orbit:
 *   r = R_E + h
 *   ω = √(μ/r³)
 *   θ(t) = θ₀ + ω·t
 *   Position after inclination (Rx) and RAAN (Rz) rotations.
 */

const MU = 398_600.4418; // km³/s²
const R_E = 6_371.0;     // km

export function getOrbitalRadius(altitudeKm: number) {
  return R_E + altitudeKm;
}

export function getAngularVelocity(altitudeKm: number) {
  const r = getOrbitalRadius(altitudeKm);
  return Math.sqrt(MU / (r * r * r)); // rad/s
}

export function propagatePosition(
  altitudeKm: number,
  inclinationDeg: number,
  phaseDeg: number,
  raanDeg: number,
  timeSec: number,
): [number, number, number] {
  const r = getOrbitalRadius(altitudeKm);
  const omega = getAngularVelocity(altitudeKm);
  const theta0 = (phaseDeg * Math.PI) / 180;
  const inc = (inclinationDeg * Math.PI) / 180;
  const raan = (raanDeg * Math.PI) / 180;

  const theta = theta0 + omega * timeSec;

  // Perifocal
  const xp = r * Math.cos(theta);
  const yp = r * Math.sin(theta);

  // Apply inclination (Rx)
  const xi = xp;
  const yi = yp * Math.cos(inc);
  const zi = yp * Math.sin(inc);

  // Apply RAAN (Rz)
  const x = xi * Math.cos(raan) - yi * Math.sin(raan);
  const y = xi * Math.sin(raan) + yi * Math.cos(raan);
  const z = zi;

  return [x, y, z];
}
