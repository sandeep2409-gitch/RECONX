"use client";

import React from 'react';
import { Shield, MapPin, Compass, Building, Tag } from 'lucide-react';
import { playClick } from '@/api/audioSynth';

export default function IpIntelCard({ data }) {
  if (!data) return null;

  const hasIntel = data.ip && data.ip !== 'N/A' && data.ip !== 'Failed to look up';

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    playClick(); // Sound click
  };

  return (
    <div className="cyber-panel rounded-xl p-5 hover:border-neon-accent/30 transition-all flex flex-col h-full relative overflow-hidden group">
      {/* Corner HUD notches */}
      <div className="cyber-corner-tl" />
      <div className="cyber-corner-tr" />
      <div className="cyber-corner-bl" />
      <div className="cyber-corner-br" />

      {/* Background glow decorator */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-neon-accent-dim rounded-full blur-2xl group-hover:bg-neon-accent-glow/20 transition-all duration-500 pointer-events-none" />

      <div className="flex items-center justify-between border-b border-neon-accent/15 pb-3 mb-4 select-none">
        <h3 className="font-semibold text-slate-200 flex items-center gap-2 tracking-widest text-xs uppercase font-mono">
          <Shield size={16} className="text-neon-accent glow-accent" />
          // IP & ASN TELEMETRY
        </h3>
        <span className="text-[10px] font-mono text-neon-accent/60">NODE_LOOKUP</span>
      </div>

      {!hasIntel ? (
        <div className="flex-1 flex items-center justify-center py-8 text-slate-500 text-xs font-mono select-none">
          {data.ip === 'Failed to look up' 
            ? 'IP/ASN data lookup failed. Domain may not resolve.' 
            : 'Resolving target IP metadata...'}
        </div>
      ) : (
        <div className="flex flex-col flex-1 gap-3">
          
          {/* Sonar Radar sweep animation */}
          <div className="relative w-full h-20 bg-slate-950/80 border border-white/5 rounded-lg overflow-hidden flex items-center justify-center select-none">
            <svg className="w-full h-full opacity-40 absolute" viewBox="0 0 100 100" preserveAspectRatio="none">
              <circle cx="50" cy="50" r="10" fill="none" stroke="var(--accent)" strokeWidth="0.5" strokeOpacity="0.2" />
              <circle cx="50" cy="50" r="22" fill="none" stroke="var(--accent)" strokeWidth="0.5" strokeOpacity="0.2" />
              <circle cx="50" cy="50" r="35" fill="none" stroke="var(--accent)" strokeWidth="0.5" strokeOpacity="0.2" />
              <line x1="50" y1="5" x2="50" y2="95" stroke="var(--accent)" strokeWidth="0.5" strokeOpacity="0.1" />
              <line x1="5" y1="50" x2="95" y2="50" stroke="var(--accent)" strokeWidth="0.5" strokeOpacity="0.1" />
              {/* Spinning sweep arm */}
              <line x1="50" y1="50" x2="50" y2="5" stroke="var(--accent)" strokeWidth="1" className="origin-center animate-[spin_4s_linear_infinite] glow-accent" />
            </svg>
            <div className="z-10 font-mono text-[9px] text-neon-accent tracking-widest text-center animate-pulse font-bold">
              // TELEMETRY RADAR: ONLINE
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-xs flex-1">
            {/* IP and Routing details */}
            <div className="flex flex-col gap-3">
              <div 
                onClick={() => handleCopy(data.ip)}
                className="bg-slate-950/60 border border-white/5 rounded-lg p-2.5 cursor-pointer hover:border-neon-accent/20 transition-all select-all relative group/item"
              >
                <div className="text-slate-400 text-[9px] flex items-center gap-1 mb-0.5 uppercase tracking-wider">
                  <Compass size={11} className="text-neon-accent" />
                  Target Address
                </div>
                <div className="text-slate-100 font-bold">{data.ip}</div>
              </div>

              <div 
                onClick={() => handleCopy(data.asn)}
                className="bg-slate-950/60 border border-white/5 rounded-lg p-2.5 cursor-pointer hover:border-neon-accent/20 transition-all select-all relative group/item"
              >
                <div className="text-slate-400 text-[9px] flex items-center gap-1 mb-0.5 uppercase tracking-wider">
                  <Building size={11} className="text-neon-accent" />
                  Routing ASN
                </div>
                <div className="text-slate-100 font-bold truncate" title={data.asn}>
                  {data.asn}
                </div>
              </div>
            </div>

            {/* Org & Geolocation */}
            <div className="flex flex-col gap-3">
              <div 
                onClick={() => handleCopy(data.org)}
                className="bg-slate-950/60 border border-white/5 rounded-lg p-2.5 cursor-pointer hover:border-neon-accent/20 transition-all select-all relative group/item"
              >
                <div className="text-slate-400 text-[9px] flex items-center gap-1 mb-0.5 uppercase tracking-wider">
                  <Tag size={11} className="text-neon-accent" />
                  Provider Org
                </div>
                <div className="text-slate-100 font-bold truncate" title={data.org}>
                  {data.org}
                </div>
              </div>

              <div className="bg-slate-950/60 border border-white/5 rounded-lg p-2.5 flex flex-col justify-between select-text relative">
                <div>
                  <div className="text-slate-400 text-[9px] flex items-center gap-1 mb-0.5 uppercase tracking-wider">
                    <MapPin size={11} className="text-neon-accent" />
                    Geographic Zone
                  </div>
                  <div className="text-slate-100 font-bold flex items-center gap-1.5 select-all">
                    {data.countryCode && (
                      <img 
                        src={`https://flagcdn.com/16x12/${data.countryCode.toLowerCase()}.png`} 
                        alt={data.country}
                        className="inline-block border border-white/10 rounded-sm scale-105"
                        title={data.country}
                      />
                    )}
                    {data.city}, {data.country}
                  </div>
                </div>
                
                <div className="text-[9px] text-slate-500 border-t border-white/5 pt-1.5 mt-1.5 flex justify-between font-semibold">
                  <span>COORDS: {data.loc}</span>
                  <span>TZ: {data.timezone}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
