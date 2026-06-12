"use client";

import React, { useState } from 'react';
import { ShieldCheck, ShieldAlert, AlertTriangle, Eye, EyeOff } from 'lucide-react';
import { playClick } from '@/api/audioSynth';

export default function SecurityHeadersCard({ data }) {
  const [showRaw, setShowRaw] = useState(false);

  if (!data) return null;

  const auditKeys = Object.keys(data.audit || {});
  const passedCount = auditKeys.filter(key => data.audit[key].status === 'PASS').length;
  const totalCount = auditKeys.length;

  const handleToggleRaw = () => {
    playClick(); // Sound click
    setShowRaw(!showRaw);
  };

  const getStatusIcon = (status) => {
    if (status === 'PASS') return <ShieldCheck size={14} className="text-emerald-400 shrink-0 glow-green" />;
    if (status === 'FAIL') return <ShieldAlert size={14} className="text-rose-500 shrink-0" />;
    return <AlertTriangle size={14} className="text-amber-500 shrink-0" />;
  };

  const getStatusStyle = (status) => {
    if (status === 'PASS') return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold';
    if (status === 'FAIL') return 'bg-rose-500/10 text-rose-400 border border-rose-500/20 font-bold';
    return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
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
          <ShieldCheck size={16} className="text-neon-accent glow-accent" />
          // HTTP HEADER AUDIT
        </h3>

        {data.rawHeaders && (
          <button
            onClick={handleToggleRaw}
            className="text-[10px] font-mono text-neon-accent/80 hover:text-neon-accent border border-neon-accent/20 hover:border-neon-accent/40 rounded px-2.5 py-1 transition-all flex items-center gap-1 cursor-pointer hover:shadow-[0_0_8px_var(--accent-glow)] bg-slate-900/40"
          >
            {showRaw ? <EyeOff size={11} /> : <Eye size={11} />}
            {showRaw ? 'HIDE HEADERS' : 'RAW HEADERS'}
          </button>
        )}
      </div>

      <div className="flex-1 flex flex-col justify-between font-mono text-xs gap-4">
        
        {/* Compliance Circular Gauge */}
        {!showRaw && totalCount > 0 && (
          <div className="flex items-center gap-4 bg-slate-950/60 border border-white/5 rounded-lg p-3 select-none">
            <div className="relative w-14 h-14 shrink-0 flex items-center justify-center">
              {/* SVG circular progress ring */}
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-800"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-neon-accent"
                  strokeWidth="3.5"
                  strokeDasharray={`${(passedCount / totalCount) * 100}, 100`}
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute text-[10px] font-bold text-slate-100 font-mono">
                {Math.round((passedCount / totalCount) * 100)}%
              </div>
            </div>
            <div className="font-mono text-[9px] flex-1">
              <div className="font-bold text-slate-200 uppercase tracking-wider">// ACCREDITATION SCORE</div>
              <div className="text-slate-400 mt-0.5 leading-normal font-semibold">
                {passedCount} / {totalCount} monitored policies resolved actively.
              </div>
            </div>
          </div>
        )}

        {showRaw ? (
          <div className="bg-slate-950/80 border border-white/5 rounded-lg p-3 overflow-y-auto max-h-[300px] select-text flex-1 scrollbar-thin">
            <pre className="text-slate-400 text-[10px] whitespace-pre-wrap">{data.rawHeaders}</pre>
          </div>
        ) : (
          <div className="flex flex-col gap-2.5 flex-1 overflow-y-auto max-h-[300px] pr-1 scrollbar-thin">
            {auditKeys.map((key) => {
              const audit = data.audit[key];
              return (
                <div 
                  key={key} 
                  className="bg-slate-950/60 border border-white/5 rounded-lg p-2.5 flex items-start gap-3 hover:border-white/10 transition-all group/item"
                >
                  <div className="mt-0.5">{getStatusIcon(audit.status)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="font-bold text-slate-200 truncate select-all">{audit.name}</span>
                      <span className={`text-[8px] px-1.5 py-0.2 rounded-full uppercase tracking-wider ${getStatusStyle(audit.status)}`}>
                        {audit.status}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-normal">{audit.desc}</p>
                    {audit.value && (
                      <div className="text-[9px] text-neon-accent/80 mt-1 break-all bg-slate-950/80 p-1.5 rounded select-all font-semibold border border-neon-accent/5">
                        {audit.value}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
        
        {/* Footer Audit Advice */}
        {!showRaw && passedCount < totalCount && (
          <div className="text-[9px] text-amber-400/90 border border-amber-500/10 bg-amber-500/5 rounded-lg p-2.5 flex items-start gap-2 select-text leading-relaxed font-semibold">
            <span>
              <strong>RECOMMENDATION:</strong> Missing HSTS or CSP headers exposes the target web server to downgrade attacks and cross-site scripting vulnerabilities. Implement these in your reverse proxy config (e.g. Nginx, Cloudflare) to remediate.
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
