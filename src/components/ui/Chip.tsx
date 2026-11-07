import React from 'react';

export type ChipVariant = 'green' | 'amber' | 'blue' | 'grey' | 'red';

interface ChipProps {
  label: string;
  variant?: ChipVariant;
  showDot?: boolean;
  pulse?: boolean;
  className?: string;
}

export const Chip: React.FC<ChipProps> = ({
  label,
  variant = 'grey',
  showDot = true,
  pulse = true,
  className = '',
}) => {
  const variantStyles = {
    green:
      'bg-gradient-to-r from-[#E8F7EE]/90 via-[#dcf4e5]/80 to-[#cbf0d7]/70 text-[#17733E] border-[#b0e6c2]/70 shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_2px_6px_rgba(34,165,89,0.12)]',
    amber:
      'bg-gradient-to-r from-[#FEF6E9]/90 via-[#fceec9]/80 to-[#fce4a8]/70 text-[#B8720A] border-[#f8dc97]/70 shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_2px_6px_rgba(245,165,36,0.12)]',
    blue:
      'bg-gradient-to-r from-[#EDF2FE]/90 via-[#e0eaff]/80 to-[#d2e0fd]/70 text-[#1E44B5] border-[#b8cffb]/70 shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_2px_6px_rgba(43,89,224,0.12)]',
    grey:
      'bg-gradient-to-r from-[#F1F3F7]/90 via-[#e9edf4]/80 to-[#e0e5ef]/70 text-[#484F66] border-[#d2d8e4]/70 shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_2px_6px_rgba(107,115,144,0.08)]',
    red:
      'bg-gradient-to-r from-[#FDE8E8]/90 via-[#fad5d5]/80 to-[#f7bebe]/70 text-[#9B1C1C] border-[#f4a7a7]/70 shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_2px_6px_rgba(224,36,36,0.12)]',
  };

  const dotStyles = {
    green: 'bg-[#22A559] shadow-[0_0_8px_rgba(34,165,89,0.7)]',
    amber: 'bg-[#F5A524] shadow-[0_0_8px_rgba(245,165,36,0.7)]',
    blue: 'bg-[#2B59E0] shadow-[0_0_8px_rgba(43,89,224,0.7)]',
    grey: 'bg-[#6B7390] shadow-[0_0_4px_rgba(107,115,144,0.4)]',
    red: 'bg-[#E02424] shadow-[0_0_8px_rgba(224,36,36,0.7)]',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-tight border backdrop-blur-md transition-all duration-200 select-none ${variantStyles[variant]} ${className}`}
    >
      {showDot && (
        <span
          className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotStyles[variant]} ${
            pulse && (variant === 'green' || variant === 'blue') ? 'animate-pulse' : ''
          }`}
        />
      )}
      <span>{label}</span>
    </span>
  );
};
