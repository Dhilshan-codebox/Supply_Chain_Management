import React from 'react';

interface FenceProps {
  position?: [number, number, number];
  length?: number;
  rotation?: [number, number, number];
}

export const Fence: React.FC<FenceProps> = ({
  position = [0, 0, 0],
  length = 20,
  rotation = [0, 0, 0],
}) => {
  const postsCount = Math.floor(length / 2.5);

  return (
    <group position={position} rotation={rotation}>
      {/* Vertical Metal Posts */}
      {Array.from({ length: postsCount + 1 }).map((_, i) => {
        const x = -length / 2 + i * (length / postsCount);
        return (
          <mesh key={i} position={[x, 0.6, 0]} castShadow>
            <cylinderGeometry args={[0.04, 0.04, 1.2, 8]} />
            <meshStandardMaterial color="#94A3B8" roughness={0.4} metalness={0.4} />
          </mesh>
        );
      })}

      {/* Horizontal Rails */}
      <mesh position={[0, 1.15, 0]}>
        <boxGeometry args={[length, 0.03, 0.03]} />
        <meshStandardMaterial color="#94A3B8" roughness={0.4} metalness={0.4} />
      </mesh>
      <mesh position={[0, 0.1, 0]}>
        <boxGeometry args={[length, 0.03, 0.03]} />
        <meshStandardMaterial color="#94A3B8" roughness={0.4} metalness={0.4} />
      </mesh>
      {/* Semi-transparent mesh panel */}
      <mesh position={[0, 0.6, 0]}>
        <planeGeometry args={[length, 1.0]} />
        <meshStandardMaterial color="#CBD5E1" transparent opacity={0.35} roughness={0.6} />
      </mesh>
    </group>
  );
};
