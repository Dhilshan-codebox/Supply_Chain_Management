import React from 'react';
import { SCENE_COLORS } from './Materials';

interface ShippingContainerProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
  color?: string;
}

export const ShippingContainer: React.FC<ShippingContainerProps> = ({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  color = SCENE_COLORS.containerTeal,
}) => {
  return (
    <group position={position} rotation={rotation}>
      {/* Main Container Body */}
      <mesh position={[0, 1.25, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.4, 2.5, 6.0]} />
        <meshStandardMaterial color={color} roughness={0.4} metalness={0.15} />
      </mesh>

      {/* Corrugation Panels Side Trim */}
      {Array.from({ length: 11 }).map((_, i) => (
        <mesh key={i} position={[1.21, 1.25, (i - 5) * 0.5]}>
          <boxGeometry args={[0.04, 2.3, 0.25]} />
          <meshStandardMaterial color={color} roughness={0.5} />
        </mesh>
      ))}
      {Array.from({ length: 11 }).map((_, i) => (
        <mesh key={i} position={[-1.21, 1.25, (i - 5) * 0.5]}>
          <boxGeometry args={[0.04, 2.3, 0.25]} />
          <meshStandardMaterial color={color} roughness={0.5} />
        </mesh>
      ))}

      {/* 8 Heavy Corner Castings */}
      {[-1.2, 1.2].map((x) =>
        [0.1, 2.45].map((y) =>
          [-3.0, 3.0].map((z) => (
            <mesh key={`${x}-${y}-${z}`} position={[x, y, z]} castShadow>
              <boxGeometry args={[0.2, 0.2, 0.2]} />
              <meshStandardMaterial color="#0F766E" metalness={0.5} />
            </mesh>
          ))
        )
      )}

      {/* Rear Vertical Door Locking Rods */}
      <mesh position={[-0.4, 1.25, 3.02]}>
        <cylinderGeometry args={[0.03, 0.03, 2.2, 8]} />
        <meshStandardMaterial color="#334155" metalness={0.6} />
      </mesh>
      <mesh position={[0.4, 1.25, 3.02]}>
        <cylinderGeometry args={[0.03, 0.03, 2.2, 8]} />
        <meshStandardMaterial color="#334155" metalness={0.6} />
      </mesh>
    </group>
  );
};
