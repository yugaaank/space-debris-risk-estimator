import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { KM_SCALE } from './Earth';
import { propagatePosition } from '../../utils/orbitalMath';
import type { ObjectInfo } from '../../types';

interface SatelliteObjectProps {
  info: ObjectInfo;
  simulationTime: number; // seconds
  isSelected?: boolean;
}

export function SatelliteObject({ info, simulationTime, isSelected }: SatelliteObjectProps) {
  const meshRef = useRef<THREE.Group>(null);
  const glowRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    const [x, y, z] = propagatePosition(
      info.altitude_km,
      info.inclination_deg,
      info.phase_deg,
      info.raan_deg,
      simulationTime,
    );
    const sx = x * KM_SCALE;
    const sy = y * KM_SCALE;
    const sz = z * KM_SCALE;
    if (meshRef.current) {
      meshRef.current.position.set(sx, sy, sz);
      // Point satellite toward velocity direction
      meshRef.current.lookAt(0, 0, 0);
    }
    if (glowRef.current) {
      const pulse = 1.0 + 0.15 * Math.sin(Date.now() * 0.003);
      glowRef.current.scale.setScalar(pulse);
    }
  });

  const color = isSelected ? '#ffffff' : '#00ccff';

  return (
    <group ref={meshRef}>
      {/* Satellite body */}
      <mesh castShadow>
        <boxGeometry args={[0.08, 0.04, 0.04]} />
        <meshPhongMaterial color={color} emissive={color} emissiveIntensity={0.4} />
      </mesh>
      {/* Solar panels */}
      <mesh position={[0, 0, 0.12]}>
        <boxGeometry args={[0.18, 0.001, 0.08]} />
        <meshPhongMaterial color="#2244aa" emissive="#112244" emissiveIntensity={0.3} />
      </mesh>
      <mesh position={[0, 0, -0.12]}>
        <boxGeometry args={[0.18, 0.001, 0.08]} />
        <meshPhongMaterial color="#2244aa" emissive="#112244" emissiveIntensity={0.3} />
      </mesh>
      {/* Glow sphere */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshBasicMaterial
          color={isSelected ? '#ffffff' : '#00aaff'}
          transparent
          opacity={0.15}
          depthWrite={false}
        />
      </mesh>
      {/* Point light for visibility */}
      <pointLight color={isSelected ? '#ffffff' : '#00ccff'} intensity={2} distance={3} />
    </group>
  );
}
