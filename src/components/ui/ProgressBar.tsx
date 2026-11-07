import React from 'react';

interface ProgressBarProps {
  value: number; // 0-100
  variant?: 'blue' | 'green' | 'amber';
  height?: string;
  className?: string;
  label?: string;
  showValue?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  variant = 'blue',
  height = 'h-1.5',
  className = '',
  label,
  showValue = false,
}) => {
  const clamped = Math.max(0, Math.min(100, value));

  const variantBar = {
    blue: 'bg-gradient-to-r from-[#2B59E0] via-[#4F7AF8] to-[#60A5FA]',
    green: 'bg-gradient-to-r from-[#179A4D] via-[#22A559] to-[#52E088]',
    amber: 'bg-gradient-to-r from-[#E59312] via-[#F5A524] to-[#FCD34D]',
  };

  const glowColor = {
    blue: 'shadow-[0_0_10px_rgba(43,89,224,0.45)]',
    green: 'shadow-[0_0_10px_rgba(34,165,89,0.45)]',
    amber: 'shadow-[0_0_10px_rgba(245,165,36,0.45)]',
  };

  return (
    <div className={`w-full ${className}`}>
      {(label || showValue) && (
        <div className="flex justify-between items-center text-[11px] font-medium text-[#6B7390] mb-1">
          {label && <span>{label}</span>}
          {showValue && <span className="font-bold text-[#141B34]">{Math.round(clamped)}%</span>}
        </div>
      )}
      <div className={`w-full bg-[#E2E7F5]/70 rounded-full overflow-hidden ${height} backdrop-blur-sm border border-white/40 p-[1px]`}>
        <div
          className={`${height} rounded-full transition-all duration-500 ease-out ${variantBar[variant]} ${glowColor[variant]} relative overflow-hidden`}
          style={{ width: `${clamped}%` }}
        >
          {/* Subtle light sweep */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/35 to-transparent w-full animate-shimmer" />
        </div>
      </div>
    </div>
  );
};
