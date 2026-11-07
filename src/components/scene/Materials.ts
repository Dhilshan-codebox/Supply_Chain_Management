import * as THREE from 'three';

// Shared color palette for toy-diorama aesthetic
export const SCENE_COLORS = {
  ground: '#EEF1FB',
  road: '#3A4256',
  roadMarking: '#FFFFFF',
  dockApron: '#DDE3F0',
  bayLines: '#F5A524',
  warehouseWall: '#EDF1F7',
  warehouseWallDark: '#D8E0EC',
  warehouseRoof: '#2047B8',
  warehouseRoofAccent: '#2B59E0',
  warehouseDoorFrame: '#1E3A8A',
  warehouseDoorRoll: '#94A3B8',
  woodPallet: '#D4A373',
  cardboardBox: '#E6BA80',
  boxTape: '#C89658',
  plasticBlue: '#2563EB',
  shrinkWrap: '#F8FAFC',
  rackBlue: '#1D4ED8',
  rackOrange: '#EA580C',
  containerTeal: '#0D9488',
  forkliftYellow: '#FBBF24',
  forkliftBlack: '#1E293B',
  forkliftMast: '#64748B',
  driverSkin: '#FBCFE8',
  driverVest: '#F97316',
  driverHardhat: '#FACC15',
  truckWheel: '#1E293B',
  truckWheelRim: '#CBD5E1',
  treeFoliage: '#34D399',
  treeFoliageDark: '#10B981',
  treeTrunk: '#854D0E',
  cityBlock: '#D8DEEE',
  chargingWhite: '#FFFFFF',
  chargingGlow: '#22C55E',
  neonBlue: '#3B82F6',
  bracketHighlight: '#2B59E0',
};

// Procedural material helpers
export const createStandardMaterial = (color: string | number, roughness = 0.4, metalness = 0.1) => {
  return new THREE.MeshStandardMaterial({
    color,
    roughness,
    metalness,
  });
};
