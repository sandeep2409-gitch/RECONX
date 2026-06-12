"use client";

import React, { useState } from 'react';
import { Layers, Search, Copy, Check, ExternalLink } from 'lucide-react';
import { playClick } from '@/api/audioSynth';

export default function SubdomainsCard({ subdomains, onDomainSelect }) {
  const [filterText, setFilterText] = useState('');
  const [copiedAll, setCopiedAll] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);

  if (!subdomains) return null;

  const filtered = subdomains.filter(sub => 
    sub.toLowerCase().includes(filterText.trim().toLowerCase())
  );

  const handleCopyAll = () => {
    navigator.clipboard.writeText(subdomains.join('\n'));
    setCopiedAll(true);
    playClick(); // Sound click
    setTimeout(() => setCopiedAll(false), 2000);
  };

  const handleCopySingle = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    playClick(); // Sound click
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleDomainScan = (sub) => {
    playClick(); // Sound click
    if (onDomainSelect) onDomainSelect(sub);
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
          <Layers size={16} className="text-neon-accent glow-accent" />
          // CHILD ZONES ({subdomains.length})
        </h3>
        {subdomains.length > 0 && (
          <button 
            onClick={handleCopyAll}
            className="text-[10px] font-mono text-neon-accent/80 hover:text-neon-accent border border-neon-accent/20 hover:border-neon-accent/40 rounded px-2.5 py-1 transition-all flex items-center gap-1 cursor-pointer hover:shadow-[0_0_8px_var(--accent-glow)] bg-slate-900/40"
          >
            {copiedAll ? <Check size={10} className="text-emerald-400" /> : <Copy size={10} />}
            COPY BATCH
          </button>
        )}
      </div>

      {subdomains.length === 0 ? (
        <div className="flex-1 flex items-center justify-center py-8 text-slate-500 text-xs font-mono select-none">
          No subdomains mapped from Certificate Transparency logs.
        </div>
      ) : (
        <div className="flex flex-col flex-1 gap-3">
          {/* Subdomain Filter Search */}
          <div className="relative font-mono">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-500">
              <Search size={12} />
            </span>
            <input
              type="text"
              placeholder="FILTER INDEXED NODES..."
              value={filterText}
              onChange={(e) => {
                setFilterText(e.target.value);
              }}
              className="w-full bg-slate-950/90 border border-neon-accent/20 hover:border-neon-accent/40 rounded-lg py-2 pl-9 pr-4 text-[10px] font-semibold tracking-wider text-slate-200 focus:outline-none focus:border-neon-accent focus:ring-1 focus:ring-neon-accent/40 focus:shadow-[0_0_8px_var(--accent-glow)] transition-all uppercase"
            />
          </div>

          {/* Subdomains Scroll List (ASCII Tree View) */}
          <div className="flex-1 overflow-y-auto max-h-[300px] border border-white/5 rounded-lg bg-slate-950/40 divide-y divide-white/5 font-mono text-xs scrollbar-thin">
            {filtered.length === 0 ? (
              <div className="text-center py-6 text-slate-600 text-[10px] select-none">
                No matching structures resolved.
              </div>
            ) : (
              filtered.map((sub, index) => {
                const isLast = index === filtered.length - 1;
                const branchPrefix = isLast ? '└── ' : '├── ';
                return (
                  <div 
                    key={index}
                    className="flex items-center justify-between p-2.5 hover:bg-white/2.5 transition-all text-slate-300 group/row"
                  >
                    <span className="truncate pr-4 select-all text-slate-200 font-semibold flex items-center">
                      <span className="text-slate-600 select-none mr-1.5 font-bold">{branchPrefix}</span>
                      {sub}
                    </span>
                    <div className="flex items-center gap-1 shrink-0 select-none">
                      <button
                        onClick={() => handleCopySingle(sub, index)}
                        className="text-slate-500 hover:text-neon-accent p-1 rounded hover:bg-white/5 transition-all cursor-pointer opacity-0 group-hover/row:opacity-100"
                        title="Copy Node Address"
                      >
                        {copiedIndex === index ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
                      </button>
                      {onDomainSelect && (
                        <button
                          onClick={() => handleDomainScan(sub)}
                          className="text-slate-500 hover:text-neon-accent p-1 rounded hover:bg-white/5 transition-all cursor-pointer opacity-0 group-hover/row:opacity-100"
                          title="Acquire Node Target"
                        >
                          <ExternalLink size={11} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
