"use client";

import React, { useState } from 'react';
import { ShieldCheck, ShieldAlert, Award, Calendar, Copy, Check } from 'lucide-react';
import { playClick } from '@/api/audioSynth';

export default function SslCard({ data }) {
  const [copied, setCopied] = useState(false);
  const [showAllSans, setShowAllSans] = useState(false);

  if (!data) return null;

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    playClick(); // Sound click
    setTimeout(() => setCopied(false), 2000);
  };

  const handleToggleSans = () => {
    playClick(); // Sound click
    setShowAllSans(!showAllSans);
  };

  const hasCerts = data.issuer && data.issuer !== 'N/A';
  const isExpired = data.status === 'Expired';
  const visibleSans = showAllSans ? data.sans : data.sans.slice(0, 15);

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
          {isExpired ? (
            <ShieldAlert size={16} className="text-rose-500 animate-pulse" />
          ) : (
            <ShieldCheck size={16} className="text-emerald-400 glow-green" />
          )}
          // SSL SECURITY LOGS
        </h3>
        
        {hasCerts && (
          <span className={`text-[9px] font-mono px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
            isExpired 
              ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' 
              : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 glow-green'
          }`}>
            {data.status}
          </span>
        )}
      </div>

      {!hasCerts ? (
        <div className="flex-1 flex flex-col items-center justify-center py-8 text-slate-500 text-xs font-mono select-none">
          No SSL certificate data resolved from Certificate Transparency logs.
        </div>
      ) : (
        <div className="flex flex-col gap-4 flex-1">
          {/* Certificate Authority */}
          <div className="bg-slate-950/60 border border-white/5 rounded-lg p-3 font-mono text-xs relative group/ca">
            <div className="text-slate-400 text-[10px] flex items-center gap-1 mb-1.5 uppercase tracking-wider">
              <Award size={12} className="text-neon-accent" />
              Certificate Authority / Issuer
            </div>
            <div className="text-slate-200 font-bold truncate pr-6 select-all font-mono" title={data.issuer}>
              {data.issuer}
            </div>
            <button
              onClick={() => handleCopy(data.issuer)}
              className="absolute right-2.5 top-2.5 opacity-0 group-hover/ca:opacity-100 text-slate-500 hover:text-neon-accent p-1 rounded hover:bg-white/5 transition-all cursor-pointer"
            >
              {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
            </button>
          </div>

          {/* Validity timeframe */}
          <div className="grid grid-cols-2 gap-3 font-mono text-[10px] uppercase">
            <div className="bg-slate-950/60 border border-white/5 rounded-lg p-3">
              <span className="text-slate-500 flex items-center gap-1 mb-1 tracking-wider">
                <Calendar size={11} className="text-slate-500" />
                Valid From
              </span>
              <span className="text-slate-200 font-bold">{data.validFrom}</span>
            </div>
            <div className="bg-slate-950/60 border border-white/5 rounded-lg p-3">
              <span className="text-slate-500 flex items-center gap-1 mb-1 tracking-wider">
                <Calendar size={11} className="text-slate-500" />
                Valid To
              </span>
              <span className="text-slate-200 font-bold">{data.validTo}</span>
            </div>
          </div>

          {/* SANs (Subject Alternative Names) */}
          <div className="bg-slate-950/60 border border-white/5 rounded-lg p-3 font-mono flex-1 flex flex-col justify-between">
            <div>
              <div className="text-slate-400 text-[10px] flex items-center gap-1 mb-2 uppercase tracking-wider">
                <ShieldCheck size={12} className="text-neon-accent" />
                Subject Alternative Names (SANs)
                <span className="text-slate-600">({data.sans.length})</span>
              </div>
              
              {data.sans.length === 0 ? (
                <div className="text-[10px] text-slate-500 py-1">No additional SANs found.</div>
              ) : (
                <div className="flex flex-wrap gap-1 max-h-36 overflow-y-auto pr-1 scrollbar-thin">
                  {visibleSans.map((san, idx) => (
                    <span 
                      key={idx}
                      className="text-[9px] bg-slate-950/80 border border-neon-accent/10 text-neon-accent rounded px-1.5 py-0.5 truncate select-all hover:border-neon-accent/30 transition-all font-semibold"
                      title={san}
                    >
                      {san}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {data.sans.length > 15 && (
              <button
                onClick={handleToggleSans}
                className="text-[10px] font-mono text-neon-accent hover:text-neon-accent/80 mt-2.5 text-left underline cursor-pointer uppercase font-bold"
              >
                {showAllSans ? 'Show Less' : `Show All (+${data.sans.length - 15} entries)`}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
