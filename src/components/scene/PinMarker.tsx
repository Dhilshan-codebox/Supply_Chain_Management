import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { SCENE_COLORS } from './Materials';

interface PinMarkerProps {
  position?: [number, number, number];
  label?: string;
}

export const PinMarker: React.FC<PinMarkerProps> = ({ position = [0, 1.5, 0] }) => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (groupRef.current) {
      // Gentle sinusoidal bobbing
      const t = clock.getElapsedTime();
      groupRef.current.position.y = position[1] + Math.sin(t * 2.5) * 0.12;
      groupRef.current.rotation.y = t * 0.8;
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Upper sphere of map pin */}
      <mesh position={[0, 0.4, 0]} castShadow>
        <sphereGeometry args={[0.22, 16, 16]} />
        <meshStandardMaterial
          color={SCENE_COLORS.warehouseRoofAccent}
          emissive="#1D4ED8"
          emissiveIntensity={0.2}
          roughness={0.2}
        />
      </mesh>

      {/* Tapered inverted cone base */}
      <mesh position={[0, 0.16, 0]} rotation={[Math.PI, 0, 0]} castShadow>
        <coneGeometry args={[0.18, 0.32, 16]} />
        <meshStandardMaterial
          color={SCENE_COLORS.warehouseRoofAccent}
          emissive="#1D4ED8"
          emissiveIntensity={0.2}
          roughness={0.2}
        />
      </mesh>

      {/* Inner white pin eye */}
      <mesh position={[0, 0.4, 0.12]}>
        <sphereGeometry args={[0.07, 12, 12]} />
        <meshStandardMaterial color="#FFFFFF" roughness={0.1} />
      </mesh>

      {/* Soft ground target shadow disk */}
      <mesh position={[0, -position[1] + 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.1, 0.28, 16]} />
        <meshBasicMaterial color="#2B59E0" transparent opacity={0.35} />
      </mesh>
    </group>
  );
};
