import React, { useEffect, useRef } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import * as THREE from 'three';
import { useStore } from '../../store/useStore';

export const CameraController: React.FC = () => {
  const { camera } = useThree();
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const { cameraCommand, cameraRotationAngle, activeSiteId, sites } = useStore();

  const currentTarget = useRef<THREE.Vector3>(new THREE.Vector3(0, 0, 0));
  const desiredTarget = useRef<THREE.Vector3>(new THREE.Vector3(0, 0, 0));
  const desiredPosition = useRef<THREE.Vector3>(new THREE.Vector3(28, 26, 28));

  // Initialize camera for active site
  useEffect(() => {
    const site = sites[activeSiteId];
    if (site) {
      desiredTarget.current.set(...site.cameraTarget);
      desiredPosition.current.set(...site.cameraPosition);
    }
  }, [activeSiteId, sites]);

  // Handle commands from store (selection, fly-to, reset)
  useEffect(() => {
    if (cameraCommand) {
      desiredTarget.current.set(...cameraCommand.target);
      if (cameraCommand.position) {
        desiredPosition.current.set(...cameraCommand.position);
      }
      if (cameraCommand.zoom && 'zoom' in camera) {
        // Orthographic camera zoom
        (camera as THREE.OrthographicCamera).zoom = 28 * cameraCommand.zoom;
        camera.updateProjectionMatrix();
      }
    }
  }, [cameraCommand, camera]);

  // Handle rotation angle delta
  useEffect(() => {
    if (controlsRef.current && cameraRotationAngle !== 0) {
      const angle = cameraRotationAngle;
      const pos = camera.position.clone();
      const target = controlsRef.current.target;
      const radius = Math.sqrt((pos.x - target.x) ** 2 + (pos.z - target.z) ** 2);
      pos.x = target.x + radius * Math.sin(angle);
      pos.z = target.z + radius * Math.cos(angle);
      desiredPosition.current.copy(pos);
    }
  }, [cameraRotationAngle, camera]);

  useFrame((_, delta) => {
    if (controlsRef.current) {
      // Smooth lerp camera target (easing ~400ms)
      const lerpSpeed = Math.min(1.0, delta * 6);
      currentTarget.current.lerp(desiredTarget.current, lerpSpeed);
      controlsRef.current.target.copy(currentTarget.current);

      // Smooth lerp camera position
      camera.position.lerp(desiredPosition.current, lerpSpeed);
      controlsRef.current.update();
    }
  });

  return null;
};
