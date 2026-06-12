"use client";

import React, { useEffect, useRef, useState } from 'react';
import { Terminal, Shield, Play } from 'lucide-react';
import { playKeypress, playClick } from '@/api/audioSynth';

export default function ConsoleWidget({ logs, isScanning, onCommandSubmit }) {
  const terminalEndRef = useRef(null);
  const inputRef = useRef(null);
  const [shellInput, setShellInput] = useState('');

  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  // Automatically focus on the shell input when terminal is clicked
  const handleTerminalClick = () => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleInputChange = (e) => {
    setShellInput(e.target.value);
    playKeypress(); // Synthetic typing sound
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!shellInput.trim()) return;

    playClick(); // Sound confirmation click

    const command = shellInput.trim();
    // 1. Add user prompt to logs locally
    const timestamp = new Date().toLocaleTimeString();
    logs.push(`[${timestamp}] recon-x@osint:~$ ${command}`);
    
    // 2. Evaluate command through parent handler
    if (onCommandSubmit) {
      const response = onCommandSubmit(command);
      if (response) {
        // Support multi-line outputs
        const lines = response.split('\n');
        lines.forEach(line => {
          logs.push(line);
        });
      }
    }

    setShellInput('');
  };

  const getLogStyle = (log) => {
    if (log.includes('[SUCCESS]')) return 'text-emerald-400 font-semibold';
    if (log.includes('[ERROR]') || log.includes('[CRITICAL]')) return 'text-rose-400 font-bold';
    if (log.includes('[WARN]')) return 'text-amber-400 font-semibold';
    if (log.includes('[INFO]')) return 'text-neon-accent';
    if (log.includes('recon-x@osint:~$')) return 'text-white font-bold';
    if (log.includes('[SHELL]')) return 'text-neon-accent font-medium';
    if (log.includes('[SHELL ERROR]')) return 'text-rose-400 font-semibold';
    if (log.includes('[SHELL WARN]')) return 'text-amber-400 font-semibold';
    return 'text-slate-300';
  };

  return (
    <div 
      onClick={handleTerminalClick}
      className="cyber-panel border border-neon-accent/20 rounded-xl overflow-hidden shadow-2xl relative font-mono text-sm cursor-text"
    >
      {/* Corner Notches */}
      <div className="cyber-corner-tl" />
      <div className="cyber-corner-tr" />
      <div className="cyber-corner-bl" />
      <div className="cyber-corner-br" />

      {/* Header bar */}
      <div className="bg-slate-900/95 px-4 py-3 border-b border-neon-accent/15 flex items-center justify-between select-none">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80 animate-pulse"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 animate-pulse"></span>
          </div>
          <span className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase flex items-center gap-1.5 ml-2">
            <Terminal size={14} className="text-neon-accent glow-accent" />
            RECON_ENGINE.log // SH_ENVIRONMENT
          </span>
        </div>
        <div className="flex items-center gap-2">
          {isScanning ? (
            <span className="flex items-center gap-1.5 text-xs text-neon-accent font-semibold animate-pulse">
              <span className="w-2.5 h-2.5 rounded-full bg-neon-accent animate-ping"></span>
              SWEEP ACTIVE
            </span>
          ) : (
            <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
              <Shield size={12} />
              SECURE / MONITORING
            </span>
          )}
        </div>
      </div>

      {/* Terminal log output */}
      <div className="p-4 bg-slate-950/95 h-64 overflow-y-auto font-mono text-xs md:text-sm select-text flex flex-col gap-1.5 scrollbar-thin">
        {logs.length === 0 ? (
          <div className="text-slate-500 flex flex-col items-center justify-center h-full gap-2 select-none">
            <Terminal size={28} className="text-neon-accent/30 animate-pulse" />
            <p className="animate-pulse tracking-wide text-xs">READY FOR TARGET ACQUISITION</p>
            <p className="text-[10px] text-slate-600">Enter domain above OR type 'help' in shell below...</p>
          </div>
        ) : (
          logs.map((log, index) => (
            <div key={index} className="flex gap-2 leading-relaxed">
              <span className="text-slate-600 select-none text-[10px] pt-0.5">{(index + 1).toString().padStart(3, '0')}</span>
              <span className={`${getLogStyle(log)} whitespace-pre-wrap break-all`}>{log}</span>
            </div>
          ))
        )}
        <div ref={terminalEndRef} />
      </div>
      
      {/* Shell CLI Prompt Input */}
      <form onSubmit={handleFormSubmit} className="flex border-t border-neon-accent/15 bg-slate-950 font-mono text-xs select-none">
        <span className="text-neon-accent pl-4 py-3.5 shrink-0 select-none font-bold">recon-x@osint:~$</span>
        <input
          ref={inputRef}
          type="text"
          value={shellInput}
          onChange={handleInputChange}
          placeholder="type 'help' for directory listings and CLI syntax..."
          className="flex-1 bg-transparent text-slate-100 font-semibold py-3.5 px-2 outline-none border-none tracking-widest text-xs focus:ring-0 focus:outline-none"
        />
        <div className="flex items-center pr-4 text-[9px] text-slate-500 font-semibold gap-1 select-none">
          <span>[ENTER] RUN</span>
        </div>
      </form>
      
      {/* Decorative scanning line */}
      {isScanning && (
        <div className="absolute inset-x-0 h-0.5 bg-neon-accent/30 shadow-[0_0_10px_var(--accent)] scan-bar z-10 pointer-events-none" />
      )}
    </div>
  );
}
