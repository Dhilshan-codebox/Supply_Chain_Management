import React, { useState } from 'react';
import { Html } from '@react-three/drei';
import { useStore } from '../../store/useStore';
import { PalletItem } from '../../types';
import { SCENE_COLORS } from './Materials';
import { PinMarker } from './PinMarker';
import { SelectionHighlight } from './SelectionHighlight';

interface PalletProps {
  pallet: PalletItem;
}

export const Pallet: React.FC<PalletProps> = ({ pallet }) => {
  const { selection, select } = useStore();
  const [hovered, setHovered] = useState(false);

  const isSelected = selection?.type === 'pallet' && selection.id === pallet.id;

  return (
    <group
      position={pallet.position}
      onClick={(e) => {
        e.stopPropagation();
        select({ type: 'pallet', id: pallet.id });
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
      }}
      onPointerOut={() => setHovered(false)}
    >
      {/* Wooden Pallet Base: Bottom stringers + top deckboards */}
      <group position={[0, 0.08, 0]}>
        {/* 3 Runner stringers */}
        <mesh position={[-0.45, 0.04, 0]} castShadow>
          <boxGeometry args={[0.08, 0.12, 1.1]} />
          <meshStandardMaterial color={SCENE_COLORS.woodPallet} roughness={0.7} />
        </mesh>
        <mesh position={[0, 0.04, 0]} castShadow>
          <boxGeometry args={[0.08, 0.12, 1.1]} />
          <meshStandardMaterial color={SCENE_COLORS.woodPallet} roughness={0.7} />
        </mesh>
        <mesh position={[0.45, 0.04, 0]} castShadow>
          <boxGeometry args={[0.08, 0.12, 1.1]} />
          <meshStandardMaterial color={SCENE_COLORS.woodPallet} roughness={0.7} />
        </mesh>

        {/* Top deck boards */}
        <mesh position={[0, 0.12, 0]} castShadow>
          <boxGeometry args={[1.05, 0.04, 1.15]} />
          <meshStandardMaterial color={SCENE_COLORS.woodPallet} roughness={0.7} />
        </mesh>
      </group>

      {/* Cargo Load Variants */}
      {pallet.variant === 'boxes' && (
        <group position={[0, 0.22, 0]}>
          {/* Layer 1: 4 boxes */}
          <mesh position={[-0.24, 0.22, -0.24]} castShadow>
            <boxGeometry args={[0.46, 0.42, 0.46]} />
            <meshStandardMaterial color={SCENE_COLORS.cardboardBox} roughness={0.6} />
          </mesh>
          <mesh position={[0.24, 0.22, -0.24]} castShadow>
            <boxGeometry args={[0.46, 0.42, 0.46]} />
            <meshStandardMaterial color={SCENE_COLORS.cardboardBox} roughness={0.6} />
          </mesh>
          <mesh position={[-0.24, 0.22, 0.24]} castShadow>
            <boxGeometry args={[0.46, 0.42, 0.46]} />
            <meshStandardMaterial color={SCENE_COLORS.cardboardBox} roughness={0.6} />
          </mesh>
          <mesh position={[0.24, 0.22, 0.24]} castShadow>
            <boxGeometry args={[0.46, 0.42, 0.46]} />
            <meshStandardMaterial color={SCENE_COLORS.cardboardBox} roughness={0.6} />
          </mesh>

          {/* Layer 2: 4 boxes */}
          <mesh position={[-0.24, 0.62, -0.24]} castShadow>
            <boxGeometry args={[0.46, 0.38, 0.46]} />
            <meshStandardMaterial color={SCENE_COLORS.cardboardBox} roughness={0.6} />
          </mesh>
          <mesh position={[0.24, 0.62, -0.24]} castShadow>
            <boxGeometry args={[0.46, 0.38, 0.46]} />
            <meshStandardMaterial color={SCENE_COLORS.cardboardBox} roughness={0.6} />
          </mesh>
          <mesh position={[-0.24, 0.62, 0.24]} castShadow>
            <boxGeometry args={[0.46, 0.38, 0.46]} />
            <meshStandardMaterial color={SCENE_COLORS.cardboardBox} roughness={0.6} />
          </mesh>
          <mesh position={[0.24, 0.62, 0.24]} castShadow>
            <boxGeometry args={[0.46, 0.38, 0.46]} />
            <meshStandardMaterial color={SCENE_COLORS.cardboardBox} roughness={0.6} />
          </mesh>
        </group>
      )}

      {pallet.variant === 'plastic' && (
        <group position={[0, 0.22, 0]}>
          {/* Blue plastic stackable containers */}
          <mesh position={[-0.24, 0.2, -0.24]} castShadow>
            <boxGeometry args={[0.45, 0.36, 0.45]} />
            <meshStandardMaterial color={SCENE_COLORS.plasticBlue} roughness={0.3} />
          </mesh>
          <mesh position={[0.24, 0.2, -0.24]} castShadow>
            <boxGeometry args={[0.45, 0.36, 0.45]} />
            <meshStandardMaterial color={SCENE_COLORS.plasticBlue} roughness={0.3} />
          </mesh>
          <mesh position={[-0.24, 0.2, 0.24]} castShadow>
            <boxGeometry args={[0.45, 0.36, 0.45]} />
            <meshStandardMaterial color={SCENE_COLORS.plasticBlue} roughness={0.3} />
          </mesh>
          <mesh position={[0.24, 0.2, 0.24]} castShadow>
            <boxGeometry args={[0.45, 0.36, 0.45]} />
            <meshStandardMaterial color={SCENE_COLORS.plasticBlue} roughness={0.3} />
          </mesh>

          {/* Upper layer containers */}
          <mesh position={[0, 0.54, 0]} castShadow>
            <boxGeometry args={[0.92, 0.32, 0.92]} />
            <meshStandardMaterial color="#1D4ED8" roughness={0.3} />
          </mesh>
        </group>
      )}

      {pallet.variant === 'wrapped' && (
        <group position={[0, 0.22, 0]}>
          {/* White shrink wrapped pallet load */}
          <mesh position={[0, 0.45, 0]} castShadow>
            <boxGeometry args={[0.96, 0.88, 0.96]} />
            <meshStandardMaterial
              color={SCENE_COLORS.shrinkWrap}
              roughness={0.2}
              transparent
              opacity={0.92}
            />
          </mesh>
          {/* Inner silhouette */}
          <mesh position={[0, 0.45, 0]}>
            <boxGeometry args={[0.88, 0.82, 0.88]} />
            <meshStandardMaterial color={SCENE_COLORS.cardboardBox} roughness={0.6} />
          </mesh>
        </group>
      )}

      {/* Floating Bobbing Blue Pin Marker */}
      <PinMarker position={[0, 1.4, 0]} label={pallet.id} />

      {/* Hover Tooltip */}
      {hovered && !isSelected && (
        <Html position={[0, 1.8, 0]} center distanceFactor={15}>
          <div className="px-2.5 py-1 bg-white/95 backdrop-blur-md border border-[#E6E9F5] shadow-lg rounded-lg text-xs font-bold text-[#141B34] whitespace-nowrap pointer-events-none transform -translate-y-2">
            <span className="text-[#2B59E0] mr-1">{pallet.id}</span>
            <span>{pallet.product}</span>
          </div>
        </Html>
      )}

      {/* Selection Highlight Brackets & Pill Label */}
      {isSelected && (
        <SelectionHighlight
          size={[1.2, 1.2, 1.2]}
          offset={[0, 0.6, 0]}
          label={`${pallet.id} ${pallet.product}`}
        />
      )}
    </group>
  );
};
