import { useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { KM_SCALE } from './Earth';
import { propagatePosition } from '../../utils/orbitalMath';
import type { ObjectInfo, RiskEntry } from '../../types';

interface ApproachLineProps {
  satellite: ObjectInfo;
  debris: ObjectInfo;
  riskEntry: RiskEntry;
  simulationTime: number;
}

export function ApproachLine({ satellite, debris, riskEntry, simulationTime }: ApproachLineProps) {
  const lineColor =
    riskEntry.risk_level === 'CRITICAL'
      ? '#ff2244'
      : riskEntry.risk_level === 'HIGH'
      ? '#ff8800'
      : '#ffdd00';

  const { lineObject, geometry } = useMemo(() => {
    const geom = new THREE.BufferGeometry();
    const mat = new THREE.LineBasicMaterial({
      color: lineColor,
      transparent: true,
      opacity: 0.7,
      linewidth: 1,
      depthWrite: false,
    });
    const line = new THREE.Line(geom, mat);
    return { lineObject: line, geometry: geom };
  }, [lineColor]);

  useFrame(() => {
    const [sx, sy, sz] = propagatePosition(
      satellite.altitude_km,
      satellite.inclination_deg,
      satellite.phase_deg,
      satellite.raan_deg,
      simulationTime,
    );
    const [dx, dy, dz] = propagatePosition(
      debris.altitude_km,
      debris.inclination_deg,
      debris.phase_deg,
      debris.raan_deg,
      simulationTime,
    );

    const points = new Float32Array([
      sx * KM_SCALE, sy * KM_SCALE, sz * KM_SCALE,
      dx * KM_SCALE, dy * KM_SCALE, dz * KM_SCALE,
    ]);
    geometry.setAttribute('position', new THREE.BufferAttribute(points, 3));
    geometry.attributes.position.needsUpdate = true;
  });

  return <primitive object={lineObject} />;
}
