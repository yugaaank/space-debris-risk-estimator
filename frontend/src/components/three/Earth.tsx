import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Scale factor: 1 unit = 1000 km (Earth radius = 6.371 units)
export const KM_SCALE = 1 / 1000;

interface EarthProps {
  rotationSpeed?: number;
}

// Custom Atmosphere Shader (Rayleigh scattering Fresnel halo)
const AtmosphereShader = {
  vertexShader: `
    varying vec3 vNormal;
    void main() {
      vNormal = normalize(normalMatrix * normal);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    varying vec3 vNormal;
    uniform vec3 uColor;
    void main() {
      // Fresnel effect: high intensity at the rim, fading toward the center
      float intensity = pow(0.7 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.8);
      gl_FragColor = vec4(uColor, 1.0) * intensity;
    }
  `,
};

// Subtle inner atmosphere rim glow (front side)
const InnerAtmosphereShader = {
  vertexShader: `
    varying vec3 vNormal;
    void main() {
      vNormal = normalize(normalMatrix * normal);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    varying vec3 vNormal;
    uniform vec3 uColor;
    void main() {
      float intensity = pow(0.75 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
      gl_FragColor = vec4(uColor, 0.35) * intensity;
    }
  `,
};

export function Earth({ rotationSpeed = 0.002 }: EarthProps) {
  const earthRef = useRef<THREE.Mesh>(null);
  const cloudsRef = useRef<THREE.Mesh>(null);
  const atmosphereRef = useRef<THREE.Mesh>(null);

  const earthRadius = 6.371; // 6371 km in scene units

  // Load realistic NASA textures
  const textureLoader = useMemo(() => new THREE.TextureLoader(), []);

  const [dayTexture, normalTexture, specularTexture, cloudsTexture, lightsTexture] = useMemo(() => {
    const day = textureLoader.load('/textures/earth_day.jpg');
    day.colorSpace = THREE.SRGBColorSpace;

    const normal = textureLoader.load('/textures/earth_normal.jpg');

    const specular = textureLoader.load('/textures/earth_specular.jpg');

    const clouds = textureLoader.load('/textures/earth_clouds.png');
    clouds.colorSpace = THREE.SRGBColorSpace;

    const lights = textureLoader.load('/textures/earth_lights.png');
    lights.colorSpace = THREE.SRGBColorSpace;

    return [day, normal, specular, clouds, lights];
  }, [textureLoader]);

  // Atmosphere shader material (outer glow)
  const atmosphereMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader: AtmosphereShader.vertexShader,
      fragmentShader: AtmosphereShader.fragmentShader,
      uniforms: {
        uColor: { value: new THREE.Color(0x38bdf8) }, // Electric cyan-blue
      },
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      transparent: true,
      depthWrite: false,
    });
  }, []);

  // Inner atmosphere haze material
  const innerAtmosphereMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader: InnerAtmosphereShader.vertexShader,
      fragmentShader: InnerAtmosphereShader.fragmentShader,
      uniforms: {
        uColor: { value: new THREE.Color(0x0ea5e9) },
      },
      blending: THREE.AdditiveBlending,
      side: THREE.FrontSide,
      transparent: true,
      depthWrite: false,
    });
  }, []);

  useFrame((_, delta) => {
    // Rotate Earth on its natural axial tilt
    if (earthRef.current) {
      earthRef.current.rotation.y += rotationSpeed * delta;
    }
    // Clouds drift independently slightly faster for dynamic realism
    if (cloudsRef.current) {
      cloudsRef.current.rotation.y += rotationSpeed * 1.18 * delta;
    }
    if (atmosphereRef.current) {
      atmosphereRef.current.rotation.y += rotationSpeed * delta;
    }
  });

  return (
    <group rotation={[0.41, 0, 0]}> {/* Natural Earth 23.4° axial tilt (0.41 rad) */}
      {/* 1. Main Terrestrial Earth Sphere with real NASA satellite map */}
      <mesh ref={earthRef} castShadow receiveShadow>
        <sphereGeometry args={[earthRadius, 128, 128]} />
        <meshPhongMaterial
          map={dayTexture}
          normalMap={normalTexture}
          normalScale={new THREE.Vector2(0.85, 0.85)}
          specularMap={specularTexture}
          specular={new THREE.Color(0x2288cc)}
          shininess={30}
          emissiveMap={lightsTexture}
          emissive={new THREE.Color(0xffe8a0)}
          emissiveIntensity={0.65}
        />
      </mesh>

      {/* 2. Realistic Dynamic Cloud Layer (weather patterns above surface) */}
      <mesh ref={cloudsRef}>
        <sphereGeometry args={[earthRadius + 0.04, 128, 128]} />
        <meshStandardMaterial
          map={cloudsTexture}
          transparent
          opacity={0.55}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          roughness={1}
          metalness={0}
        />
      </mesh>

      {/* 3. Inner Atmospheric Rim Haze */}
      <mesh>
        <sphereGeometry args={[earthRadius + 0.06, 64, 64]} />
        <primitive object={innerAtmosphereMaterial} attach="material" />
      </mesh>

      {/* 4. Outer Atmospheric Rayleigh Scattering Glow (ISS horizon halo) */}
      <mesh ref={atmosphereRef}>
        <sphereGeometry args={[earthRadius + 0.55, 64, 64]} />
        <primitive object={atmosphereMaterial} attach="material" />
      </mesh>
    </group>
  );
}
