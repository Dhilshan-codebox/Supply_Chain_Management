import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

interface SelectionHighlightProps {
  size?: [number, number, number];
  offset?: [number, number, number];
  label: string;
}

export const SelectionHighlight: React.FC<SelectionHighlightProps> = ({
  size = [2, 2, 2],
  offset = [0, 1, 0],
  label,
}) => {
  const [w, h, d] = size;
  const hw = w / 2;
  const hh = h / 2;
  const hd = d / 2;
  const armLen = Math.min(0.45, w * 0.28);
  const thickness = 0.055;

  const groupRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (groupRef.current) {
      // Gentle breathing pulse
      const s = 1 + Math.sin(clock.getElapsedTime() * 3.5) * 0.025;
      groupRef.current.scale.set(s, s, s);
    }
  });

  // Corner Bracket builder
  const renderBracket = (xSign: number, zSign: number) => {
    const x = xSign * hw;
    const z = zSign * hd;
    const y = -hh + 0.05;

    return (
      <group key={`${xSign}-${zSign}`} position={[x, y, z]}>
        {/* X arm */}
        <mesh position={[-xSign * (armLen / 2), 0, 0]}>
          <boxGeometry args={[armLen, thickness, thickness]} />
          <meshBasicMaterial color="#2B59E0" />
        </mesh>
        {/* Z arm */}
        <mesh position={[0, 0, -zSign * (armLen / 2)]}>
          <boxGeometry args={[thickness, thickness, armLen]} />
          <meshBasicMaterial color="#2B59E0" />
        </mesh>
        {/* Vertical upright */}
        <mesh position={[0, armLen / 2, 0]}>
          <boxGeometry args={[thickness, armLen, thickness]} />
          <meshBasicMaterial color="#2B59E0" />
        </mesh>
      </group>
    );
  };

  return (
    <group position={offset}>
      <group ref={groupRef}>
        {/* 4 Bottom Corners */}
        {renderBracket(-1, -1)}
        {renderBracket(1, -1)}
        {renderBracket(-1, 1)}
        {renderBracket(1, 1)}

        {/* Soft glowing selection ring on ground */}
        <mesh position={[0, -hh + 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[Math.max(hw, hd) * 0.9, Math.max(hw, hd) * 1.2, 36]} />
          <meshBasicMaterial color="#2B59E0" transparent opacity={0.3} side={THREE.DoubleSide} />
        </mesh>
      </group>

      {/* Frosted Glass Pill Label Above Object */}
      <Html position={[0, hh + 0.85, 0]} center distanceFactor={14}>
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-heavy glass-shine border border-white/90 text-[#141B34] text-xs font-black shadow-[0_8px_20px_rgba(43,89,224,0.35)] whitespace-nowrap animate-bounce-subtle pointer-events-none select-none backdrop-blur-md">
          <span className="w-2 h-2 rounded-full bg-[#2B59E0] shadow-[0_0_8px_rgba(43,89,224,0.8)] animate-pulse" />
          <span className="tracking-tight">{label}</span>
        </div>
      </Html>
    </group>
  );
};
