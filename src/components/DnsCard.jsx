"use client";

import React, { useState } from 'react';
import { Network, Copy, Check } from 'lucide-react';
import { playClick } from '@/api/audioSynth';

export default function DnsCard({ records }) {
  const [activeTab, setActiveTab] = useState('A');
  const [copiedIndex, setCopiedIndex] = useState(null);

  if (!records) return null;

  const availableTypes = Object.keys(records);

  const copyToClipboard = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    playClick(); // Click feedback sound
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleTabClick = (type) => {
    playClick(); // Sound confirmation
    setActiveTab(type);
  };

  const activeRecords = records[activeTab] || [];

  return (
    <div className="cyber-panel rounded-xl p-5 flex flex-col h-full relative overflow-hidden group">
      {/* Corner HUD notches */}
      <div className="cyber-corner-tl" />
      <div className="cyber-corner-tr" />
      <div className="cyber-corner-bl" />
      <div className="cyber-corner-br" />

      {/* Background glow decorator */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-neon-accent-dim rounded-full blur-2xl group-hover:bg-neon-accent-glow/20 transition-all duration-500 pointer-events-none" />

      <div className="flex items-center justify-between border-b border-neon-accent/15 pb-3 mb-4 select-none">
        <h3 className="font-semibold text-slate-200 flex items-center gap-2 tracking-widest text-xs uppercase font-mono">
          <Network size={16} className="text-neon-accent glow-accent" />
          // DNS RECORD RESOLVER
        </h3>
        <span className="text-[10px] font-mono text-neon-accent/60">SYS_RESOLVER_V2</span>
      </div>

      {/* Record Selector Tabs */}
      <div className="flex border-b border-white/5 overflow-x-auto gap-1 mb-4 scrollbar-none font-mono select-none">
        {availableTypes.map((type) => {
          const count = records[type]?.length || 0;
          const isActive = activeTab === type;
          return (
            <button
              key={type}
              onClick={() => handleTabClick(type)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-t-lg transition-all border-b-2 whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                isActive
                  ? 'border-neon-accent bg-neon-accent-dim/30 text-neon-accent glow-accent font-bold shadow-[0_-2px_10px_var(--accent-glow)]'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              {type}
              {count > 0 && (
                <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold ${
                  isActive ? 'bg-neon-accent text-slate-950' : 'bg-slate-800 text-slate-400'
                }`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Records Table */}
      <div className="flex-1 overflow-y-auto max-h-64 font-mono scrollbar-thin">
        {activeRecords.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-[11px] select-none">
            No active {activeTab} records resolved for this zone block.
          </div>
        ) : (
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="text-slate-400 border-b border-white/5 text-[10px] uppercase select-none">
                <th className="pb-2 font-bold w-1/3">// Host Zone</th>
                <th className="pb-2 font-bold w-16">TTL</th>
                <th className="pb-2 font-bold">Record Payload</th>
                <th className="pb-2 font-bold w-8 text-right"></th>
              </tr>
            </thead>
            <tbody>
              {activeRecords.map((record, index) => (
                <tr 
                  key={index}
                  className="border-b border-white/5 hover:bg-white/2.5 transition-all text-slate-300 group/row"
                >
                  <td className="py-2.5 pr-2 truncate max-w-[120px] select-all text-slate-200" title={record.name}>
                    {record.name}
                  </td>
                  <td className="py-2.5 text-slate-500 text-[10px]">{record.ttl}s</td>
                  <td className="py-2.5 break-all pr-2 select-all font-semibold text-neon-accent">
                    {record.data}
                  </td>
                  <td className="py-2.5 text-right">
                    <button
                      onClick={() => copyToClipboard(record.data, index)}
                      className="text-slate-500 hover:text-neon-accent p-1 rounded hover:bg-white/5 transition-all cursor-pointer opacity-0 group-hover/row:opacity-100"
                      title="Copy Record Data"
                    >
                      {copiedIndex === index ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
