import React from 'react';
import { SCENE_COLORS } from './Materials';

interface BayOutlineProps {
  position?: [number, number, number];
  width?: number;
  length?: number;
  label?: string;
}

export const BayOutline: React.FC<BayOutlineProps> = ({
  position = [0, 0.03, 0],
  width = 3.2,
  length = 6.5,
  label,
}) => {
  const hw = width / 2;
  const hl = length / 2;
  const lineThickness = 0.12;

  return (
    <group position={position}>
      {/* Concrete Apron Tile */}
      <mesh receiveShadow>
        <planeGeometry args={[width + 0.4, length + 0.4]} />
        <meshStandardMaterial color={SCENE_COLORS.dockApron} roughness={0.7} />
      </mesh>

      {/* Yellow Painted Stall Lines */}
      {/* Left line */}
      <mesh position={[-hw, 0.01, 0]}>
        <planeGeometry args={[lineThickness, length]} />
        <meshBasicMaterial color={SCENE_COLORS.bayLines} />
      </mesh>
      {/* Right line */}
      <mesh position={[hw, 0.01, 0]}>
        <planeGeometry args={[lineThickness, length]} />
        <meshBasicMaterial color={SCENE_COLORS.bayLines} />
      </mesh>
      {/* Back stop line */}
      <mesh position={[0, 0.01, -hl]}>
        <planeGeometry args={[width, lineThickness]} />
        <meshBasicMaterial color={SCENE_COLORS.bayLines} />
      </mesh>

      {/* Rubber Wheel Stops */}
      <mesh position={[-hw * 0.5, 0.08, -hl + 0.6]} castShadow>
        <boxGeometry args={[0.2, 0.12, 0.8]} />
        <meshStandardMaterial color="#1E293B" />
      </mesh>
      <mesh position={[hw * 0.5, 0.08, -hl + 0.6]} castShadow>
        <boxGeometry args={[0.2, 0.12, 0.8]} />
        <meshStandardMaterial color="#1E293B" />
      </mesh>
    </group>
  );
};
