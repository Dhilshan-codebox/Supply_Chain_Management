import React from 'react';
import { ProgressBar } from './ProgressBar';

interface StatTileProps {
  label: string;
  value: string | number;
  subValue?: string;
  progress?: number;
  progressVariant?: 'blue' | 'green' | 'amber';
  icon?: React.ReactNode;
  className?: string;
}

export const StatTile: React.FC<StatTileProps> = ({
  label,
  value,
  subValue,
  progress,
  progressVariant = 'blue',
  icon,
  className = '',
}) => {
  return (
    <div
      className={`p-3 glass-light rounded-xl flex flex-col justify-between transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(20,35,90,0.06)] border border-white/60 relative overflow-hidden group ${className}`}
    >
      {/* Specular highlight on hover */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/80 to-transparent opacity-60 group-hover:opacity-100 transition-opacity" />

      <div className="flex items-center justify-between text-[11px] font-semibold text-[#6B7390] mb-1">
        <span>{label}</span>
        {icon && <span className="text-[#6B7390] group-hover:text-[#2B59E0] transition-colors">{icon}</span>}
      </div>
      <div className="flex items-baseline gap-1 my-0.5">
        <span className="text-base font-extrabold text-[#141B34] tracking-tight">{value}</span>
        {subValue && <span className="text-[11px] font-medium text-[#6B7390]">{subValue}</span>}
      </div>
      {typeof progress === 'number' && (
        <div className="mt-2">
          <ProgressBar value={progress} variant={progressVariant} height="h-1.5" />
        </div>
      )}
    </div>
  );
};
