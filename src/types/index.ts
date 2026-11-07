export type SelectionType = 'depot' | 'forklift' | 'dock' | 'truck' | 'pallet';

export interface SelectionTarget {
  type: SelectionType;
  id: string;
}

export type CarrierBrand = 'Bluepeak' | 'Nordline' | 'Cargoviva' | 'WareTrack';

export interface InventoryItem {
  id: string;
  name: string;
  count: number;
  status: 'In Stock' | 'Low Stock';
  category: string;
}

export interface DockBay {
  id: string;
  name: string;
  siteId: string;
  type: string;
  status: 'Occupied' | 'Available' | 'Booked' | 'Maintenance';
  currentTruckId?: string;
  carrier?: CarrierBrand;
  progressText?: string;
  trucksToday: number;
  etaNote?: string;
  position: [number, number, number];
}

export interface Forklift {
  id: string;
  siteId: string;
  driver: string;
  model: string;
  status: 'Loading' | 'Unloading' | 'Charging' | 'Idle';
  statusText: string;
  targetTruckId?: string;
  targetBayId?: string;
  carrying: string;
  battery: number;
  movesToday: number;
  speed: string;
  charger: string;
  progress: number;
  position: [number, number, number];
  targetPosition?: [number, number, number];
  rotation?: number;
}

export interface Truck {
  id: string;
  siteId: string;
  carrier: CarrierBrand;
  driver: string;
  licensePlate: string;
  shipmentId: string;
  customer: string;
  destination: string;
  eta: string;
  distanceLeft: string;
  speed: string;
  bayId: string;
  cargo: string;
  status: 'Docked' | 'Loading' | 'Unloading' | 'En route' | 'Departed';
  progress: number;
  progressText?: string;
  pathProgress: number; // 0.0 -> 1.0 along route
  position: [number, number, number];
  targetDockPosition: [number, number, number];
  color: string;
}

export interface PalletItem {
  id: string;
  siteId: string;
  product: string;
  quantity: number;
  location: string;
  status: 'Staged' | 'In Rack' | 'In Transit' | 'Loaded';
  variant: 'boxes' | 'plastic' | 'wrapped';
  position: [number, number, number];
}

export interface ShipmentStep {
  id: number;
  name: string;
  timestamp: string;
  completed: boolean;
  active: boolean;
  subtext?: string;
}

export interface Shipment {
  id: string;
  truckId: string;
  siteId: string;
  destination: string;
  eta: string;
  bay: string;
  minutesLeft: number;
  status: 'Loading' | 'Unloading' | 'En route' | 'Delivered';
  steps: ShipmentStep[];
  currentStepIndex: number;
}

export interface SiteData {
  id: string;
  name: string;
  address: string;
  fullnessPercent: number;
  stockOnHand: number;
  totalCapacity: number;
  stockDelta: number;
  trucksOnSite: number;
  trucksDelta: number;
  trucksInbound: number;
  onTimeRate: number;
  onTimeDelta: number;
  baysCount: number;
  busyBaysCount: number;
  outboundToday: number;
  putawaysToday: number;
  operationalStatus: 'Operational' | 'Degraded' | 'High Traffic';
  statusSummary: string;
  cameraPosition: [number, number, number];
  cameraTarget: [number, number, number];
  inventory: InventoryItem[];
  docks: DockBay[];
  forklifts: Forklift[];
  trucks: Truck[];
  pallets: PalletItem[];
  shipments: Shipment[];
}
