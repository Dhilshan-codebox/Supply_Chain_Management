import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../store/useStore';
import { Kbd } from '../ui/Kbd';
import {
  Boxes,
  Search,
  ChevronDown,
  Bell,
  Radio,
  Check,
  Building2,
  Sparkles,
} from 'lucide-react';

export const TopBar: React.FC = () => {
  const {
    sites,
    activeSiteId,
    selectSite,
    clockTime,
    searchQuery,
    setSearchQuery,
    isSearchOpen,
    setSearchOpen,
    select,
  } = useStore();

  const [siteDropdownOpen, setSiteDropdownOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const activeSite = sites[activeSiteId] || sites['WH-01'];

  // Keyboard shortcut '/' to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement !== searchInputRef.current) {
        e.preventDefault();
        searchInputRef.current?.focus();
        setSearchOpen(true);
      }
      if (e.key === 'Escape') {
        setSiteDropdownOpen(false);
        setSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setSearchOpen]);

  // Quick search results
  const searchResults = React.useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    const results: Array<{
      type: 'site' | 'truck' | 'forklift' | 'pallet' | 'shipment';
      id: string;
      title: string;
      subtitle: string;
      siteId?: string;
    }> = [];

    // Sites
    Object.values(sites).forEach((s) => {
      if (s.name.toLowerCase().includes(q) || s.id.toLowerCase().includes(q)) {
        results.push({ type: 'site', id: s.id, title: `${s.id} — ${s.name}`, subtitle: s.address });
      }
      // Trucks
      s.trucks.forEach((t) => {
        if (t.id.toLowerCase().includes(q) || t.driver.toLowerCase().includes(q) || t.destination.toLowerCase().includes(q)) {
          results.push({ type: 'truck', id: t.id, title: `${t.id} (${t.carrier})`, subtitle: `${t.driver} • ${t.destination}`, siteId: s.id });
        }
      });
      // Forklifts
      s.forklifts.forEach((f) => {
        if (f.id.toLowerCase().includes(q) || f.driver.toLowerCase().includes(q)) {
          results.push({ type: 'forklift', id: f.id, title: `${f.id} — ${f.model}`, subtitle: `${f.driver} • ${f.statusText}`, siteId: s.id });
        }
      });
      // Pallets
      s.pallets.forEach((p) => {
        if (p.id.toLowerCase().includes(q) || p.product.toLowerCase().includes(q)) {
          results.push({ type: 'pallet', id: p.id, title: `${p.id} — ${p.product}`, subtitle: `${p.location} (${p.quantity} units)`, siteId: s.id });
        }
      });
    });

    return results.slice(0, 8);
  }, [searchQuery, sites]);

  return (
    <header className="relative w-full z-40 px-4 pt-4 pointer-events-none">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-[1920px] mx-auto glass-heavy glass-shine glass-depth rounded-2xl px-4 py-2.5 flex items-center justify-between gap-4 pointer-events-auto"
      >
        {/* LEFT: Logo & Brand */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="relative group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#2B59E0] to-[#1E3A8A] flex items-center justify-center text-white shadow-[0_4px_16px_rgba(43,89,224,0.45),inset_0_1px_0_rgba(255,255,255,0.4)] transition-transform duration-200 group-hover:scale-105">
              <Boxes className="w-5 h-5 stroke-[2.2]" />
            </div>
            <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-[#22A559] border-2 border-white rounded-full shadow-sm" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-black tracking-tight text-[#141B34] bg-gradient-to-r from-[#141B34] to-[#2B59E0] bg-clip-text text-transparent">
                WareTrack
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-gradient-to-r from-[#EDF2FE] to-[#DBE5FD] text-[#2B59E0] border border-[#BFD5FD] shadow-xs">
                <Sparkles className="w-2.5 h-2.5" />
                <span>3D PRO</span>
              </span>
            </div>
            <p className="text-[11px] font-semibold text-[#6B7390] hidden sm:block">
              Smart Yard & Logistics Command
            </p>
          </div>
        </div>

        {/* CENTER: Search Bar with Glassmorphic Input & Kbd Hint */}
        <div className="relative flex-1 max-w-xl mx-2">
          <div className="relative flex items-center group">
            <Search className="absolute left-3.5 w-4 h-4 text-[#6B7390] group-focus-within:text-[#2B59E0] transition-colors" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search facilities, trucks, forklifts, pallets, cargo shipments..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setSearchOpen(true);
              }}
              onFocus={() => setSearchOpen(true)}
              className="w-full pl-10 pr-10 py-2.5 bg-white/50 hover:bg-white/70 focus:bg-white/90 border border-white/80 hover:border-[#BFD5FD] focus:border-[#2B59E0] focus:ring-4 focus:ring-[#2B59E0]/15 focus:outline-none rounded-xl text-xs text-[#141B34] placeholder-[#8E97B0] transition-all font-medium backdrop-blur-md shadow-[inset_0_1px_2px_rgba(20,35,90,0.05)]"
            />
            <div className="absolute right-3">
              <Kbd>/</Kbd>
            </div>
          </div>

          {/* Search Dropdown with Glass-Heavy */}
          <AnimatePresence>
            {isSearchOpen && searchResults.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.98 }}
                transition={{ duration: 0.2 }}
                className="absolute top-full left-0 right-0 mt-2 glass-heavy glass-depth rounded-xl overflow-hidden py-1.5 z-50 border border-white/80 shadow-2xl"
              >
                <div className="px-3.5 py-1.5 text-[10px] font-extrabold text-[#8E97B0] uppercase tracking-wider border-b border-[#E6E9F5]/60 flex items-center justify-between">
                  <span>Matching Logistics Assets</span>
                  <span className="text-[9px] font-medium text-[#6B7390]">{searchResults.length} results</span>
                </div>
                <div className="max-h-72 overflow-y-auto">
                  {searchResults.map((item) => (
                    <button
                      key={`${item.type}-${item.id}`}
                      onClick={() => {
                        if (item.type === 'site') {
                          selectSite(item.id);
                        } else {
                          if (item.siteId && item.siteId !== activeSiteId) {
                            selectSite(item.siteId);
                          }
                          select({ type: item.type as any, id: item.id });
                        }
                        setSearchOpen(false);
                        setSearchQuery('');
                      }}
                      className="w-full px-3.5 py-2.5 text-left hover:bg-gradient-to-r hover:from-[#EDF2FE]/80 hover:to-white/80 flex items-center justify-between text-xs transition-colors group"
                    >
                      <div>
                        <span className="font-bold text-[#141B34] group-hover:text-[#2B59E0] transition-colors">{item.title}</span>
                        <span className="text-[11px] text-[#6B7390] block mt-0.5">{item.subtitle}</span>
                      </div>
                      <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-[#EDF2FE] text-[#2B59E0] border border-[#BFD5FD]/50 font-bold capitalize shrink-0 ml-2">
                        {item.type}
                      </span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* RIGHT CONTROLS: Site Switcher, Live Clock, Notifications, Profile */}
        <div className="flex items-center gap-3 shrink-0">
          
          {/* Site Switcher Pill */}
          <div className="relative">
            <button
              onClick={() => setSiteDropdownOpen(!siteDropdownOpen)}
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl glass-light glass-interactive text-left border border-white/70"
            >
              <span className="px-2.5 py-1 rounded-lg bg-gradient-to-br from-[#2B59E0] to-[#1E3A8A] text-white text-[11px] font-black tracking-tight shadow-[0_2px_6px_rgba(43,89,224,0.35)]">
                {activeSite.id}
              </span>
              <div className="hidden md:block">
                <div className="text-xs font-bold text-[#141B34] leading-tight">{activeSite.name}</div>
                <div className="text-[10px] text-[#6B7390] font-semibold leading-tight">
                  {activeSite.fullnessPercent}% full • {activeSite.busyBaysCount}/{activeSite.baysCount} bays active
                </div>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-[#6B7390] transition-transform duration-200 ${siteDropdownOpen ? 'rotate-180 text-[#2B59E0]' : ''}`} />
            </button>

            {/* Site Dropdown Menu */}
            <AnimatePresence>
              {siteDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.98 }}
                  transition={{ duration: 0.18 }}
                  className="absolute right-0 mt-2 w-72 glass-heavy glass-depth rounded-2xl p-1.5 z-50 border border-white/80 shadow-2xl"
                >
                  <div className="px-3 py-1.5 text-[10px] font-extrabold text-[#8E97B0] uppercase tracking-wider border-b border-[#E6E9F5]/60 mb-1">
                    Select Warehouse Site
                  </div>
                  {Object.values(sites).map((s) => (
                    <button
                      key={s.id}
                      onClick={() => {
                        selectSite(s.id);
                        setSiteDropdownOpen(false);
                      }}
                      className={`w-full px-3 py-2.5 rounded-xl text-left flex items-center justify-between text-xs transition-all ${
                        s.id === activeSiteId
                          ? 'bg-gradient-to-r from-[#EDF2FE] to-white border border-[#BFD5FD] shadow-xs'
                          : 'hover:bg-white/60'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                          s.id === activeSiteId ? 'bg-[#2B59E0] text-white shadow-xs' : 'bg-[#EEF1FB] text-[#6B7390]'
                        }`}>
                          <Building2 className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-extrabold text-[#141B34]">{s.id} — {s.name}</div>
                          <div className="text-[10px] font-medium text-[#6B7390]">
                            {s.fullnessPercent}% capacity • {s.baysCount} dock bays
                          </div>
                        </div>
                      </div>
                      {s.id === activeSiteId && <Check className="w-4 h-4 text-[#2B59E0] stroke-[2.5]" />}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Live Indicator Pill */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-[#E8F7EE]/90 via-[#dcf4e5]/80 to-[#cbf0d7]/70 border border-[#b0e6c2]/80 text-[#17733E] text-xs font-extrabold tracking-tight backdrop-blur-md shadow-[0_2px_10px_rgba(34,165,89,0.18),inset_0_1px_0_rgba(255,255,255,0.85)] pulse-glow-green">
            <Radio className="w-3.5 h-3.5 animate-pulse text-[#22A559]" />
            <span className="tabular-nums">Live {clockTime}</span>
          </div>

          {/* Notification Bell */}
          <button
            type="button"
            className="relative p-2 rounded-xl text-[#6B7390] hover:text-[#141B34] hover:bg-white/60 transition-all border border-transparent hover:border-white/60"
            title="Operational Alerts"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-[#E02424] ring-2 ring-white animate-pulse" />
          </button>

          <div className="w-[1px] h-6 bg-gradient-to-b from-transparent via-[#CBD5E1] to-transparent hidden sm:block" />

          {/* User Profile */}
          <div className="flex items-center gap-2.5 p-1 pr-2 rounded-xl hover:bg-white/50 transition-colors cursor-pointer border border-transparent hover:border-white/60">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#2B59E0] via-[#3B82F6] to-[#60A5FA] flex items-center justify-center text-white font-black text-xs ring-2 ring-white shadow-sm">
              AC
            </div>
            <div className="hidden lg:block text-left">
              <div className="text-xs font-extrabold text-[#141B34] leading-tight">Alex Chen</div>
              <div className="text-[10px] text-[#6B7390] font-semibold leading-tight">Operations Lead</div>
            </div>
          </div>

        </div>

      </motion.div>
    </header>
  );
};
