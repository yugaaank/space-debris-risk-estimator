import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { KM_SCALE } from './Earth';
import { propagatePosition } from '../../utils/orbitalMath';
import type { ObjectInfo, RiskLevel } from '../../types';

const RISK_COLORS: Record<RiskLevel, string> = {
  CRITICAL: '#ff2244',
  HIGH: '#ff8800',
  MODERATE: '#ffdd00',
  LOW: '#44ff88',
};

interface DebrisObjectProps {
  info: ObjectInfo;
  riskLevel: RiskLevel;
  riskScore?: number;
  simulationTime: number;
  isSelected?: boolean;
  onClick?: () => void;
}

export function DebrisObject({
  info,
  riskLevel,
  simulationTime,
  isSelected,
  onClick,
}: DebrisObjectProps) {
  const meshRef = useRef<THREE.Group>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const isCritical = riskLevel === 'CRITICAL';
  const isHigh = riskLevel === 'HIGH';

  useFrame(() => {
    const [x, y, z] = propagatePosition(
      info.altitude_km,
      info.inclination_deg,
      info.phase_deg,
      info.raan_deg,
      simulationTime,
    );
    if (meshRef.current) {
      meshRef.current.position.set(x * KM_SCALE, y * KM_SCALE, z * KM_SCALE);
      meshRef.current.rotation.x += 0.01;
      meshRef.current.rotation.y += 0.008;
    }
    if (glowRef.current && (isCritical || isHigh)) {
      const pulse = 1.0 + 0.3 * Math.sin(Date.now() * (isCritical ? 0.006 : 0.003));
      glowRef.current.scale.setScalar(pulse);
    }
  });

  const color = RISK_COLORS[riskLevel];
  const size = isSelected ? 0.07 : isCritical ? 0.065 : isHigh ? 0.055 : 0.04;

  return (
    <group ref={meshRef} onClick={onClick}>
      {/* Debris body — irregular dodecahedron-like */}
      <mesh castShadow>
        <dodecahedronGeometry args={[size, 0]} />
        <meshPhongMaterial
          color={color}
          emissive={color}
          emissiveIntensity={isSelected ? 0.8 : isCritical ? 0.6 : 0.2}
        />
      </mesh>
      {/* Glow for high-risk objects */}
      {(isCritical || isHigh || isSelected) && (
        <mesh ref={glowRef}>
          <sphereGeometry args={[size * 2.5, 16, 16]} />
          <meshBasicMaterial
            color={color}
            transparent
            opacity={isCritical ? 0.2 : 0.1}
            depthWrite={false}
          />
        </mesh>
      )}
      {/* Pulse ring for critical */}
      {isCritical && (
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[size * 3, size * 3.5, 32]} />
          <meshBasicMaterial
            color={color}
            transparent
            opacity={0.4}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
      )}
    </group>
  );
}
