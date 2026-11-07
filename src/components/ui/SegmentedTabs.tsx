import React from 'react';
import { motion } from 'framer-motion';

export interface TabItem<T extends string> {
  id: T;
  label: string;
  count?: number | string;
}

interface SegmentedTabsProps<T extends string> {
  tabs: TabItem<T>[];
  activeTab: T;
  onChange: (tabId: T) => void;
  className?: string;
}

export function SegmentedTabs<T extends string>({
  tabs,
  activeTab,
  onChange,
  className = '',
}: SegmentedTabsProps<T>) {
  return (
    <div
      className={`inline-flex items-center p-1 bg-white/45 backdrop-blur-md border border-white/60 rounded-xl text-xs font-semibold shadow-[inset_0_1px_2px_rgba(20,35,90,0.05),0_2px_8px_rgba(20,35,90,0.03)] ${className}`}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`relative px-3 py-1.5 rounded-lg transition-all duration-200 flex items-center gap-1.5 z-10 ${
              isActive
                ? 'text-[#2B59E0] font-bold'
                : 'text-[#6B7390] hover:text-[#141B34] hover:bg-white/30'
            }`}
          >
            {isActive && (
              <motion.div
                layoutId="activeTabBadge"
                className="absolute inset-0 bg-white/90 backdrop-blur-md border border-white/80 rounded-lg shadow-[0_2px_8px_rgba(43,89,224,0.12),inset_0_1px_0_rgba(255,255,255,1)] -z-10"
                transition={{ type: 'spring', stiffness: 500, damping: 35 }}
              />
            )}
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold backdrop-blur-sm transition-colors ${
                  isActive
                    ? 'bg-[#EDF2FE] text-[#2B59E0] shadow-sm'
                    : 'bg-[#E5E9F4]/70 text-[#6B7390]'
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
