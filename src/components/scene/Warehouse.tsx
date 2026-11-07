import React from 'react';
import { Html } from '@react-three/drei';
import { useStore } from '../../store/useStore';
import { SCENE_COLORS } from './Materials';

interface WarehouseProps {
  position?: [number, number, number];
  width?: number;
  depth?: number;
  height?: number;
  doorsCount?: number;
  doorPrefix?: string;
  siteId: string;
}

export const Warehouse: React.FC<WarehouseProps> = ({
  position = [0, 0, 0],
  width = 24,
  depth = 14,
  height = 6,
  doorsCount = 3,
  doorPrefix = 'Bay ',
  siteId,
}) => {
  const { select, selection } = useStore();

  const halfW = width / 2;
  const halfD = depth / 2;
  const halfH = height / 2;

  // Door spacing calculation
  const doorWidth = 2.4;
  const doorHeight = 3.2;
  const spacing = width / (doorsCount + 1);

  return (
    <group position={position}>
      {/* Concrete Foundation Base */}
      <mesh position={[0, 0.2, 0]} receiveShadow castShadow>
        <boxGeometry args={[width + 0.4, 0.4, depth + 0.4]} />
        <meshStandardMaterial color={SCENE_COLORS.warehouseWallDark} roughness={0.6} />
      </mesh>

      {/* Main Building Walls */}
      <mesh position={[0, halfH + 0.2, 0]} castShadow receiveShadow>
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial color={SCENE_COLORS.warehouseWall} roughness={0.5} />
      </mesh>

      {/* Blue Pitched / Stepped Corrugated Roof */}
      <group position={[0, height + 0.2, 0]}>
        {/* Main Ridge Gable */}
        <mesh position={[0, 1.2, 0]} rotation={[0, 0, 0]} castShadow receiveShadow>
          <boxGeometry args={[width + 0.8, 0.4, depth + 0.8]} />
          <meshStandardMaterial color={SCENE_COLORS.warehouseRoof} roughness={0.3} metalness={0.2} />
        </mesh>
        {/* Upper clerestory block */}
        <mesh position={[0, 1.8, 0]} castShadow receiveShadow>
          <boxGeometry args={[width * 0.7, 0.8, depth * 0.6]} />
          <meshStandardMaterial color={SCENE_COLORS.warehouseRoofAccent} roughness={0.3} metalness={0.2} />
        </mesh>

        {/* Roof Corrugation Ridges */}
        {Array.from({ length: 9 }).map((_, i) => (
          <mesh key={i} position={[(i - 4) * (width / 9), 2.25, 0]}>
            <boxGeometry args={[0.2, 0.1, depth * 0.6 + 0.2]} />
            <meshStandardMaterial color="#1E3A8A" roughness={0.3} />
          </mesh>
        ))}

        {/* Roof Disc Logo */}
        <group position={[0, 2.3, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <mesh castShadow>
            <cylinderGeometry args={[1.6, 1.6, 0.2, 32]} />
            <meshStandardMaterial color="#FFFFFF" roughness={0.2} />
          </mesh>
          <mesh position={[0, 0.12, 0]}>
            <cylinderGeometry args={[1.3, 1.3, 0.05, 32]} />
            <meshStandardMaterial color={SCENE_COLORS.warehouseRoof} roughness={0.2} />
          </mesh>
          <Html position={[0, 0.15, 0]} center transform rotation={[0, 0, 0]}>
            <div className="w-10 h-10 flex items-center justify-center font-extrabold text-[#FFFFFF] text-xs select-none pointer-events-none">
              WT
            </div>
          </Html>
        </group>
      </group>

      {/* Dock Doors Along Front Wall (Z = halfD) */}
      {Array.from({ length: doorsCount }).map((_, idx) => {
        const doorX = -halfW + spacing * (idx + 1);
        const doorId = `${doorPrefix}${idx + 1}`;
        const isSelected = selection?.type === 'dock' && selection.id === doorId;

        return (
          <group
            key={idx}
            position={[doorX, 0.2, halfD + 0.05]}
            onClick={(e) => {
              e.stopPropagation();
              select({ type: 'dock', id: doorId });
            }}
          >
            {/* Blue Outer Frame */}
            <mesh position={[0, doorHeight / 2, 0]}>
              <boxGeometry args={[doorWidth + 0.3, doorHeight + 0.3, 0.15]} />
              <meshStandardMaterial
                color={isSelected ? '#2B59E0' : SCENE_COLORS.warehouseDoorFrame}
                roughness={0.3}
              />
            </mesh>

            {/* Roll-up Door Panels */}
            <mesh position={[0, doorHeight / 2, 0.05]}>
              <boxGeometry args={[doorWidth, doorHeight, 0.05]} />
              <meshStandardMaterial color={SCENE_COLORS.warehouseDoorRoll} roughness={0.6} />
            </mesh>

            {/* Door Number Sign */}
            <group position={[0, doorHeight + 0.35, 0.1]}>
              <mesh>
                <boxGeometry args={[0.9, 0.45, 0.05]} />
                <meshStandardMaterial color="#2B59E0" roughness={0.2} />
              </mesh>
              <Html position={[0, 0, 0.04]} center transform>
                <div className="px-1 py-0.5 text-[9px] font-extrabold text-white select-none pointer-events-none">
                  {idx + 1}
                </div>
              </Html>
            </group>

            {/* Concrete Dock Bumper Pads */}
            <mesh position={[-doorWidth / 2 - 0.1, 0.5, 0.1]}>
              <boxGeometry args={[0.15, 0.8, 0.2]} />
              <meshStandardMaterial color="#1E293B" />
            </mesh>
            <mesh position={[doorWidth / 2 + 0.1, 0.5, 0.1]}>
              <boxGeometry args={[0.15, 0.8, 0.2]} />
              <meshStandardMaterial color="#1E293B" />
            </mesh>
          </group>
        );
      })}

      {/* Industrial Side Exhaust & AC Units on roof */}
      <mesh position={[halfW - 3, height + 0.8, -halfD + 3]} castShadow>
        <boxGeometry args={[1.5, 1.0, 1.5]} />
        <meshStandardMaterial color="#94A3B8" roughness={0.4} />
      </mesh>
      <mesh position={[halfW - 5.5, height + 0.8, -halfD + 3]} castShadow>
        <boxGeometry args={[1.5, 1.0, 1.5]} />
        <meshStandardMaterial color="#94A3B8" roughness={0.4} />
      </mesh>
    </group>
  );
};
