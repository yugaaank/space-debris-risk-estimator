import { useMemo } from 'react';
import * as THREE from 'three';
import type { RiskLevel } from '../../types';
import { KM_SCALE } from './Earth';

const RISK_COLORS: Record<RiskLevel, string> = {
  CRITICAL: '#ff2244',
  HIGH: '#ff8800',
  MODERATE: '#ffdd00',
  LOW: '#00ff88',
};

const RISK_OPACITY: Record<RiskLevel, number> = {
  CRITICAL: 0.9,
  HIGH: 0.75,
  MODERATE: 0.5,
  LOW: 0.25,
};

interface OrbitPathProps {
  points: [number, number, number][];
  riskLevel?: RiskLevel;
  isSatellite?: boolean;
  isSelected?: boolean;
  visible?: boolean;
}

export function OrbitPath({
  points,
  riskLevel = 'LOW',
  isSatellite = false,
  isSelected = false,
  visible = true,
}: OrbitPathProps) {
  const lineObject = useMemo(() => {
    const scaledPoints = points.map(
      ([x, y, z]) => new THREE.Vector3(x * KM_SCALE, y * KM_SCALE, z * KM_SCALE),
    );
    // Close the loop
    if (scaledPoints.length > 1) {
      scaledPoints.push(scaledPoints[0].clone());
    }
    const geom = new THREE.BufferGeometry().setFromPoints(scaledPoints);
    const color = isSatellite ? '#00ccff' : RISK_COLORS[riskLevel];
    const opacity = isSatellite ? 0.8 : isSelected ? 0.9 : RISK_OPACITY[riskLevel];
    const lineWidth = isSatellite ? 2 : isSelected ? 2 : 1;

    const mat = new THREE.LineBasicMaterial({
      color,
      transparent: true,
      opacity,
      linewidth: lineWidth,
      depthWrite: false,
    });

    return new THREE.Line(geom, mat);
  }, [points, riskLevel, isSatellite, isSelected]);

  if (!visible) return null;

  return <primitive object={lineObject} />;
}
