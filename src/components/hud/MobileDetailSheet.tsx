import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../store/useStore';
import { ContextDetailPanel } from './ContextDetailPanel';
import { X } from 'lucide-react';

export const MobileDetailSheet: React.FC = () => {
  const { isSheetOpen, setIsSheetOpen, selection, clearSelection } = useStore();

  if (!isSheetOpen || !selection) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 pointer-events-none lg:hidden flex flex-col justify-end">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => {
            setIsSheetOpen(false);
            clearSelection();
          }}
          className="absolute inset-0 bg-[#141B34]/30 backdrop-blur-md pointer-events-auto"
        />

        {/* Bottom Sheet */}
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 30, stiffness: 350 }}
          className="relative w-full max-h-[80vh] glass-heavy glass-shine rounded-t-3xl shadow-2xl overflow-y-auto p-4 border-t border-white/80 pointer-events-auto"
        >
          {/* Pull Handle */}
          <div className="w-12 h-1.5 bg-[#CBD5E1] rounded-full mx-auto mb-3 shadow-inner" />

          {/* Close button */}
          <button
            onClick={() => {
              setIsSheetOpen(false);
              clearSelection();
            }}
            className="absolute top-4 right-4 p-2 text-[#6B7390] hover:text-[#141B34] rounded-full hover:bg-white/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Render Context Details inside bottom sheet */}
          <div className="pt-2">
            <ContextDetailPanel />
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
