import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { SCENE_COLORS } from './Materials';

interface TreeProps {
  position?: [number, number, number];
  scale?: number;
}

export const Tree: React.FC<TreeProps> = ({ position = [0, 0, 0], scale = 1 }) => {
  const crownRef = useRef<THREE.Group>(null);
  // Random phase offset based on position
  const phase = (position[0] * 3.7 + position[2] * 2.3) % 10;

  useFrame(({ clock }) => {
    if (crownRef.current) {
      const t = clock.getElapsedTime() * 1.5 + phase;
      crownRef.current.rotation.z = Math.sin(t) * 0.04;
      crownRef.current.rotation.x = Math.cos(t * 0.8) * 0.03;
    }
  });

  return (
    <group position={position} scale={[scale, scale, scale]}>
      {/* Wooden Trunk */}
      <mesh position={[0, 0.7, 0]} castShadow>
        <cylinderGeometry args={[0.15, 0.22, 1.4, 8]} />
        <meshStandardMaterial color={SCENE_COLORS.treeTrunk} roughness={0.8} />
      </mesh>

      {/* Swaying Foliage Crown Group */}
      <group ref={crownRef} position={[0, 0.7, 0]}>
        {/* Stylized Rounded Foliage Crown */}
        <mesh position={[0, 1.1, 0]} castShadow>
          <sphereGeometry args={[0.9, 16, 16]} />
          <meshStandardMaterial color={SCENE_COLORS.treeFoliage} roughness={0.5} />
        </mesh>

        {/* Smaller Top Cluster for organic toy volume */}
        <mesh position={[0.2, 1.6, 0.1]} castShadow>
          <sphereGeometry args={[0.6, 12, 12]} />
          <meshStandardMaterial color={SCENE_COLORS.treeFoliageDark} roughness={0.5} />
        </mesh>
      </group>

      {/* Soft Ground Shadow Disk */}
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.95, 16]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.08} />
      </mesh>
    </group>
  );
};
