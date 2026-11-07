import React from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../../store/useStore';
import { Plus, Minus, RotateCcw, RotateCw, Home } from 'lucide-react';

export const MapControls: React.FC = () => {
  const { zoomCamera, rotateCamera, resetCamera } = useStore();

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
      className="absolute right-4 top-20 z-30 flex flex-col items-center glass-heavy glass-shine glass-depth rounded-2xl p-1.5 gap-1 pointer-events-auto border border-white/80"
    >
      {/* Zoom In */}
      <button
        type="button"
        onClick={() => zoomCamera(0.2)}
        className="w-9 h-9 rounded-xl flex items-center justify-center text-[#556080] hover:text-[#2B59E0] hover:bg-gradient-to-br hover:from-white/90 hover:to-[#EDF2FE]/90 hover:shadow-xs active:scale-95 transition-all"
        title="Zoom In (+)"
      >
        <Plus className="w-4 h-4 stroke-[2.2]" />
      </button>

      {/* Zoom Out */}
      <button
        type="button"
        onClick={() => zoomCamera(-0.2)}
        className="w-9 h-9 rounded-xl flex items-center justify-center text-[#556080] hover:text-[#2B59E0] hover:bg-gradient-to-br hover:from-white/90 hover:to-[#EDF2FE]/90 hover:shadow-xs active:scale-95 transition-all"
        title="Zoom Out (-)"
      >
        <Minus className="w-4 h-4 stroke-[2.2]" />
      </button>

      <div className="w-6 h-[1px] bg-gradient-to-r from-transparent via-[#CBD5E1] to-transparent my-0.5" />

      {/* Rotate Left */}
      <button
        type="button"
        onClick={() => rotateCamera(-Math.PI / 8)}
        className="w-9 h-9 rounded-xl flex items-center justify-center text-[#556080] hover:text-[#2B59E0] hover:bg-gradient-to-br hover:from-white/90 hover:to-[#EDF2FE]/90 hover:shadow-xs active:scale-95 transition-all"
        title="Rotate Left (45°)"
      >
        <RotateCcw className="w-4 h-4 stroke-[2.2]" />
      </button>

      {/* Rotate Right */}
      <button
        type="button"
        onClick={() => rotateCamera(Math.PI / 8)}
        className="w-9 h-9 rounded-xl flex items-center justify-center text-[#556080] hover:text-[#2B59E0] hover:bg-gradient-to-br hover:from-white/90 hover:to-[#EDF2FE]/90 hover:shadow-xs active:scale-95 transition-all"
        title="Rotate Right (45°)"
      >
        <RotateCw className="w-4 h-4 stroke-[2.2]" />
      </button>

      <div className="w-6 h-[1px] bg-gradient-to-r from-transparent via-[#CBD5E1] to-transparent my-0.5" />

      {/* Reset Camera / Home */}
      <button
        type="button"
        onClick={() => resetCamera()}
        className="w-9 h-9 rounded-xl flex items-center justify-center text-[#556080] hover:text-[#2B59E0] hover:bg-gradient-to-br hover:from-white/90 hover:to-[#EDF2FE]/90 hover:shadow-xs active:scale-95 transition-all"
        title="Reset Camera View"
      >
        <Home className="w-4 h-4 stroke-[2.2]" />
      </button>

    </motion.div>
  );
};
