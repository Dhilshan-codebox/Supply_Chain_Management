import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Line } from '@react-three/drei';
import * as THREE from 'three';

interface RouteLineProps {
  start: [number, number, number];
  end: [number, number, number];
  visible?: boolean;
}

export const RouteLine: React.FC<RouteLineProps> = ({
  start = [-18, 0.05, 24],
  end = [-6, 0.05, 8],
  visible = true,
}) => {
  if (!visible) return null;

  const lineRef = useRef<any>(null);
  const haloRef = useRef<THREE.Mesh>(null);

  const midPoint: [number, number, number] = [
    start[0] * 0.4 + end[0] * 0.6,
    0.05,
    start[2] * 0.6 + end[2] * 0.4,
  ];

  const curve = new THREE.QuadraticBezierCurve3(
    new THREE.Vector3(...start),
    new THREE.Vector3(...midPoint),
    new THREE.Vector3(...end)
  );

  const points = curve.getPoints(28);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (lineRef.current?.material) {
      lineRef.current.material.dashOffset = -t * 2.5;
    }
    if (haloRef.current) {
      const s = 1 + Math.sin(t * 4) * 0.12;
      haloRef.current.scale.set(s, s, s);
    }
  });

  return (
    <group>
      {/* Animated Glowing Laser Route Line */}
      <Line
        ref={lineRef}
        points={points}
        color="#3B82F6"
        lineWidth={3.5}
        dashed
        dashScale={2}
        dashSize={1}
        gapSize={0.6}
      />

      {/* Pulsing Target Arrival Dock Halo */}
      <mesh ref={haloRef} position={[end[0], 0.04, end[2]]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.8, 1.25, 32]} />
        <meshBasicMaterial color="#3B82F6" transparent opacity={0.45} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
};
