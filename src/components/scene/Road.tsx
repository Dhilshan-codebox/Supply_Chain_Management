import React from 'react';
import { SCENE_COLORS } from './Materials';

interface RoadProps {
  position?: [number, number, number];
  length?: number;
  width?: number;
  rotation?: [number, number, number];
}

export const Road: React.FC<RoadProps> = ({
  position = [0, 0.02, 0],
  length = 40,
  width = 6,
  rotation = [0, 0, 0],
}) => {
  const dashCount = Math.floor(length / 3);

  return (
    <group position={position} rotation={rotation}>
      {/* Asphalt Surface */}
      <mesh receiveShadow>
        <planeGeometry args={[width, length]} />
        <meshStandardMaterial
          color={SCENE_COLORS.road}
          roughness={0.8}
        />
      </mesh>

      {/* Dashed White Center Lines */}
      {Array.from({ length: dashCount }).map((_, i) => (
        <mesh key={i} position={[0, 0.01, -length / 2 + (i + 0.5) * 3]}>
          <planeGeometry args={[0.2, 1.6]} />
          <meshBasicMaterial color={SCENE_COLORS.roadMarking} />
        </mesh>
      ))}

      {/* Concrete Curb Edges */}
      <mesh position={[-width / 2 - 0.1, 0.04, 0]}>
        <boxGeometry args={[0.2, 0.08, length]} />
        <meshStandardMaterial color="#CBD5E1" roughness={0.7} />
      </mesh>
      <mesh position={[width / 2 + 0.1, 0.04, 0]}>
        <boxGeometry args={[0.2, 0.08, length]} />
        <meshStandardMaterial color="#CBD5E1" roughness={0.7} />
      </mesh>
    </group>
  );
};
