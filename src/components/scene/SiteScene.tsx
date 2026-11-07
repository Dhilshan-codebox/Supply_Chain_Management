import React from 'react';
import { useStore } from '../../store/useStore';
import { SCENE_COLORS } from './Materials';
import { Warehouse } from './Warehouse';
import { Truck } from './Truck';
import { Forklift } from './Forklift';
import { Pallet } from './Pallet';
import { Rack } from './Rack';
import { ShippingContainer } from './ShippingContainer';
import { Road } from './Road';
import { BayOutline } from './BayOutline';
import { Fence } from './Fence';
import { Tree } from './Tree';
import { CityBlock } from './CityBlock';
import { ChargingStation } from './ChargingStation';
import { RouteLine } from './RouteLine';

export const SiteScene: React.FC = () => {
  const { sites, activeSiteId, clearSelection } = useStore();
  const site = sites[activeSiteId] || sites['WH-01'];

  // RouteLine start & end depending on inbound truck
  const inboundTruck = site.trucks.find((t) => t.status === 'En route');

  return (
    <group onPointerMissed={() => clearSelection()}>
      {/* PALE LAVENDER GROUND (#EEF1FB) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[180, 180]} />
        <meshStandardMaterial color={SCENE_COLORS.ground} roughness={0.9} metalness={0.05} />
      </mesh>

      {/* ASPHALT ROADWAYS */}
      <Road position={[0, 0.01, 24]} length={70} width={7} rotation={[0, Math.PI / 2, 0]} />
      <Road position={[-16, 0.01, 16]} length={20} width={6} rotation={[0, 0, 0]} />

      {/* DOCK APRONS / PARKING BAYS */}
      {site.docks.map((dock) => (
        <BayOutline
          key={dock.id}
          position={[dock.position[0], 0.02, dock.position[2]]}
          width={4.2}
          length={9}
          label={dock.name}
        />
      ))}

      {/* WAREHOUSE MAIN COMPLEX */}
      {site.id === 'WH-01' && (
        <Warehouse
          position={[0, 0, -2]}
          width={22}
          depth={14}
          height={6.5}
          doorsCount={2}
          siteId="WH-01"
        />
      )}

      {site.id === 'WH-02' && (
        <Warehouse
          position={[0, 0, -2]}
          width={30}
          depth={16}
          height={7.5}
          doorsCount={4}
          siteId="WH-02"
        />
      )}

      {site.id === 'WH-04' && (
        <Warehouse
          position={[3, 0, -3]}
          width={38}
          depth={16}
          height={6.0}
          doorsCount={6}
          doorPrefix=""
          siteId="WH-04"
        />
      )}

      {/* PALLET RACKING SYSTEMS */}
      <Rack position={[-7, 0, -4]} length={6} levels={2} />
      <Rack position={[7, 0, -4]} length={6} levels={2} />

      {/* SHIPPING CONTAINERS */}
      <ShippingContainer position={[15, 0, 8]} color={SCENE_COLORS.containerTeal} />
      <ShippingContainer position={[15, 0, 15]} color="#0284C7" />
      <ShippingContainer position={[15, 2.5, 8]} color="#EA580C" />

      {/* CHARGING STATION STANCHIONS */}
      <ChargingStation position={[site.id === 'WH-04' ? -10 : 12, 0, -3]} unitsCount={2} />

      {/* DYNAMIC PALLETS */}
      {site.pallets.map((pallet) => (
        <Pallet key={pallet.id} pallet={pallet} />
      ))}

      {/* DYNAMIC TRUCKS */}
      {site.trucks.map((truck) => (
        <Truck key={truck.id} truck={truck} />
      ))}

      {/* DYNAMIC FORKLIFTS */}
      {site.forklifts.map((forklift) => (
        <Forklift key={forklift.id} forklift={forklift} />
      ))}

      {/* INBOUND TRUCK GLOWING ROUTE LINE */}
      {inboundTruck && (
        <RouteLine
          start={[-18, 0.05, 24]}
          end={[inboundTruck.targetDockPosition[0], 0.05, inboundTruck.targetDockPosition[2] + 4]}
          visible={inboundTruck.status === 'En route'}
        />
      )}

      {/* PERIMETER SECURITY FENCES */}
      <Fence position={[0, 0, 32]} length={64} rotation={[0, 0, 0]} />
      <Fence position={[-28, 0, 10]} length={44} rotation={[0, Math.PI / 2, 0]} />
      <Fence position={[28, 0, 10]} length={44} rotation={[0, Math.PI / 2, 0]} />

      {/* STYLIZED ROUND TREES */}
      <Tree position={[-24, 0, 6]} scale={1.2} />
      <Tree position={[-25, 0, 14]} scale={0.9} />
      <Tree position={[-23, 0, 22]} scale={1.1} />
      <Tree position={[24, 0, 6]} scale={1.0} />
      <Tree position={[25, 0, 22]} scale={1.3} />
      <Tree position={[22, 0, 28]} scale={0.9} />

      {/* DISTANT FADED CITY BLOCKS */}
      <CityBlock position={[-42, 0, -28]} width={16} height={20} depth={16} />
      <CityBlock position={[-20, 0, -36]} width={22} height={26} depth={18} />
      <CityBlock position={[12, 0, -38]} width={28} height={22} depth={20} />
      <CityBlock position={[40, 0, -25]} width={18} height={18} depth={18} />
      <CityBlock position={[-44, 0, 15]} width={16} height={14} depth={16} />
      <CityBlock position={[45, 0, 15]} width={16} height={16} depth={16} />
    </group>
  );
};
