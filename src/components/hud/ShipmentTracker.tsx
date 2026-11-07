import React from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../../store/useStore';
import { Card } from '../ui/Card';
import { Chip } from '../ui/Chip';
import { Truck as TruckIcon, Check, ChevronRight } from 'lucide-react';

export const ShipmentTracker: React.FC = () => {
  const { sites, activeSiteId, selection, select } = useStore();
  const site = sites[activeSiteId] || sites['WH-01'];

  // Identify active shipment: if truck selected, find that truck's shipment; else first shipment
  let currentTruck = site.trucks[0];
  if (selection?.type === 'truck') {
    const matched = site.trucks.find((t) => t.id === selection.id);
    if (matched) currentTruck = matched;
  }

  const shipment = site.shipments.find((s) => s.truckId === currentTruck?.id) || site.shipments[0];

  if (!shipment || !currentTruck) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="max-w-2xl w-full md:w-[620px] pointer-events-none"
    >
      <Card depth className="p-4 pointer-events-auto border border-white/80 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-2.5 border-b border-[#E6E9F5]/80 mb-3.5">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-[#EDF2FE] text-[#2B59E0] flex items-center justify-center font-bold">
              <TruckIcon className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-black text-[#141B34] tracking-tight">
              Live Logistics Shipment Tracking
            </span>
          </div>
          <span className="text-xs font-black text-[#2B59E0] px-2 py-0.5 rounded-lg bg-[#EDF2FE] border border-[#BFD5FD]/50">
            {currentTruck.id} • {currentTruck.carrier}
          </span>
        </div>

        {/* Stepper & Right Mini Sub-Card */}
        <div className="flex flex-col lg:flex-row items-center gap-4">
          
          {/* Horizontal Stepper */}
          <div className="flex-1 w-full">
            <div className="relative flex items-center justify-between px-2">
              
              {/* Connecting Background Line */}
              <div className="absolute left-6 right-6 top-3.5 h-[2.5px] bg-[#E1E5F2] rounded-full -z-0" />
              
              {/* Active Progress Highlight Line */}
              <div
                className="absolute left-6 top-3.5 h-[2.5px] bg-gradient-to-r from-[#2B59E0] to-[#60A5FA] rounded-full -z-0 shadow-[0_0_8px_rgba(43,89,224,0.5)] transition-all duration-500"
                style={{
                  width: `${(shipment.currentStepIndex / (shipment.steps.length - 1)) * 88}%`,
                }}
              />

              {shipment.steps.map((step) => {
                const isCompleted = step.completed;
                const isActive = step.active;

                return (
                  <div key={step.id} className="relative z-10 flex flex-col items-center group">
                    {/* Node Circle */}
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300 ${
                        isCompleted
                          ? 'bg-[#2B59E0] text-white shadow-[0_2px_8px_rgba(43,89,224,0.4)] ring-2 ring-white'
                          : isActive
                          ? 'bg-white border-2 border-[#2B59E0] ring-4 ring-[#2B59E0]/20 text-[#2B59E0] shadow-[0_0_12px_rgba(43,89,224,0.35)]'
                          : 'bg-[#F1F3F7] border-2 border-[#D5DBE5] text-[#8E97B0]'
                      }`}
                    >
                      {isCompleted ? (
                        <Check className="w-3.5 h-3.5 stroke-[2.8]" />
                      ) : (
                        <span className="text-[10px] font-black">{step.id}</span>
                      )}
                    </div>

                    {/* Step Label & Time */}
                    <div className="mt-1.5 text-center">
                      <span
                        className={`text-[11px] font-bold block leading-tight ${
                          isActive ? 'text-[#2B59E0]' : isCompleted ? 'text-[#141B34]' : 'text-[#8E97B0]'
                        }`}
                      >
                        {step.name}
                      </span>
                      <span className="text-[10px] text-[#6B7390] font-medium block mt-0.5">
                        {step.timestamp}
                      </span>
                    </div>
                  </div>
                );
              })}

            </div>
          </div>

          {/* Right Sub-Card */}
          <div
            onClick={() => select({ type: 'truck', id: currentTruck.id })}
            className="w-full lg:w-48 p-2.5 glass-light glass-interactive rounded-xl flex items-center justify-between cursor-pointer shrink-0 border border-white/70 shadow-xs"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#2B59E0] to-[#1E3A8A] flex items-center justify-center text-white font-black text-xs shadow-xs">
                TRK
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-black text-[#141B34]">{shipment.id}</span>
                  <Chip
                    label={shipment.status}
                    variant={shipment.status === 'Loading' ? 'green' : 'blue'}
                    showDot={false}
                    className="text-[9px] px-1 py-0"
                  />
                </div>
                <div className="text-[10px] text-[#6B7390] font-medium leading-tight">
                  To: {shipment.destination}
                </div>
                <div className="text-[9px] text-[#2B59E0] font-bold mt-0.5">
                  {currentTruck.bayId} • {currentTruck.eta}
                </div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#8E97B0] group-hover:translate-x-0.5 transition-transform" />
          </div>

        </div>

      </Card>
    </motion.div>
  );
};
