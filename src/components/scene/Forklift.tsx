import React, { useState, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { Forklift as ForkliftType } from '../../types';
import { useStore } from '../../store/useStore';
import { SCENE_COLORS } from './Materials';
import { SelectionHighlight } from './SelectionHighlight';

interface ForkliftProps {
  forklift: ForkliftType;
}

export const Forklift: React.FC<ForkliftProps> = ({ forklift }) => {
  const { selection, select } = useStore();
  const [hovered, setHovered] = useState(false);
  const meshRef = useRef<THREE.Group>(null);
  const mastRef = useRef<THREE.Group>(null);

  const isSelected = selection?.type === 'forklift' && selection.id === forklift.id;
  const beaconRef = useRef<THREE.PointLight>(null);

  useFrame(({ clock }) => {
    if (beaconRef.current) {
      const flash = Math.sin(clock.getElapsedTime() * 10) > 0.2 ? 1.4 : 0.2;
      beaconRef.current.intensity = flash;
    }
    if (forklift.status === 'Loading' || forklift.status === 'Unloading') {
      if (mastRef.current) {
        // Vertical mast carriage motion
        const t = clock.getElapsedTime() * 2;
        mastRef.current.position.y = 0.4 + (Math.sin(t) * 0.5 + 0.5) * 0.6;
      }
    }
  });

  return (
    <group
      ref={meshRef}
      position={forklift.position}
      onClick={(e) => {
        e.stopPropagation();
        select({ type: 'forklift', id: forklift.id });
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
      }}
      onPointerOut={() => setHovered(false)}
    >
      {/* Forklift Chassis */}
      <group position={[0, 0.45, 0]}>
        {/* Main yellow body */}
        <mesh position={[0, 0.15, -0.1]} castShadow receiveShadow>
          <boxGeometry args={[1.1, 0.65, 1.4]} />
          <meshStandardMaterial color={SCENE_COLORS.forkliftYellow} roughness={0.3} metalness={0.1} />
        </mesh>

        {/* Rear counterweight (dark curved) */}
        <mesh position={[0, 0.25, -0.75]} castShadow>
          <boxGeometry args={[1.05, 0.55, 0.4]} />
          <meshStandardMaterial color={SCENE_COLORS.forkliftBlack} roughness={0.5} />
        </mesh>

        {/* Overhead protective guard cage */}
        <group position={[0, 0.75, -0.1]}>
          {/* 4 Pillars */}
          <mesh position={[-0.48, 0.4, 0.55]}>
            <cylinderGeometry args={[0.04, 0.04, 0.8, 8]} />
            <meshStandardMaterial color={SCENE_COLORS.forkliftBlack} />
          </mesh>
          <mesh position={[0.48, 0.4, 0.55]}>
            <cylinderGeometry args={[0.04, 0.04, 0.8, 8]} />
            <meshStandardMaterial color={SCENE_COLORS.forkliftBlack} />
          </mesh>
          <mesh position={[-0.48, 0.4, -0.6]}>
            <cylinderGeometry args={[0.04, 0.04, 0.8, 8]} />
            <meshStandardMaterial color={SCENE_COLORS.forkliftBlack} />
          </mesh>
          <mesh position={[0.48, 0.4, -0.6]}>
            <cylinderGeometry args={[0.04, 0.04, 0.8, 8]} />
            <meshStandardMaterial color={SCENE_COLORS.forkliftBlack} />
          </mesh>

          {/* Top roof grid */}
          <mesh position={[0, 0.8, -0.02]} castShadow>
            <boxGeometry args={[1.05, 0.04, 1.25]} />
            <meshStandardMaterial color={SCENE_COLORS.forkliftBlack} />
          </mesh>

          {/* Amber Warning Strobe Beacon */}
          <group position={[0, 0.9, -0.4]}>
            <mesh castShadow>
              <cylinderGeometry args={[0.07, 0.07, 0.12, 12]} />
              <meshBasicMaterial color="#F59E0B" />
            </mesh>
            <pointLight ref={beaconRef} color="#F59E0B" intensity={1.2} distance={3.5} />
          </group>
        </group>

        {/* Driver Operator */}
        <group position={[0, 0.55, -0.1]}>
          {/* Body/Vest */}
          <mesh position={[0, 0.3, 0]} castShadow>
            <boxGeometry args={[0.45, 0.45, 0.35]} />
            <meshStandardMaterial color={SCENE_COLORS.driverVest} roughness={0.5} />
          </mesh>
          {/* Head */}
          <mesh position={[0, 0.65, 0]} castShadow>
            <sphereGeometry args={[0.16, 12, 12]} />
            <meshStandardMaterial color={SCENE_COLORS.driverSkin} />
          </mesh>
          {/* Hardhat */}
          <mesh position={[0, 0.76, 0]} castShadow>
            <cylinderGeometry args={[0.2, 0.18, 0.1, 12]} />
            <meshStandardMaterial color={SCENE_COLORS.driverHardhat} roughness={0.3} />
          </mesh>
        </group>

        {/* 4 Wheels */}
        <mesh position={[-0.58, -0.18, 0.45]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.26, 0.26, 0.2, 16]} />
          <meshStandardMaterial color={SCENE_COLORS.truckWheel} roughness={0.8} />
        </mesh>
        <mesh position={[0.58, -0.18, 0.45]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.26, 0.26, 0.2, 16]} />
          <meshStandardMaterial color={SCENE_COLORS.truckWheel} roughness={0.8} />
        </mesh>
        <mesh position={[-0.54, -0.2, -0.6]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.24, 0.24, 0.18, 16]} />
          <meshStandardMaterial color={SCENE_COLORS.truckWheel} roughness={0.8} />
        </mesh>
        <mesh position={[0.54, -0.2, -0.6]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.24, 0.24, 0.18, 16]} />
          <meshStandardMaterial color={SCENE_COLORS.truckWheel} roughness={0.8} />
        </mesh>

        {/* Front Vertical Mast Columns */}
        <group position={[0, 0.35, 0.72]}>
          <mesh position={[-0.32, 0.5, 0]}>
            <boxGeometry args={[0.08, 1.6, 0.08]} />
            <meshStandardMaterial color={SCENE_COLORS.forkliftMast} metalness={0.4} />
          </mesh>
          <mesh position={[0.32, 0.5, 0]}>
            <boxGeometry args={[0.08, 1.6, 0.08]} />
            <meshStandardMaterial color={SCENE_COLORS.forkliftMast} metalness={0.4} />
          </mesh>

          {/* Animated Fork Carriage */}
          <group ref={mastRef} position={[0, 0.4, 0.08]}>
            {/* Crossbar */}
            <mesh position={[0, 0, 0]}>
              <boxGeometry args={[0.78, 0.1, 0.04]} />
              <meshStandardMaterial color={SCENE_COLORS.forkliftMast} />
            </mesh>
            {/* Left Fork Tyne */}
            <mesh position={[-0.22, -0.3, 0.38]}>
              <boxGeometry args={[0.08, 0.04, 0.8]} />
              <meshStandardMaterial color="#475569" metalness={0.5} />
            </mesh>
            {/* Right Fork Tyne */}
            <mesh position={[0.22, -0.3, 0.38]}>
              <boxGeometry args={[0.08, 0.04, 0.8]} />
              <meshStandardMaterial color="#475569" metalness={0.5} />
            </mesh>

            {/* If carrying a pallet, show cargo load on forks */}
            {forklift.carrying !== 'None' && (
              <group position={[0, 0.05, 0.4]}>
                <mesh castShadow>
                  <boxGeometry args={[0.75, 0.5, 0.75]} />
                  <meshStandardMaterial color={SCENE_COLORS.cardboardBox} roughness={0.6} />
                </mesh>
              </group>
            )}
          </group>
        </group>
      </group>

      {/* Hover Tooltip */}
      {hovered && !isSelected && (
        <Html position={[0, 2.2, 0]} center distanceFactor={15}>
          <div className="px-2.5 py-1 bg-white/95 backdrop-blur-md border border-[#E6E9F5] shadow-lg rounded-lg text-xs font-bold text-[#141B34] whitespace-nowrap pointer-events-none">
            <span className="text-[#2B59E0] mr-1">{forklift.id}</span>
            <span>{forklift.statusText}</span>
          </div>
        </Html>
      )}

      {/* Selection Highlight */}
      {isSelected && (
        <SelectionHighlight
          size={[1.8, 2.0, 2.2]}
          offset={[0, 1.0, 0]}
          label={`${forklift.id} ${forklift.status}`}
        />
      )}
    </group>
  );
};
