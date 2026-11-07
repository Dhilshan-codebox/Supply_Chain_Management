import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SceneManager } from './components/scene/SceneManager';
import { TopBar } from './components/hud/TopBar';
import { KpiCards } from './components/hud/KpiCards';
import { MapControls } from './components/hud/MapControls';
import { ContextDetailPanel } from './components/hud/ContextDetailPanel';
import { ShipmentTracker } from './components/hud/ShipmentTracker';
import { OperationsTable } from './components/hud/OperationsTable';
import { MobileDetailSheet } from './components/hud/MobileDetailSheet';
import { useStore } from './store/useStore';
import { Boxes, Loader2 } from 'lucide-react';

export const App: React.FC = () => {
  const { tickSimulation, clearSelection } = useStore();
  const [loading, setLoading] = useState(true);

  // 1-second simulation tick loop
  useEffect(() => {
    const timer = setInterval(() => {
      tickSimulation();
    }, 1000);
    return () => clearInterval(timer);
  }, [tickSimulation]);

  // Initial loader state
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 450);
    return () => clearTimeout(t);
  }, []);

  // Global keyboard shortcuts (Escape to clear selection)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        clearSelection();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [clearSelection]);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-ambient-mesh font-sans select-none">
      {/* 3D FULL VIEWPORT SCENE */}
      <SceneManager />

      {/* FLOATING HUD (Cards pointer-events active, canvas interactive underneath) */}
      <div className="absolute inset-0 pointer-events-none flex flex-col justify-between overflow-hidden z-20">
        {/* Top Region */}
        <div className="relative">
          <TopBar />
          <KpiCards />
          <MapControls />
        </div>

        {/* Desktop Context Detail Panel (hidden on screens < 1280px) */}
        <div className="hidden xl:block">
          <ContextDetailPanel />
        </div>

        {/* Bottom Region */}
        <div className="flex flex-col md:flex-row items-end justify-between p-4 gap-4 pointer-events-none">
          <ShipmentTracker />
          <OperationsTable />
        </div>
      </div>

      {/* Responsive Bottom Sheet for screens < 1280px */}
      <MobileDetailSheet />

      {/* Initial loading screen with Realistic Frosted Glass */}
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45 }}
            className="absolute inset-0 bg-[#EEF1FB]/80 backdrop-blur-xl flex flex-col items-center justify-center z-50 pointer-events-auto"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="glass-heavy glass-shine glass-depth p-8 rounded-3xl flex flex-col items-center border border-white/90 shadow-2xl max-w-sm mx-4 text-center"
            >
              <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-[#2B59E0] to-[#1E3A8A] flex items-center justify-center text-white shadow-[0_8px_24px_rgba(43,89,224,0.45)] mb-5">
                <Boxes className="w-8 h-8 stroke-[2.2]" />
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-white flex items-center justify-center shadow-md">
                  <Loader2 className="w-4 h-4 text-[#2B59E0] animate-spin stroke-[2.5]" />
                </div>
              </div>
              <h2 className="text-xl font-black text-[#141B34] tracking-tight">
                WareTrack 3D
              </h2>
              <p className="text-xs font-semibold text-[#2B59E0] mt-1 uppercase tracking-wider">
                Smart Operations Command
              </p>
              <div className="w-48 h-1.5 bg-[#E2E7F5] rounded-full overflow-hidden mt-5 relative">
                <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#2B59E0] to-[#60A5FA] w-full animate-shimmer" />
              </div>
              <span className="text-[11px] text-[#6B7390] font-medium mt-3">
                Mounting isometric yard simulation...
              </span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;
