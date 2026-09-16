import { useRef, useEffect } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { Earth, KM_SCALE } from './Earth';
import { Starfield } from './Starfield';
import { OrbitPath } from './OrbitPath';
import { SatelliteObject } from './SatelliteObject';
import { DebrisObject } from './DebrisObject';
import { ApproachLine } from './ApproachLine';
import { EquatorialGrid } from './EquatorialGrid';
import { useSimulationStore } from '../../store/simulationStore';
import { propagatePosition } from '../../utils/orbitalMath';
import type { RiskLevel } from '../../types';

// ── Animation controller ──────────────────────────────────────────────────────
function SimulationAnimator() {
  const { playState, simulationTime, playbackSpeed, getWindowSeconds, setSimulationTime, setPlayState } =
    useSimulationStore();
  const stateRef = useRef({ playState, simulationTime, playbackSpeed, windowSeconds: getWindowSeconds() });

  useEffect(() => {
    stateRef.current = { playState, simulationTime, playbackSpeed, windowSeconds: getWindowSeconds() };
  });

  useFrame((_, delta) => {
    if (stateRef.current.playState !== 'playing') return;
    const next = stateRef.current.simulationTime + delta * stateRef.current.playbackSpeed;
    if (next >= stateRef.current.windowSeconds) {
      setSimulationTime(0);
      setPlayState('paused');
    } else {
      setSimulationTime(next);
    }
  });
  return null;
}

// ── Smooth camera controller ──────────────────────────────────────────────────
function CameraController() {
  const { camera } = useThree();
  const { selectedObjectId, result } = useSimulationStore();
  const prevSelected = useRef<string | null>(null);
  const targetPos = useRef<THREE.Vector3 | null>(null);
  const isMoving = useRef(false);

  useEffect(() => {
    if (!selectedObjectId || !result || selectedObjectId === prevSelected.current) return;
    prevSelected.current = selectedObjectId;

    const debrisInfo = result.debris_objects.find(d => d.object_id === selectedObjectId);
    if (!debrisInfo) return;

    const [x, y, z] = propagatePosition(
      debrisInfo.altitude_km,
      debrisInfo.inclination_deg,
      debrisInfo.phase_deg,
      debrisInfo.raan_deg,
      0,
    );
    const target = new THREE.Vector3(x * KM_SCALE, y * KM_SCALE, z * KM_SCALE);
    const distance = target.length() + 8;
    const dir = target.clone().normalize();
    targetPos.current = dir.multiplyScalar(distance);
    isMoving.current = true;
  }, [selectedObjectId, result]);

  useFrame(() => {
    if (!isMoving.current || !targetPos.current) return;
    camera.position.lerp(targetPos.current, 0.04);
    if (camera.position.distanceTo(targetPos.current) < 0.05) {
      isMoving.current = false;
    }
    camera.lookAt(0, 0, 0);
  });

  return null;
}

// ── Main Scene Contents ───────────────────────────────────────────────────────
function SceneContents() {
  const {
    result,
    simulationTime,
    selectedObjectId,
    showOrbits,
    showApproachLines,
    showGrid,
    setSelectedObject,
  } = useSimulationStore();

  const selectedRisk = result?.risk_results.find(r => r.object_id === selectedObjectId) ?? null;
  const selectedDebrisInfo = result?.debris_objects.find(d => d.object_id === selectedObjectId) ?? null;

  return (
    <>
      <ambientLight intensity={0.2} color="#101828" />
      <directionalLight position={[60, 25, 45]} intensity={2.4} color="#fffdf6" castShadow />
      <directionalLight position={[-40, -15, -35]} intensity={0.1} color="#0c1828" />

      <Starfield />
      <Earth />

      {/* Equatorial grid */}
      {showGrid && <EquatorialGrid />}

      {/* Orbit paths */}
      {showOrbits && result && result.orbit_paths.map(path => {
        const isSat = path.object_id === result.satellite.object_id;
        const risk = result.risk_results.find(r => r.object_id === path.object_id);
        return (
          <OrbitPath
            key={path.object_id}
            points={path.points as [number, number, number][]}
            riskLevel={(risk?.risk_level as RiskLevel) ?? 'LOW'}
            isSatellite={isSat}
            isSelected={path.object_id === selectedObjectId}
          />
        );
      })}

      {/* Satellite */}
      {result && (
        <SatelliteObject
          info={result.satellite}
          simulationTime={simulationTime}
          isSelected={selectedObjectId === result.satellite.object_id}
        />
      )}

      {/* Debris */}
      {result && result.debris_objects.map(deb => {
        const risk = result.risk_results.find(r => r.object_id === deb.object_id);
        if (!risk) return null;
        return (
          <DebrisObject
            key={deb.object_id}
            info={deb}
            riskLevel={risk.risk_level as RiskLevel}
            riskScore={risk.risk_score}
            simulationTime={simulationTime}
            isSelected={deb.object_id === selectedObjectId}
            onClick={() => setSelectedObject(deb.object_id)}
          />
        );
      })}

      {/* Approach line for selected object */}
      {showApproachLines && result && selectedRisk && selectedDebrisInfo &&
        (selectedRisk.risk_level === 'CRITICAL' || selectedRisk.risk_level === 'HIGH' || selectedRisk.risk_level === 'MODERATE') && (
        <ApproachLine
          satellite={result.satellite}
          debris={selectedDebrisInfo}
          riskEntry={selectedRisk}
          simulationTime={simulationTime}
        />
      )}

      <SimulationAnimator />
      <CameraController />
    </>
  );
}

// ── Exported Scene Wrapper ────────────────────────────────────────────────────
export function OrbitalScene() {
  return (
    <Canvas
      camera={{ position: [0, 15, 30], fov: 45, near: 0.01, far: 2000 }}
      gl={{ antialias: true, alpha: false }}
      style={{ background: '#020a14' }}
      shadows
    >
      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={8}
        maxDistance={120}
        zoomSpeed={0.7}
        rotateSpeed={0.55}
        dampingFactor={0.06}
        enableDamping
        makeDefault
      />
      <SceneContents />
    </Canvas>
  );
}
