import React from 'react';

interface KbdProps {
  children: React.ReactNode;
  className?: string;
}

export const Kbd: React.FC<KbdProps> = ({ children, className = '' }) => {
  return (
    <kbd
      className={`inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold text-[#556080] bg-gradient-to-b from-white/95 to-[#EAEFFA]/85 border border-white/90 rounded-md shadow-[0_2px_4px_rgba(20,35,90,0.08),inset_0_1px_0_rgba(255,255,255,1),0_1px_0_rgba(180,195,230,0.6)] font-mono backdrop-blur-md select-none transition-transform active:translate-y-0.5 ${className}`}
    >
      {children}
    </kbd>
  );
};
