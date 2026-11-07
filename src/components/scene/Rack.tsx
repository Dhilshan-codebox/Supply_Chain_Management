import React from 'react';
import { SCENE_COLORS } from './Materials';

interface RackProps {
  position?: [number, number, number];
  length?: number;
  levels?: number;
}

export const Rack: React.FC<RackProps> = ({
  position = [0, 0, 0],
  length = 6,
  levels = 2,
}) => {
  const uprightColor = SCENE_COLORS.rackBlue;
  const beamColor = SCENE_COLORS.rackOrange;
  const uprightHeight = levels * 1.8 + 0.4;
  const baysCount = Math.floor(length / 2.5);

  return (
    <group position={position}>
      {/* Blue Vertical Upright Columns */}
      {Array.from({ length: baysCount + 1 }).map((_, i) => {
        const x = -length / 2 + i * (length / baysCount);
        return (
          <group key={i} position={[x, 0, 0]}>
            {/* Front upright */}
            <mesh position={[0, uprightHeight / 2, 0.6]} castShadow>
              <boxGeometry args={[0.08, uprightHeight, 0.08]} />
              <meshStandardMaterial color={uprightColor} roughness={0.4} />
            </mesh>
            {/* Back upright */}
            <mesh position={[0, uprightHeight / 2, -0.6]} castShadow>
              <boxGeometry args={[0.08, uprightHeight, 0.08]} />
              <meshStandardMaterial color={uprightColor} roughness={0.4} />
            </mesh>
            {/* Diagonal cross braces */}
            <mesh position={[0, uprightHeight / 2, 0]} rotation={[0, 0, 0.3]}>
              <boxGeometry args={[0.04, uprightHeight * 0.9, 0.04]} />
              <meshStandardMaterial color="#94A3B8" />
            </mesh>
          </group>
        );
      })}

      {/* Orange Horizontal Load Beams */}
      {Array.from({ length: levels }).map((_, lvl) => {
        const y = (lvl + 1) * 1.7;
        return (
          <group key={lvl} position={[0, y, 0]}>
            {/* Front beam */}
            <mesh position={[0, 0, 0.6]} castShadow>
              <boxGeometry args={[length, 0.1, 0.08]} />
              <meshStandardMaterial color={beamColor} roughness={0.3} />
            </mesh>
            {/* Back beam */}
            <mesh position={[0, 0, -0.6]} castShadow>
              <boxGeometry args={[length, 0.1, 0.08]} />
              <meshStandardMaterial color={beamColor} roughness={0.3} />
            </mesh>

            {/* Wire Decking / Pallet Shelf */}
            <mesh position={[0, 0.04, 0]}>
              <boxGeometry args={[length - 0.1, 0.02, 1.15]} />
              <meshStandardMaterial color="#64748B" roughness={0.5} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
};
