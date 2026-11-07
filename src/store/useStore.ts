import { create } from 'zustand';
import { SelectionTarget, SiteData } from '../types';
import { INITIAL_SITES } from '../data/sites';

interface CameraCommand {
  target: [number, number, number];
  position?: [number, number, number];
  zoom?: number;
  timestamp: number;
}

interface WareTrackStore {
  sites: Record<string, SiteData>;
  activeSiteId: string;
  selection: SelectionTarget | null;
  activeTableTab: 'docks' | 'forklifts' | 'trucks';
  searchQuery: string;
  isSearchOpen: boolean;
  clockTime: string;
  clockSeconds: number;
  cameraCommand: CameraCommand | null;
  cameraRotationAngle: number;
  isSheetOpen: boolean; // For mobile responsive sheet

  // Actions
  selectSite: (siteId: string) => void;
  select: (target: SelectionTarget | null) => void;
  clearSelection: () => void;
  setActiveTableTab: (tab: 'docks' | 'forklifts' | 'trucks') => void;
  setSearchQuery: (query: string) => void;
  setSearchOpen: (open: boolean) => void;
  setIsSheetOpen: (open: boolean) => void;
  flyCameraTo: (target: [number, number, number], position?: [number, number, number], zoom?: number) => void;
  resetCamera: () => void;
  rotateCamera: (deltaAngle: number) => void;
  zoomCamera: (deltaZoom: number) => void;
  tickSimulation: () => void;
}

export const useStore = create<WareTrackStore>((set, get) => ({
  sites: INITIAL_SITES,
  activeSiteId: 'WH-01',
  selection: { type: 'depot', id: 'WH-01' },
  activeTableTab: 'docks',
  searchQuery: '',
  isSearchOpen: false,
  clockTime: '09:40',
  clockSeconds: 9 * 3600 + 40 * 60,
  cameraCommand: null,
  cameraRotationAngle: 0,
  isSheetOpen: false,

  selectSite: (siteId: string) => {
    const site = get().sites[siteId];
    if (!site) return;
    set({
      activeSiteId: siteId,
      selection: { type: 'depot', id: siteId },
      cameraCommand: {
        target: site.cameraTarget,
        position: site.cameraPosition,
        timestamp: Date.now(),
      },
    });
  },

  select: (target: SelectionTarget | null) => {
    set({ selection: target, isSheetOpen: !!target });
    if (!target) return;

    const { sites, activeSiteId } = get();
    const site = sites[activeSiteId];
    if (!site) return;

    let targetCoord: [number, number, number] | null = null;
    if (target.type === 'depot') {
      targetCoord = [0, 0, 0];
    } else if (target.type === 'truck') {
      const trk = site.trucks.find((t) => t.id === target.id);
      if (trk) targetCoord = trk.position;
    } else if (target.type === 'forklift') {
      const fl = site.forklifts.find((f) => f.id === target.id);
      if (fl) targetCoord = fl.position;
    } else if (target.type === 'dock') {
      const dock = site.docks.find((d) => d.id === target.id);
      if (dock) targetCoord = dock.position;
    } else if (target.type === 'pallet') {
      const pal = site.pallets.find((p) => p.id === target.id);
      if (pal) targetCoord = pal.position;
    }

    if (targetCoord) {
      set({
        cameraCommand: {
          target: targetCoord,
          position: [targetCoord[0] + 16, targetCoord[1] + 18, targetCoord[2] + 16],
          zoom: 1.2,
          timestamp: Date.now(),
        },
      });
    }
  },

  clearSelection: () => {
    set({ selection: null, isSheetOpen: false });
  },

  setActiveTableTab: (tab) => set({ activeTableTab: tab }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setSearchOpen: (open) => set({ isSearchOpen: open }),
  setIsSheetOpen: (open) => set({ isSheetOpen: open }),

  flyCameraTo: (target, position, zoom) => {
    set({
      cameraCommand: {
        target,
        position,
        zoom,
        timestamp: Date.now(),
      },
    });
  },

  resetCamera: () => {
    const { sites, activeSiteId } = get();
    const site = sites[activeSiteId];
    if (site) {
      set({
        cameraCommand: {
          target: site.cameraTarget,
          position: site.cameraPosition,
          zoom: 1.0,
          timestamp: Date.now(),
        },
        cameraRotationAngle: 0,
      });
    }
  },

  rotateCamera: (deltaAngle: number) => {
    set((state) => ({ cameraRotationAngle: state.cameraRotationAngle + deltaAngle }));
  },

  zoomCamera: (deltaZoom: number) => {
    const current = get().cameraCommand;
    const currentZoom = current?.zoom ?? 1.0;
    const newZoom = Math.max(0.6, Math.min(2.5, currentZoom + deltaZoom));
    set({
      cameraCommand: {
        target: current?.target ?? [0, 0, 0],
        position: current?.position,
        zoom: newZoom,
        timestamp: Date.now(),
      },
    });
  },

  tickSimulation: () => {
    set((state) => {
      const newSeconds = state.clockSeconds + 1;
      const hours = Math.floor((newSeconds / 3600) % 24)
        .toString()
        .padStart(2, '0');
      const minutes = Math.floor((newSeconds % 3600) / 60)
        .toString()
        .padStart(2, '0');
      const clockTime = `${hours}:${minutes}`;

      // Update active site simulation
      const currentSite = state.sites[state.activeSiteId];
      if (!currentSite) {
        return { clockSeconds: newSeconds, clockTime };
      }

      // Clone site objects to mutate safely
      const updatedTrucks = currentSite.trucks.map((truck) => {
        let pathProgress = truck.pathProgress;
        let progress = truck.progress;
        let status = truck.status;
        let distanceLeft = truck.distanceLeft;
        let eta = truck.eta;
        let position = [...truck.position] as [number, number, number];

        if (status === 'En route') {
          pathProgress = Math.min(1.0, pathProgress + 0.015);
          // Interpolate position towards targetDockPosition
          const startX = -18;
          const startZ = 22;
          position[0] = startX + (truck.targetDockPosition[0] - startX) * pathProgress;
          position[2] = startZ + (truck.targetDockPosition[2] - startZ) * pathProgress;

          if (pathProgress >= 0.99) {
            status = 'Docked';
            distanceLeft = 'At Bay';
            eta = 'Docked';
            progress = 0;
          } else {
            const meters = Math.max(10, Math.round((1.0 - pathProgress) * 600));
            distanceLeft = `${meters} m left`;
            eta = `${Math.ceil((1.0 - pathProgress) * 3)} min`;
          }
        } else if (status === 'Docked' || status === 'Loading') {
          progress = Math.min(100, progress + 0.8);
          if (progress >= 100) {
            status = 'Departed';
            eta = 'Departed';
          } else {
            status = 'Loading';
            const total = 6;
            const current = Math.min(total, Math.floor((progress / 100) * total) + 1);
            truck.progressText = `Loading ${current}/${total}`;
            const mins = Math.max(1, Math.round((100 - progress) * 0.2));
            truck.distanceLeft = `Bay occupied`;
            eta = `${mins} min left`;
          }
        } else if (status === 'Unloading') {
          progress = Math.min(100, progress + 0.9);
          const total = 5;
          const current = Math.min(total, Math.floor((progress / 100) * total) + 1);
          truck.progressText = `Unloading ${current}/${total}`;
          const mins = Math.max(1, Math.round((100 - progress) * 0.15));
          eta = `${mins} min left`;
        }

        return {
          ...truck,
          pathProgress,
          progress,
          status,
          distanceLeft,
          eta,
          position,
        };
      });

      // Update forklifts: shuttle between dock and staging, drain/charge battery
      const updatedForklifts = currentSite.forklifts.map((fl) => {
        let battery = fl.battery;
        let moves = fl.movesToday;
        let progress = fl.progress;
        let position = [...fl.position] as [number, number, number];

        if (fl.status === 'Loading' || fl.status === 'Unloading') {
          battery = Math.max(15, +(battery - 0.05).toFixed(1));
          progress = (progress + 1.2) % 100;
          if (progress < 1.2) moves += 1;

          // Shuttle position back and forth between staging and dock
          const t = Math.sin(newSeconds * 0.8) * 0.5 + 0.5;
          const target = fl.targetPosition || fl.position;
          position[0] = fl.position[0] + (target[0] - fl.position[0]) * t;
          position[2] = fl.position[2] + (target[2] - fl.position[2]) * t;
        } else if (fl.status === 'Charging') {
          battery = Math.min(100, +(battery + 0.1).toFixed(1));
          progress = battery;
        }

        return {
          ...fl,
          battery,
          movesToday: moves,
          progress,
          position,
        };
      });

      // Update shipments
      const updatedShipments = currentSite.shipments.map((shp) => {
        let minutesLeft = Math.max(0, shp.minutesLeft - (newSeconds % 60 === 0 ? 1 : 0));
        return {
          ...shp,
          minutesLeft,
        };
      });

      // Update site KPIs slightly for lively realism
      const stockOnHand = currentSite.stockOnHand + (newSeconds % 15 === 0 ? 1 : 0);
      const updatedSite = {
        ...currentSite,
        stockOnHand,
        trucks: updatedTrucks,
        forklifts: updatedForklifts,
        shipments: updatedShipments,
      };

      return {
        clockSeconds: newSeconds,
        clockTime,
        sites: {
          ...state.sites,
          [state.activeSiteId]: updatedSite,
        },
      };
    });
  },
}));
