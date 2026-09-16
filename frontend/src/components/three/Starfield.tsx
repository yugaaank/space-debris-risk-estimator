import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const STAR_COUNT = 3000;

export function Starfield() {
  const starsRef = useRef<THREE.Points>(null);

  const { positions, colors } = useMemo(() => {
    const pos = new Float32Array(STAR_COUNT * 3);
    const col = new Float32Array(STAR_COUNT * 3);
    for (let i = 0; i < STAR_COUNT; i++) {
      // Random point on large sphere
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 900 + Math.random() * 100;
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);

      // Vary star colors (mostly white, some blue/yellow tint)
      const t = Math.random();
      if (t < 0.7) {
        col[i * 3] = 0.9 + Math.random() * 0.1;
        col[i * 3 + 1] = 0.9 + Math.random() * 0.1;
        col[i * 3 + 2] = 0.9 + Math.random() * 0.1;
      } else if (t < 0.85) {
        col[i * 3] = 0.7;
        col[i * 3 + 1] = 0.8;
        col[i * 3 + 2] = 1.0;
      } else {
        col[i * 3] = 1.0;
        col[i * 3 + 1] = 0.95;
        col[i * 3 + 2] = 0.7;
      }
    }
    return { positions: pos, colors: col };
  }, []);

  useFrame((_, delta) => {
    if (starsRef.current) {
      starsRef.current.rotation.y += 0.00003 * delta * 60;
    }
  });

  return (
    <points ref={starsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
        <bufferAttribute
          attach="attributes-color"
          args={[colors, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.5}
        vertexColors
        transparent
        opacity={0.85}
        sizeAttenuation={false}
      />
    </points>
  );
}
