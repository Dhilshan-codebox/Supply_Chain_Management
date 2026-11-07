import React from 'react';

interface IconTileProps {
  icon: React.ReactNode;
  variant?: 'blue' | 'green' | 'amber' | 'slate';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const IconTile: React.FC<IconTileProps> = ({
  icon,
  variant = 'blue',
  size = 'md',
  className = '',
}) => {
  const variantStyles = {
    blue: 'bg-gradient-to-br from-[#EEF4FF]/95 via-[#DBE8FE]/90 to-[#BFD7FE]/80 text-[#2B59E0] border-white/80 shadow-[0_4px_14px_rgba(43,89,224,0.18),inset_0_1.5px_0_rgba(255,255,255,0.95)]',
    green: 'bg-gradient-to-br from-[#EBF9F1]/95 via-[#D5F3DF]/90 to-[#BAECCE]/80 text-[#22A559] border-white/80 shadow-[0_4px_14px_rgba(34,165,89,0.18),inset_0_1.5px_0_rgba(255,255,255,0.95)]',
    amber: 'bg-gradient-to-br from-[#FEF7EC]/95 via-[#FCE9C8]/90 to-[#F9D89A]/80 text-[#F5A524] border-white/80 shadow-[0_4px_14px_rgba(245,165,36,0.18),inset_0_1.5px_0_rgba(255,255,255,0.95)]',
    slate: 'bg-gradient-to-br from-[#F4F6FA]/95 via-[#E6EBF3]/90 to-[#D5DEEC]/80 text-[#6B7390] border-white/80 shadow-[0_4px_14px_rgba(107,115,144,0.12),inset_0_1.5px_0_rgba(255,255,255,0.95)]',
  };

  const sizeStyles = {
    sm: 'w-7 h-7 rounded-lg text-sm',
    md: 'w-10 h-10 rounded-xl text-base',
    lg: 'w-12 h-12 rounded-2xl text-lg',
  };

  return (
    <div
      className={`inline-flex items-center justify-center shrink-0 backdrop-blur-md border transition-transform duration-200 hover:scale-105 ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    >
      {icon}
    </div>
  );
};
