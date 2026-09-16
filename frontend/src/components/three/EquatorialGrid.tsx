import { useMemo } from 'react';
import * as THREE from 'three';
import { KM_SCALE } from './Earth';

// Equatorial coordinate grid — thin lines at 30° intervals
export function EquatorialGrid() {
  const lines = useMemo(() => {
    const group = new THREE.Group();
    const earthRadius = 6.371;
    const gridRadius = earthRadius + 0.3; // slightly above surface
    const lineMat = new THREE.LineBasicMaterial({
      color: '#1e4060',
      transparent: true,
      opacity: 0.3,
      depthWrite: false,
    });

    // Longitude lines (meridians) — every 30°
    for (let lon = 0; lon < 360; lon += 30) {
      const points: THREE.Vector3[] = [];
      for (let lat = -90; lat <= 90; lat += 2) {
        const phi = (lat * Math.PI) / 180;
        const theta = (lon * Math.PI) / 180;
        const x = gridRadius * Math.cos(phi) * Math.cos(theta);
        const y = gridRadius * Math.sin(phi);
        const z = gridRadius * Math.cos(phi) * Math.sin(theta);
        points.push(new THREE.Vector3(x * KM_SCALE, y * KM_SCALE, z * KM_SCALE));
      }
      const geom = new THREE.BufferGeometry().setFromPoints(points);
      group.add(new THREE.Line(geom, lineMat));
    }

    // Latitude lines — every 30°
    for (let lat = -60; lat <= 60; lat += 30) {
      const points: THREE.Vector3[] = [];
      for (let lon = 0; lon <= 360; lon += 3) {
        const phi = (lat * Math.PI) / 180;
        const theta = (lon * Math.PI) / 180;
        const x = gridRadius * Math.cos(phi) * Math.cos(theta);
        const y = gridRadius * Math.sin(phi);
        const z = gridRadius * Math.cos(phi) * Math.sin(theta);
        points.push(new THREE.Vector3(x * KM_SCALE, y * KM_SCALE, z * KM_SCALE));
      }
      const geom = new THREE.BufferGeometry().setFromPoints(points);
      const mat = lat === 0
        ? new THREE.LineBasicMaterial({ color: '#2a6090', transparent: true, opacity: 0.5, depthWrite: false })
        : lineMat;
      group.add(new THREE.Line(geom, mat));
    }

    return group;
  }, []);

  return <primitive object={lines} />;
}
