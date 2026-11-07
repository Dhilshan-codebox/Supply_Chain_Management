import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../store/useStore';
import { Card } from '../ui/Card';
import { Chip, ChipVariant } from '../ui/Chip';
import { SegmentedTabs } from '../ui/SegmentedTabs';
import { ProgressBar } from '../ui/ProgressBar';
import { Anchor, ChevronRight, Activity } from 'lucide-react';

export const OperationsTable: React.FC = () => {
  const {
    sites,
    activeSiteId,
    activeTableTab,
    setActiveTableTab,
    selection,
    select,
  } = useStore();

  const site = sites[activeSiteId] || sites['WH-01'];

  const tabs = [
    { id: 'docks' as const, label: 'Docks', count: `${site.busyBaysCount}/${site.baysCount}` },
    { id: 'forklifts' as const, label: 'Forklifts', count: `${site.forklifts.length}` },
    { id: 'trucks' as const, label: 'Trucks', count: `${site.trucks.length}` },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
      className="w-full md:w-[410px] pointer-events-none"
    >
      <Card depth className="p-3.5 pointer-events-auto border border-white/80 shadow-2xl">
        {/* Header Tabs */}
        <div className="flex items-center justify-between pb-2.5 border-b border-[#E6E9F5]/80 mb-2.5">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-[#EDF2FE] text-[#2B59E0] flex items-center justify-center">
              <Activity className="w-3.5 h-3.5" />
            </div>
            <SegmentedTabs
              tabs={tabs}
              activeTab={activeTableTab}
              onChange={setActiveTableTab}
            />
          </div>
          <span className="text-[10px] font-black text-[#6B7390] uppercase tracking-wider hidden sm:inline px-2 py-0.5 rounded-md bg-white/60 border border-white/80">
            {site.id}
          </span>
        </div>

        {/* Content Rows */}
        <div className="space-y-1.5 max-h-56 overflow-y-auto pr-0.5">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTableTab}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
              className="space-y-1.5"
            >
              {/* TAB 1: DOCKS */}
              {activeTableTab === 'docks' &&
                site.docks.map((dock) => {
                  const isSelected = selection?.type === 'dock' && selection.id === dock.id;
                  const chipVariant: ChipVariant =
                    dock.status === 'Occupied' ? 'green' : dock.status === 'Booked' ? 'amber' : 'grey';

                  return (
                    <div
                      key={dock.id}
                      onClick={() => select({ type: 'dock', id: dock.id })}
                      className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all duration-200 group ${
                        isSelected
                          ? 'bg-gradient-to-r from-[#EDF2FE] to-white/90 border-[#2B59E0] shadow-[0_4px_12px_rgba(43,89,224,0.15)] ring-1 ring-[#2B59E0]/40'
                          : 'bg-white/45 hover:bg-white/75 border-white/60 hover:border-[#BFD5FD] hover:-translate-y-0.5 shadow-xs'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className={`text-xs font-black shrink-0 transition-colors ${
                          isSelected ? 'text-[#2B59E0]' : 'text-[#141B34] group-hover:text-[#2B59E0]'
                        }`}>
                          {dock.name}
                        </span>
                        <div className="truncate">
                          <span className="text-xs text-[#6B7390] font-medium block truncate">
                            {dock.currentTruckId
                              ? `${dock.currentTruckId} • ${dock.carrier || ''}`
                              : 'No truck assigned'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <Chip label={dock.status} variant={chipVariant} className="text-[10px] px-1.5 py-0" />
                        <ChevronRight className="w-3.5 h-3.5 text-[#8E97B0] group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </div>
                  );
                })}

              {/* TAB 2: FORKLIFTS */}
              {activeTableTab === 'forklifts' &&
                site.forklifts.map((fl) => {
                  const isSelected = selection?.type === 'forklift' && selection.id === fl.id;
                  const chipVariant: ChipVariant =
                    fl.status === 'Loading' ? 'green' : fl.status === 'Charging' ? 'amber' : 'grey';

                  return (
                    <div
                      key={fl.id}
                      onClick={() => select({ type: 'forklift', id: fl.id })}
                      className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all duration-200 group ${
                        isSelected
                          ? 'bg-gradient-to-r from-[#EDF2FE] to-white/90 border-[#2B59E0] shadow-[0_4px_12px_rgba(43,89,224,0.15)] ring-1 ring-[#2B59E0]/40'
                          : 'bg-white/45 hover:bg-white/75 border-white/60 hover:border-[#BFD5FD] hover:-translate-y-0.5 shadow-xs'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <span className={`text-xs font-black shrink-0 transition-colors ${
                          isSelected ? 'text-[#2B59E0]' : 'text-[#141B34] group-hover:text-[#2B59E0]'
                        }`}>
                          {fl.id}
                        </span>
                        <div className="min-w-0 flex-1 pr-2">
                          <span className="text-xs text-[#6B7390] font-medium block truncate">{fl.statusText}</span>
                          <div className="mt-1">
                            <ProgressBar
                              value={fl.progress}
                              variant={fl.status === 'Charging' ? 'amber' : 'green'}
                              height="h-1.5"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <Chip label={fl.status} variant={chipVariant} className="text-[10px] px-1.5 py-0" />
                        <ChevronRight className="w-3.5 h-3.5 text-[#8E97B0] group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </div>
                  );
                })}

              {/* TAB 3: TRUCKS */}
              {activeTableTab === 'trucks' &&
                site.trucks.map((truck) => {
                  const isSelected = selection?.type === 'truck' && selection.id === truck.id;
                  const chipVariant: ChipVariant =
                    truck.status === 'Loading' ? 'green' : truck.status === 'En route' ? 'blue' : 'grey';

                  return (
                    <div
                      key={truck.id}
                      onClick={() => select({ type: 'truck', id: truck.id })}
                      className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all duration-200 group ${
                        isSelected
                          ? 'bg-gradient-to-r from-[#EDF2FE] to-white/90 border-[#2B59E0] shadow-[0_4px_12px_rgba(43,89,224,0.15)] ring-1 ring-[#2B59E0]/40'
                          : 'bg-white/45 hover:bg-white/75 border-white/60 hover:border-[#BFD5FD] hover:-translate-y-0.5 shadow-xs'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <span className={`text-xs font-black shrink-0 transition-colors ${
                          isSelected ? 'text-[#2B59E0]' : 'text-[#141B34] group-hover:text-[#2B59E0]'
                        }`}>
                          {truck.id}
                        </span>
                        <div className="min-w-0 flex-1 pr-2">
                          <span className="text-xs text-[#6B7390] font-medium block truncate">
                            {truck.carrier} • {truck.bayId} • {truck.progressText || truck.destination}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <Chip label={truck.status} variant={chipVariant} className="text-[10px] px-1.5 py-0" />
                        <ChevronRight className="w-3.5 h-3.5 text-[#8E97B0] group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </div>
                  );
                })}
            </motion.div>
          </AnimatePresence>
        </div>
      </Card>
    </motion.div>
  );
};
