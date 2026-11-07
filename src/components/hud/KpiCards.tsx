import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../../store/useStore';
import { Card } from '../ui/Card';
import { IconTile } from '../ui/IconTile';
import { Chip } from '../ui/Chip';
import { Package, Truck as TruckIcon, Clock } from 'lucide-react';

interface AnimatedCounterProps {
  value: number;
  suffix?: string;
  decimals?: number;
}

const AnimatedCounter: React.FC<AnimatedCounterProps> = ({ value, suffix = '', decimals = 0 }) => {
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    let start = displayValue;
    const end = value;
    if (start === end) return;

    const duration = 500;
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1.0);
      const ease = 1 - Math.pow(1 - progress, 3);
      const current = start + (end - start) * ease;
      setDisplayValue(current);

      if (progress < 1.0) {
        requestAnimationFrame(animate);
      } else {
        setDisplayValue(end);
      }
    };

    requestAnimationFrame(animate);
  }, [value]);

  const formatted = decimals > 0 
    ? displayValue.toFixed(decimals)
    : Math.round(displayValue).toLocaleString();

  return <span className="tabular-nums">{formatted}{suffix}</span>;
};

export const KpiCards: React.FC = () => {
  const { sites, activeSiteId } = useStore();
  const site = sites[activeSiteId] || sites['WH-01'];

  return (
    <div className="absolute top-20 left-4 z-30 flex flex-wrap md:flex-nowrap gap-3 pointer-events-none">
      
      {/* KPI 1: Stock on Hand */}
      <motion.div
        initial={{ opacity: 0, x: -20, scale: 0.95 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        transition={{ duration: 0.4, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
        className="pointer-events-auto animate-float"
      >
        <Card interactive depth className="px-4 py-3 flex items-center gap-3.5 min-w-[220px]">
          <IconTile icon={<Package className="w-5 h-5 stroke-[2.2]" />} variant="blue" size="md" />
          <div className="flex-1">
            <div className="flex items-center justify-between gap-1 mb-0.5">
              <span className="text-[11px] font-extrabold text-[#6B7390] uppercase tracking-wider">
                Stock on hand
              </span>
              <Chip
                label={`+${site.stockDelta}`}
                variant="green"
                showDot={false}
                className="px-1.5 py-0 text-[10px]"
              />
            </div>
            <div className="text-2xl font-black text-[#141B34] tracking-tight">
              <AnimatedCounter value={site.stockOnHand} />
            </div>
            <p className="text-[10px] font-semibold text-[#6B7390]">pallets • {site.id}</p>
          </div>
        </Card>
      </motion.div>

      {/* KPI 2: Trucks on Site */}
      <motion.div
        initial={{ opacity: 0, x: -20, scale: 0.95 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        transition={{ duration: 0.4, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
        className="pointer-events-auto animate-float-delayed"
      >
        <Card interactive depth className="px-4 py-3 flex items-center gap-3.5 min-w-[220px]">
          <IconTile icon={<TruckIcon className="w-5 h-5 stroke-[2.2]" />} variant="amber" size="md" />
          <div className="flex-1">
            <div className="flex items-center justify-between gap-1 mb-0.5">
              <span className="text-[11px] font-extrabold text-[#6B7390] uppercase tracking-wider">
                Trucks on site
              </span>
              <Chip
                label={`+${site.trucksDelta}`}
                variant="green"
                showDot={false}
                className="px-1.5 py-0 text-[10px]"
              />
            </div>
            <div className="text-2xl font-black text-[#141B34] tracking-tight">
              <AnimatedCounter value={site.trucksOnSite} />
            </div>
            <p className="text-[10px] font-semibold text-[#6B7390]">
              {site.trucksInbound} inbound • {site.id}
            </p>
          </div>
        </Card>
      </motion.div>

      {/* KPI 3: On-time Delivery */}
      <motion.div
        initial={{ opacity: 0, x: -20, scale: 0.95 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        transition={{ duration: 0.4, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className="pointer-events-auto animate-float-slow"
      >
        <Card interactive depth className="px-4 py-3 flex items-center gap-3.5 min-w-[220px]">
          <IconTile icon={<Clock className="w-5 h-5 stroke-[2.2]" />} variant="green" size="md" />
          <div className="flex-1">
            <div className="flex items-center justify-between gap-1 mb-0.5">
              <span className="text-[11px] font-extrabold text-[#6B7390] uppercase tracking-wider">
                On-time delivery
              </span>
              <Chip
                label={`+${site.onTimeDelta}%`}
                variant="green"
                showDot={false}
                className="px-1.5 py-0 text-[10px]"
              />
            </div>
            <div className="text-2xl font-black text-[#141B34] tracking-tight">
              <AnimatedCounter value={site.onTimeRate} suffix="%" decimals={1} />
            </div>
            <p className="text-[10px] font-semibold text-[#6B7390]">last 30 days • {site.id}</p>
          </div>
        </Card>
      </motion.div>

    </div>
  );
};
