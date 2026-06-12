"use client";

import React, { useState } from 'react';
import { Globe, Calendar, Server, FileText, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { playClick } from '@/api/audioSynth';

export default function WhoisCard({ data }) {
  const [showRaw, setShowRaw] = useState(false);

  if (!data) return null;

  // Compute days remaining until domain expires
  const getDaysRemaining = (expiryStr) => {
    if (!expiryStr || expiryStr === 'N/A') return null;
    try {
      const expiryDate = new Date(expiryStr);
      if (isNaN(expiryDate.getTime())) return null;
      
      const diffTime = expiryDate - new Date();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays;
    } catch {
      return null;
    }
  };

  const daysRemaining = getDaysRemaining(data.expires);

  const handleOpenRaw = () => {
    playClick();
    setShowRaw(true);
  };

  const handleCloseRaw = () => {
    playClick();
    setShowRaw(false);
  };

  return (
    <div className="cyber-panel rounded-xl p-5 flex flex-col justify-between h-full group relative overflow-hidden">
      {/* Corner HUD notches */}
      <div className="cyber-corner-tl" />
      <div className="cyber-corner-tr" />
      <div className="cyber-corner-bl" />
      <div className="cyber-corner-br" />

      {/* Glow highlight */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-neon-accent-dim rounded-full blur-2xl group-hover:bg-neon-accent-glow/20 transition-all duration-500 pointer-events-none" />

      <div>
        <div className="flex items-center justify-between border-b border-neon-accent/15 pb-3 mb-4 select-none">
          <h3 className="font-semibold text-slate-200 flex items-center gap-2 tracking-widest text-xs uppercase font-mono">
            <Globe size={16} className="text-neon-accent glow-accent" />
            // REGISTRY INTELLIGENCE (WHOIS)
          </h3>
          {data.raw && (
            <button 
              onClick={handleOpenRaw}
              className="text-[10px] font-mono text-neon-accent/80 hover:text-neon-accent border border-neon-accent/20 hover:border-neon-accent/40 rounded px-2.5 py-0.5 transition-all flex items-center gap-1 cursor-pointer hover:shadow-[0_0_8px_var(--accent-glow)] bg-slate-900/40"
            >
              <FileText size={10} />
              RAW PAYLOAD
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
          {/* Registrar Info */}
          <div className="bg-slate-950/60 border border-white/5 rounded-lg p-3 relative">
            <div className="text-slate-400 text-[10px] flex items-center gap-1 mb-1.5 uppercase tracking-wider">
              <Server size={12} className="text-neon-accent" />
              Domain Registrar
            </div>
            <div className="text-slate-200 font-bold truncate select-all">{data.registrar}</div>
          </div>

          {/* Creation & Expiry Info */}
          <div className="bg-slate-950/60 border border-white/5 rounded-lg p-3 flex flex-col gap-2 relative">
            <div className="flex justify-between items-center">
              <span className="text-slate-400 text-[10px] flex items-center gap-1 uppercase tracking-wider">
                <Calendar size={11} className="text-emerald-400" />
                Created
              </span>
              <span className="text-slate-200 font-semibold select-all">{data.created}</span>
            </div>
            <div className="flex justify-between items-center border-t border-white/5 pt-2">
              <span className="text-slate-400 text-[10px] flex items-center gap-1 uppercase tracking-wider">
                <Calendar size={11} className="text-rose-400" />
                Expires
              </span>
              <span className="text-slate-200 font-semibold select-all">{data.expires}</span>
            </div>
          </div>
        </div>

        {/* Nameservers */}
        <div className="mt-4 bg-slate-950/60 border border-white/5 rounded-lg p-3 font-mono">
          <div className="text-slate-400 text-[10px] flex items-center gap-1 mb-2 uppercase tracking-wider">
            <Globe size={11} className="text-neon-accent" />
            Authoritative DNS Nameservers
          </div>
          <div className="flex flex-wrap gap-1.5">
            {data.nameservers.map((ns, idx) => (
              <span 
                key={idx}
                className="text-[10px] bg-slate-950/80 border border-neon-accent/10 text-neon-accent rounded px-2 py-0.5 hover:border-neon-accent/30 transition-all select-all font-semibold"
              >
                {ns}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Cyber Countdown Meter */}
      {daysRemaining !== null && (
        <div className="mt-4 bg-slate-950/80 border border-neon-accent/10 rounded-lg p-3 font-mono text-[10px] select-none">
          <div className="flex justify-between items-center mb-1 text-slate-400">
            <span>COUNTDOWN TO EXPIRATION:</span>
            <span className={`font-bold ${daysRemaining < 90 ? 'text-rose-400 animate-pulse' : 'text-emerald-400'}`}>
              {daysRemaining} DAYS REMAINING
            </span>
          </div>
          {/* Visual dynamic bar */}
          <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden border border-white/5">
            <div 
              className={`h-full rounded-full ${daysRemaining < 90 ? 'bg-rose-500' : 'bg-neon-accent'}`}
              style={{ width: `${Math.min(100, Math.max(2, (daysRemaining / 365) * 100))}%` }}
            />
          </div>
        </div>
      )}

      {/* Raw Data Modal */}
      <AnimatePresence>
        {showRaw && (
          <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 z-50">
            <motion.div 
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              className="cyber-panel border border-neon-accent/30 rounded-xl w-full max-w-4xl max-h-[80vh] flex flex-col shadow-2xl"
            >
              <div className="cyber-corner-tl" />
              <div className="cyber-corner-tr" />
              <div className="cyber-corner-bl" />
              <div className="cyber-corner-br" />

              <div className="bg-slate-900 px-4 py-3 border-b border-neon-accent/15 flex items-center justify-between font-mono">
                <span className="text-xs font-semibold text-neon-accent flex items-center gap-2 uppercase tracking-widest glow-accent">
                  <FileText size={14} />
                  // RAW PROTOCOL BUFFER PAYLOAD
                </span>
                <button 
                  onClick={handleCloseRaw}
                  className="text-slate-400 hover:text-white rounded p-1 hover:bg-white/5 transition-all cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>
              <div className="p-4 overflow-y-auto bg-slate-950/95 font-mono text-[11px] text-slate-300 select-text flex-1 scrollbar-thin">
                <pre className="whitespace-pre-wrap">{data.raw}</pre>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
