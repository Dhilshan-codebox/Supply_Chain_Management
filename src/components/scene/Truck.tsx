import React, { useState } from 'react';
import { Html } from '@react-three/drei';
import { Truck as TruckType } from '../../types';
import { useStore } from '../../store/useStore';
import { SCENE_COLORS } from './Materials';
import { SelectionHighlight } from './SelectionHighlight';

interface TruckProps {
  truck: TruckType;
}

export const Truck: React.FC<TruckProps> = ({ truck }) => {
  const { selection, select } = useStore();
  const [hovered, setHovered] = useState(false);

  const isSelected = selection?.type === 'truck' && selection.id === truck.id;

  // Determine carrier brand color
  const brandColors: Record<string, string> = {
    WareTrack: '#2B59E0',
    Bluepeak: '#0EA5E9',
    Cargoviva: '#F97316',
    Nordline: '#10B981',
  };
  const liveryColor = brandColors[truck.carrier] || '#2B59E0';

  return (
    <group
      position={truck.position}
      onClick={(e) => {
        e.stopPropagation();
        select({ type: 'truck', id: truck.id });
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
      }}
      onPointerOut={() => setHovered(false)}
    >
      {/* Truck Model Assembly */}
      <group position={[0, 0, 0]}>
        
        {/* === REAR CARGO TRAILER BOX === */}
        <group position={[0, 1.6, -1.2]}>
          {/* Main White Box */}
          <mesh castShadow receiveShadow>
            <boxGeometry args={[2.2, 2.3, 4.8]} />
            <meshStandardMaterial color="#FFFFFF" roughness={0.3} metalness={0.05} />
          </mesh>

          {/* Company Livery Stripe on Sides */}
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[2.24, 0.45, 4.4]} />
            <meshStandardMaterial color={liveryColor} roughness={0.3} />
          </mesh>

          {/* Roof Ridge details */}
          <mesh position={[0, 1.18, 0]}>
            <boxGeometry args={[2.1, 0.06, 4.6]} />
            <meshStandardMaterial color="#E2E8F0" roughness={0.4} />
          </mesh>

          {/* Side Brand Text Logo Plate */}
          <Html position={[1.15, 0, 0]} transform rotation={[0, Math.PI / 2, 0]} center>
            <div className="text-[10px] font-black tracking-widest uppercase text-white select-none pointer-events-none">
              {truck.carrier}
            </div>
          </Html>
          <Html position={[-1.15, 0, 0]} transform rotation={[0, -Math.PI / 2, 0]} center>
            <div className="text-[10px] font-black tracking-widest uppercase text-white select-none pointer-events-none">
              {truck.carrier}
            </div>
          </Html>

          {/* Rear Cargo Roll-Up / Swing Doors */}
          <mesh position={[0, 0, -2.42]}>
            <boxGeometry args={[2.0, 2.1, 0.05]} />
            <meshStandardMaterial color="#94A3B8" roughness={0.5} />
          </mesh>
          {/* Rear Taillights */}
          <mesh position={[-0.85, -0.9, -2.44]}>
            <boxGeometry args={[0.25, 0.15, 0.02]} />
            <meshBasicMaterial color="#EF4444" />
          </mesh>
          <mesh position={[0.85, -0.9, -2.44]}>
            <boxGeometry args={[0.25, 0.15, 0.02]} />
            <meshBasicMaterial color="#EF4444" />
          </mesh>
        </group>

        {/* === FRONT DRIVER CABIN === */}
        <group position={[0, 1.3, 2.0]}>
          {/* Lower Cab Block */}
          <mesh castShadow receiveShadow>
            <boxGeometry args={[2.15, 1.8, 1.8]} />
            <meshStandardMaterial color={liveryColor} roughness={0.25} metalness={0.1} />
          </mesh>

          {/* Front Sloped Windshield (Glass) */}
          <mesh position={[0, 0.35, 0.92]}>
            <boxGeometry args={[1.95, 0.75, 0.05]} />
            <meshStandardMaterial color="#1E293B" roughness={0.1} metalness={0.6} />
          </mesh>

          {/* Side Windows */}
          <mesh position={[-1.09, 0.35, 0.2]}>
            <boxGeometry args={[0.04, 0.65, 0.9]} />
            <meshStandardMaterial color="#1E293B" roughness={0.1} metalness={0.6} />
          </mesh>
          <mesh position={[1.09, 0.35, 0.2]}>
            <boxGeometry args={[0.04, 0.65, 0.9]} />
            <meshStandardMaterial color="#1E293B" roughness={0.1} metalness={0.6} />
          </mesh>

          {/* Front Bumper & Chrome Grille */}
          <mesh position={[0, -0.55, 0.95]} castShadow>
            <boxGeometry args={[2.1, 0.45, 0.18]} />
            <meshStandardMaterial color="#334155" roughness={0.4} />
          </mesh>

          {/* Headlights */}
          <mesh position={[-0.75, -0.5, 1.05]}>
            <boxGeometry args={[0.35, 0.18, 0.04]} />
            <meshBasicMaterial color="#FEF08A" />
          </mesh>
          <mesh position={[0.75, -0.5, 1.05]}>
            <boxGeometry args={[0.35, 0.18, 0.04]} />
            <meshBasicMaterial color="#FEF08A" />
          </mesh>
        </group>

        {/* === WHEELS & CHASSIS === */}
        {/* Front Steer Axle */}
        <mesh position={[-1.1, 0.42, 2.1]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.42, 0.42, 0.3, 16]} />
          <meshStandardMaterial color={SCENE_COLORS.truckWheel} roughness={0.8} />
        </mesh>
        <mesh position={[1.1, 0.42, 2.1]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.42, 0.42, 0.3, 16]} />
          <meshStandardMaterial color={SCENE_COLORS.truckWheel} roughness={0.8} />
        </mesh>

        {/* Rear Dual Axles */}
        <mesh position={[-1.1, 0.42, -1.8]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.42, 0.42, 0.3, 16]} />
          <meshStandardMaterial color={SCENE_COLORS.truckWheel} roughness={0.8} />
        </mesh>
        <mesh position={[1.1, 0.42, -1.8]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.42, 0.42, 0.3, 16]} />
          <meshStandardMaterial color={SCENE_COLORS.truckWheel} roughness={0.8} />
        </mesh>
        <mesh position={[-1.1, 0.42, -2.8]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.42, 0.42, 0.3, 16]} />
          <meshStandardMaterial color={SCENE_COLORS.truckWheel} roughness={0.8} />
        </mesh>
        <mesh position={[1.1, 0.42, -2.8]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.42, 0.42, 0.3, 16]} />
          <meshStandardMaterial color={SCENE_COLORS.truckWheel} roughness={0.8} />
        </mesh>
      </group>

      {/* Hover Tooltip */}
      {hovered && !isSelected && (
        <Html position={[0, 3.4, 0]} center distanceFactor={16}>
          <div className="px-2.5 py-1 bg-white/95 backdrop-blur-md border border-[#E6E9F5] shadow-lg rounded-lg text-xs font-bold text-[#141B34] whitespace-nowrap pointer-events-none">
            <span className="text-[#2B59E0] mr-1">{truck.id}</span>
            <span>{truck.carrier} • {truck.status}</span>
          </div>
        </Html>
      )}

      {/* Selection Highlight */}
      {isSelected && (
        <SelectionHighlight
          size={[2.6, 2.8, 6.2]}
          offset={[0, 1.4, -0.4]}
          label={`${truck.id} ${truck.status}`}
        />
      )}
    </group>
  );
};
