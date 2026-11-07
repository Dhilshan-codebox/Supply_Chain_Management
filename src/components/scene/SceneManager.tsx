import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, OrthographicCamera } from '@react-three/drei';
import { SiteScene } from './SiteScene';
import { CameraController } from './CameraController';
import { SCENE_COLORS } from './Materials';

export const SceneManager: React.FC = () => {
  return (
    <div className="absolute inset-0 w-full h-full bg-[#EEF1FB] overflow-hidden">
      <Canvas
        shadows
        gl={{
          antialias: true,
          powerPreference: 'high-performance',
        }}
        dpr={[1, 2]}
      >
        {/* Orthographic Isometric Camera */}
        <OrthographicCamera
          makeDefault
          position={[28, 26, 28]}
          zoom={28}
          near={-50}
          far={250}
        />

        {/* Orbit Controls (pan with drag, zoom with scroll, isometric tilt 35-55 deg) */}
        <OrbitControls
          makeDefault
          enableDamping
          dampingFactor={0.08}
          minPolarAngle={Math.PI * 0.22} // ~40 degrees
          maxPolarAngle={Math.PI * 0.36} // ~65 degrees
          minZoom={14}
          maxZoom={60}
          target={[0, 0, 0]}
        />

        {/* Dynamic camera lerp & flying controller */}
        <CameraController />

        {/* Diorama Ambient Lighting */}
        <ambientLight intensity={0.85} color="#FFFFFF" />

        {/* Sun Directional Light with Crisp Shadows */}
        <directionalLight
          position={[38, 48, 28]}
          intensity={1.35}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-near={0.5}
          shadow-camera-far={140}
          shadow-camera-left={-40}
          shadow-camera-right={40}
          shadow-camera-top={40}
          shadow-camera-bottom={-40}
          shadow-bias={-0.0003}
        />

        {/* Soft Secondary Fill Light */}
        <directionalLight
          position={[-30, 25, -20]}
          intensity={0.4}
          color="#DBEAFE"
        />

        {/* Subtle Sky/Ground Fill Light */}
        <hemisphereLight
          args={['#FFFFFF', '#C7D2FE', 0.45]}
          position={[0, 50, 0]}
        />

        {/* Pale Lavender Atmosphere Fog */}
        <fog attach="fog" args={[SCENE_COLORS.ground, 50, 130]} />

        {/* 3D Site Scene */}
        <Suspense fallback={null}>
          <SiteScene />
        </Suspense>
      </Canvas>
    </div>
  );
};
