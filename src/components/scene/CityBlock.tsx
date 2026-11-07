import React from 'react';
import { SCENE_COLORS } from './Materials';

interface CityBlockProps {
  position?: [number, number, number];
  width?: number;
  height?: number;
  depth?: number;
}

export const CityBlock: React.FC<CityBlockProps> = ({
  position = [0, 0, 0],
  width = 12,
  height = 14,
  depth = 12,
}) => {
  return (
    <group position={position}>
      {/* Background building monolith */}
      <mesh position={[0, height / 2, 0]} receiveShadow>
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial
          color={SCENE_COLORS.cityBlock}
          roughness={0.8}
          metalness={0.05}
        />
      </mesh>

      {/* Roof Parapet Top */}
      <mesh position={[0, height + 0.2, 0]}>
        <boxGeometry args={[width - 0.4, 0.4, depth - 0.4]} />
        <meshStandardMaterial color="#CCD4E6" roughness={0.7} />
      </mesh>

      {/* Subtle window grid impression */}
      <mesh position={[0, height / 2, depth / 2 + 0.05]}>
        <boxGeometry args={[width * 0.8, height * 0.8, 0.02]} />
        <meshStandardMaterial color="#CBD5E1" roughness={0.6} />
      </mesh>
    </group>
  );
};
