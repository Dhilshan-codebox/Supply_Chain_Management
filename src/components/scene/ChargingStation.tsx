import React from 'react';
import { SCENE_COLORS } from './Materials';

interface ChargingStationProps {
  position?: [number, number, number];
  unitsCount?: number;
}

export const ChargingStation: React.FC<ChargingStationProps> = ({
  position = [0, 0, 0],
  unitsCount = 2,
}) => {
  return (
    <group position={position}>
      {/* Green charging parking zone on concrete ground */}
      <mesh position={[0, 0.02, 0]} receiveShadow>
        <planeGeometry args={[unitsCount * 2.2 + 0.8, 3.4]} />
        <meshStandardMaterial color="#E8F7EE" roughness={0.6} />
      </mesh>
      {/* Green perimeter line */}
      <mesh position={[0, 0.03, 0]}>
        <planeGeometry args={[unitsCount * 2.2 + 0.6, 3.2]} />
        <meshBasicMaterial color="#22C55E" wireframe />
      </mesh>

      {/* Charging Stanchion Units */}
      {Array.from({ length: unitsCount }).map((_, i) => {
        const x = -((unitsCount - 1) * 2.0) / 2 + i * 2.0;
        return (
          <group key={i} position={[x, 0, -1.2]}>
            {/* White Pillar Unit */}
            <mesh position={[0, 0.9, 0]} castShadow>
              <boxGeometry args={[0.5, 1.8, 0.4]} />
              <meshStandardMaterial color={SCENE_COLORS.chargingWhite} roughness={0.2} />
            </mesh>

            {/* Glowing Green Status LED Strip */}
            <mesh position={[0, 1.4, 0.21]}>
              <boxGeometry args={[0.3, 0.12, 0.04]} />
              <meshBasicMaterial color={SCENE_COLORS.chargingGlow} />
            </mesh>

            {/* Soft Green Point Light */}
            <pointLight
              position={[0, 1.4, 0.5]}
              color="#22C55E"
              intensity={0.8}
              distance={3.5}
            />

            {/* Cable & Plug Nozzle */}
            <mesh position={[0.26, 0.9, 0]}>
              <cylinderGeometry args={[0.03, 0.03, 0.6, 8]} />
              <meshStandardMaterial color="#1E293B" />
            </mesh>
          </group>
        );
      })}
    </group>
  );
};
