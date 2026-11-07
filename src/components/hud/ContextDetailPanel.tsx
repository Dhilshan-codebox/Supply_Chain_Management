import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../store/useStore';
import { Card } from '../ui/Card';
import { Chip } from '../ui/Chip';
import { StatTile } from '../ui/StatTile';
import { ProgressBar } from '../ui/ProgressBar';
import {
  X,
  Target,
  ExternalLink,
  Battery,
  Zap,
  MapPin,
  Box,
} from 'lucide-react';

export const ContextDetailPanel: React.FC = () => {
  const {
    sites,
    activeSiteId,
    selection,
    clearSelection,
    select,
  } = useStore();

  const site = sites[activeSiteId] || sites['WH-01'];
  const target = selection || { type: 'depot', id: site.id };

  const handleFocus = () => {
    select(target);
  };

  return (
    <aside className="absolute right-16 top-20 z-30 w-84 max-w-[calc(100vw-2rem)] pointer-events-none">
      <AnimatePresence mode="wait">
        <motion.div
          key={`${target.type}-${target.id}`}
          initial={{ opacity: 0, x: 24, scale: 0.98 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 24, scale: 0.98 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="pointer-events-auto"
        >
          <Card depth className="p-4 max-h-[calc(100vh-140px)] overflow-y-auto border border-white/80 shadow-2xl">
            {/* Header Actions */}
            <div className="flex items-center justify-between pb-2.5 border-b border-[#E6E9F5]/80 mb-3.5">
              <span className="text-[10px] font-black tracking-widest text-[#6B7390] uppercase flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#2B59E0] animate-pulse" />
                {target.type === 'depot'
                  ? `FACILITY • ${site.id}`
                  : target.type === 'forklift'
                  ? `FORKLIFT • ${site.id}`
                  : target.type === 'dock'
                  ? `DOCK BAY • ${site.id}`
                  : target.type === 'truck'
                  ? `CARRIER TRUCK • ${site.id}`
                  : `PALLET UNIT • ${site.id}`}
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handleFocus}
                  className="p-1.5 rounded-lg text-[#6B7390] hover:text-[#2B59E0] hover:bg-[#EDF2FE] transition-colors"
                  title="Focus Camera on Asset"
                >
                  <Target className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => window.open('#', '_blank')}
                  className="p-1.5 rounded-lg text-[#6B7390] hover:text-[#2B59E0] hover:bg-[#EDF2FE] transition-colors"
                  title="Open Full Logistics Report"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => clearSelection()}
                  className="p-1.5 rounded-lg text-[#6B7390] hover:text-[#E02424] hover:bg-[#FDE8E8] transition-colors"
                  title="Dismiss Context Panel"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* VARIANT A: DEPOT / DC (DEFAULT) */}
            {target.type === 'depot' && (
              <div className="space-y-3.5">
                <div>
                  <h2 className="text-base font-black text-[#141B34] tracking-tight">{site.name}</h2>
                  <p className="text-xs text-[#6B7390] flex items-center gap-1 mt-0.5 font-medium">
                    <MapPin className="w-3.5 h-3.5 shrink-0 text-[#2B59E0]" />
                    <span>{site.address}</span>
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Chip label={site.operationalStatus} variant="green" />
                  <span className="text-[11px] font-semibold text-[#6B7390]">
                    {site.statusSummary}
                  </span>
                </div>

                {/* 2x2 Stat Tiles */}
                <div className="grid grid-cols-2 gap-2">
                  <StatTile
                    label="Stock on hand"
                    value={site.stockOnHand.toLocaleString()}
                    subValue={`/ ${site.totalCapacity.toLocaleString()}`}
                    progress={(site.stockOnHand / site.totalCapacity) * 100}
                    progressVariant="blue"
                  />
                  <StatTile
                    label="Truck bays"
                    value={`${site.busyBaysCount} / ${site.baysCount}`}
                    subValue="docked"
                    progress={(site.busyBaysCount / site.baysCount) * 100}
                    progressVariant="green"
                  />
                  <StatTile
                    label="Outbound today"
                    value={site.outboundToday}
                    subValue="trucks"
                  />
                  <StatTile
                    label="Put-aways today"
                    value={site.putawaysToday}
                    subValue="pallets"
                  />
                </div>

                {/* Inventory List */}
                <div>
                  <div className="text-[11px] font-extrabold text-[#141B34] mb-2 flex items-center justify-between">
                    <span>Monitored Category Stock</span>
                    <span className="text-[10px] text-[#6B7390] font-semibold">4 items</span>
                  </div>
                  <div className="space-y-1.5">
                    {site.inventory.map((inv) => (
                      <div
                        key={inv.id}
                        className="p-2.5 rounded-xl glass-light flex items-center justify-between text-xs transition-all hover:bg-white/70"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-[#EDF2FE] text-[#2B59E0] flex items-center justify-center font-bold">
                            <Box className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <span className="font-bold text-[#141B34] block leading-tight">
                              {inv.name}
                            </span>
                            <span className="text-[10px] text-[#6B7390] font-medium">{inv.category}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-[#141B34]">{inv.count.toLocaleString()}</span>
                          <Chip
                            label={inv.status}
                            variant={inv.status === 'In Stock' ? 'green' : 'amber'}
                            showDot={false}
                            className="text-[10px] px-1.5 py-0"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Forklift Fleet Row */}
                {site.forklifts.length > 0 && (
                  <div className="p-3 glass-light rounded-xl border border-white/60">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="font-bold text-[#141B34]">Forklift Fleet Operations</span>
                      <span className="text-[11px] font-bold text-[#22A559]">Active</span>
                    </div>
                    <div className="text-[11px] text-[#6B7390] mb-2 font-medium">
                      {site.forklifts[0].statusText}
                    </div>
                    <ProgressBar value={site.forklifts[0].progress} variant="green" height="h-1.5" />
                  </div>
                )}
              </div>
            )}

            {/* VARIANT B: FORKLIFT */}
            {target.type === 'forklift' && (() => {
              const fl = site.forklifts.find((f) => f.id === target.id) || site.forklifts[0];
              if (!fl) return <div>No forklift data</div>;
              const chipVar = fl.status === 'Loading' ? 'green' : fl.status === 'Charging' ? 'amber' : 'grey';

              return (
                <div className="space-y-3.5">
                  <div>
                    <div className="flex items-center justify-between">
                      <h2 className="text-base font-black text-[#141B34] tracking-tight">{fl.id}</h2>
                      <Chip label={fl.status} variant={chipVar} />
                    </div>
                    <p className="text-xs text-[#6B7390] font-medium mt-0.5">{fl.driver} • {fl.model}</p>
                  </div>

                  <div className="p-3 glass-light rounded-xl border border-white/60">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="text-[#6B7390] flex items-center gap-1.5 font-bold">
                        <Battery className="w-4 h-4 text-[#22A559]" /> Battery Charge State
                      </span>
                      <span className="font-black text-[#141B34]">{fl.battery}%</span>
                    </div>
                    <ProgressBar
                      value={fl.battery}
                      variant={fl.battery > 40 ? 'green' : 'amber'}
                      height="h-2"
                    />
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between py-1.5 border-b border-[#F1F3F7]">
                      <span className="text-[#6B7390] font-medium">Status</span>
                      <span className="font-bold text-[#141B34]">{fl.statusText}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-[#F1F3F7]">
                      <span className="text-[#6B7390] font-medium">Carrying Payload</span>
                      <span className="font-bold text-[#2B59E0]">{fl.carrying}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-[#F1F3F7]">
                      <span className="text-[#6B7390] font-medium">Pallet Moves Today</span>
                      <span className="font-bold text-[#141B34]">{fl.movesToday} pallets</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-[#F1F3F7]">
                      <span className="text-[#6B7390] font-medium">Travel Speed</span>
                      <span className="font-bold text-[#141B34]">{fl.speed}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-[#F1F3F7]">
                      <span className="text-[#6B7390] font-medium">Assigned Charger</span>
                      <span className="font-bold text-[#141B34]">{fl.charger}</span>
                    </div>
                    <div className="flex justify-between py-1.5">
                      <span className="text-[#6B7390] font-medium">Operating Hub</span>
                      <span className="font-bold text-[#141B34]">{site.name}</span>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* VARIANT C: DOCK BAY */}
            {target.type === 'dock' && (() => {
              const dock = site.docks.find((d) => d.id === target.id) || site.docks[0];
              if (!dock) return <div>No dock bay data</div>;
              const chipVar = dock.status === 'Occupied' ? 'green' : dock.status === 'Booked' ? 'amber' : 'grey';

              return (
                <div className="space-y-3.5">
                  <div>
                    <div className="flex items-center justify-between">
                      <h2 className="text-base font-black text-[#141B34] tracking-tight">{dock.name}</h2>
                      <Chip label={dock.status} variant={chipVar} />
                    </div>
                    <p className="text-xs text-[#6B7390] font-medium mt-0.5">{dock.type}</p>
                  </div>

                  {dock.etaNote && (
                    <div className="p-3 glass-warning rounded-xl text-xs text-[#B8720A] font-bold flex items-center gap-2 border border-[#F5A524]/20 shadow-xs">
                      <Zap className="w-4 h-4 text-[#F5A524] shrink-0" />
                      <span>{dock.etaNote}</span>
                    </div>
                  )}

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between py-1.5 border-b border-[#F1F3F7]">
                      <span className="text-[#6B7390] font-medium">Assigned Truck</span>
                      <span className="font-bold text-[#2B59E0]">
                        {dock.currentTruckId ? `${dock.currentTruckId} (${dock.carrier})` : 'None'}
                      </span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-[#F1F3F7]">
                      <span className="text-[#6B7390] font-medium">Docking Status</span>
                      <span className="font-bold text-[#141B34]">{dock.progressText || 'Available'}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-[#F1F3F7]">
                      <span className="text-[#6B7390] font-medium">Safety Perimeter</span>
                      <span className="font-bold text-[#22A559]">Dock seal engaged</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-[#F1F3F7]">
                      <span className="text-[#6B7390] font-medium">Turnaround Today</span>
                      <span className="font-bold text-[#141B34]">{dock.trucksToday} trucks handled</span>
                    </div>
                    <div className="flex justify-between py-1.5">
                      <span className="text-[#6B7390] font-medium">Facility</span>
                      <span className="font-bold text-[#141B34]">{site.name}</span>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* VARIANT D: TRUCK */}
            {target.type === 'truck' && (() => {
              const trk = site.trucks.find((t) => t.id === target.id) || site.trucks[0];
              if (!trk) return <div>No truck data</div>;
              const chipVar = trk.status === 'Loading' ? 'green' : trk.status === 'En route' ? 'blue' : 'grey';

              return (
                <div className="space-y-3.5">
                  <div>
                    <div className="text-[10px] font-black uppercase text-[#2B59E0] tracking-widest">
                      {trk.carrier} LOGISTICS
                    </div>
                    <div className="flex items-center justify-between mt-0.5">
                      <h2 className="text-base font-black text-[#141B34] tracking-tight">{trk.id}</h2>
                      <Chip label={trk.status} variant={chipVar} />
                    </div>
                    <p className="text-xs text-[#6B7390] font-medium mt-0.5">{trk.driver} • {trk.licensePlate}</p>
                  </div>

                  {/* Route Progress */}
                  <div className="p-3 glass-accent rounded-xl border border-[#2B59E0]/20">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="font-black text-[#1E44B5]">To {trk.destination}</span>
                      <span className="text-[11px] font-extrabold text-[#2B59E0]">{trk.distanceLeft}</span>
                    </div>
                    <ProgressBar value={trk.progress} variant="blue" height="h-2" />
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between py-1.5 border-b border-[#F1F3F7]">
                      <span className="text-[#6B7390] font-medium">Active Shipment</span>
                      <button
                        type="button"
                        className="font-extrabold text-[#2B59E0] hover:underline"
                        onClick={() => {
                          const shp = site.shipments.find((s) => s.id === trk.shipmentId);
                          if (shp) select({ type: 'truck', id: trk.id });
                        }}
                      >
                        {trk.shipmentId}
                      </button>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-[#F1F3F7]">
                      <span className="text-[#6B7390] font-medium">Customer</span>
                      <span className="font-bold text-[#141B34]">{trk.customer}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-[#F1F3F7]">
                      <span className="text-[#6B7390] font-medium">Destination</span>
                      <span className="font-bold text-[#141B34]">{trk.destination}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-[#F1F3F7]">
                      <span className="text-[#6B7390] font-medium">Estimated Arrival</span>
                      <span className="font-black text-[#22A559]">{trk.eta}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-[#F1F3F7]">
                      <span className="text-[#6B7390] font-medium">Telemetry Speed</span>
                      <span className="font-bold text-[#141B34]">{trk.speed}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-[#F1F3F7]">
                      <span className="text-[#6B7390] font-medium">Bay Assignment</span>
                      <span className="font-bold text-[#141B34]">{trk.bayId}</span>
                    </div>
                    <div className="flex justify-between py-1.5">
                      <span className="text-[#6B7390] font-medium">Cargo Load</span>
                      <span className="font-bold text-[#141B34]">{trk.cargo}</span>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* VARIANT E: PALLET */}
            {target.type === 'pallet' && (() => {
              const pal = site.pallets.find((p) => p.id === target.id) || site.pallets[0];
              if (!pal) return <div>No pallet data</div>;

              return (
                <div className="space-y-3.5">
                  <div>
                    <div className="flex items-center justify-between">
                      <h2 className="text-base font-black text-[#141B34] tracking-tight">{pal.id}</h2>
                      <Chip label={pal.status} variant="blue" />
                    </div>
                    <p className="text-xs text-[#6B7390] font-medium mt-0.5">{pal.product}</p>
                  </div>

                  <div className="p-4 glass-light rounded-2xl text-center border border-white/60">
                    <span className="text-3xl font-black text-[#2B59E0] tracking-tight">{pal.quantity}</span>
                    <span className="text-xs text-[#6B7390] font-semibold block mt-1">Packaged Units on Pallet</span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between py-1.5 border-b border-[#F1F3F7]">
                      <span className="text-[#6B7390] font-medium">Current Location</span>
                      <span className="font-bold text-[#141B34]">{pal.location}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-[#F1F3F7]">
                      <span className="text-[#6B7390] font-medium">Packaging Variant</span>
                      <span className="font-bold text-[#141B34] capitalize">{pal.variant}</span>
                    </div>
                    <div className="flex justify-between py-1.5">
                      <span className="text-[#6B7390] font-medium">Warehouse Facility</span>
                      <span className="font-bold text-[#141B34]">{site.name}</span>
                    </div>
                  </div>
                </div>
              );
            })()}

          </Card>
        </motion.div>
      </AnimatePresence>
    </aside>
  );
};
