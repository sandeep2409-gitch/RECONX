"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Shield, Search, Terminal, AlertCircle, RefreshCw, Star, Volume2, VolumeX, Eye, EyeOff, Radio } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// API utilities
import {
  cleanDomain,
  fetchWhoisData,
  fetchDnsRecords,
  fetchSslDetails,
  fetchSubdomains,
  fetchIpAndAsn,
  auditSecurityHeaders
} from '@/api/reconApi';

// Synthesizer utilities
import {
  playClick,
  playSweep,
  playChime,
  playError,
  setAudioEnabled,
  isAudioEnabled
} from '@/api/audioSynth';

// Dashboard widgets
import ConsoleWidget from '@/components/ConsoleWidget';
import WhoisCard from '@/components/WhoisCard';
import DnsCard from '@/components/DnsCard';
import SslCard from '@/components/SslCard';
import SubdomainsCard from '@/components/SubdomainsCard';
import IpIntelCard from '@/components/IpIntelCard';
import SecurityHeadersCard from '@/components/SecurityHeadersCard';

/* -------------------------------------------------------------
 * HTML5 Canvas Matrix Code Rain Component
 * ------------------------------------------------------------- */
function MatrixRain({ theme, enabled }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!enabled) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    let animationFrameId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const fontSize = 14;
    const columns = Math.floor(width / fontSize) + 1;
    const yPositions = Array(columns).fill(0).map(() => Math.random() * -100);

    const getThemeColor = () => {
      switch (theme) {
        case 'matrix': return '#39ff14';
        case 'biohazard': return '#ffaa00';
        case 'bloodrun': return '#ff0055';
        case 'stealth': return '#94a3b8';
        case 'cyber':
        default:
          return '#00f0ff';
      }
    };

    const draw = () => {
      ctx.fillStyle = 'rgba(3, 7, 18, 0.09)';
      if (theme === 'matrix') ctx.fillStyle = 'rgba(2, 6, 4, 0.09)';
      else if (theme === 'biohazard') ctx.fillStyle = 'rgba(11, 7, 2, 0.09)';
      else if (theme === 'bloodrun') ctx.fillStyle = 'rgba(7, 1, 3, 0.09)';
      else if (theme === 'stealth') ctx.fillStyle = 'rgba(11, 15, 25, 0.09)';

      ctx.fillRect(0, 0, width, height);
      ctx.font = `${fontSize}px monospace`;
      
      const color = getThemeColor();

      for (let i = 0; i < yPositions.length; i++) {
        // Random binary/hex codes or character sets
        const chars = "0123456789ABCDEF<>[]+=-*$@#%?&";
        const text = chars.charAt(Math.floor(Math.random() * chars.length));
        
        const x = i * fontSize;
        const y = yPositions[i];

        ctx.fillStyle = color;
        // Bright heads for rain drops
        if (Math.random() > 0.975) {
          ctx.fillStyle = '#ffffff';
        }
        
        ctx.fillText(text, x, y);

        if (y > height + Math.random() * 1000) {
          yPositions[i] = 0;
        } else {
          yPositions[i] += fontSize;
        }
      }
    };

    let lastTime = 0;
    const interval = 33; // ~30FPS limit to conserve CPU cycle

    const render = (time) => {
      if (!lastTime) lastTime = time;
      const elapsed = time - lastTime;
      if (elapsed > interval) {
        draw();
        lastTime = time;
      }
      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [theme, enabled]);

  if (!enabled) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-0 opacity-15"
      style={{ mixBlendMode: 'screen' }}
    />
  );
}

/* -------------------------------------------------------------
 * Main Dashboard Home View
 * ------------------------------------------------------------- */
export default function Home() {
  const [theme, setTheme] = useState('matrix');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [crtActive, setCrtActive] = useState(true);
  const [rainEnabled, setRainEnabled] = useState(true);

  const [domainInput, setDomainInput] = useState('');
  const [searchedDomain, setSearchedDomain] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [logs, setLogs] = useState([]);
  
  // Intelligence metric states
  const [whoisData, setWhoisData] = useState(null);
  const [dnsRecords, setDnsRecords] = useState(null);
  const [sslData, setSslData] = useState(null);
  const [subdomains, setSubdomains] = useState(null);
  const [ipIntel, setIpIntel] = useState(null);
  const [securityHeaders, setSecurityHeaders] = useState(null);
  const [error, setError] = useState('');

  // Synchronize dynamic stylesheet theme selectors
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Synchronize audio configuration
  useEffect(() => {
    setAudioEnabled(soundEnabled);
  }, [soundEnabled]);

  const addLog = (message) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prev) => [...prev, `[${timestamp}] ${message}`]);
  };

  const handleScan = async (targetDomain) => {
    const clean = cleanDomain(targetDomain);
    if (!clean) {
      setError('Please enter a valid domain (e.g. example.com)');
      playError();
      return;
    }
    
    setError('');
    setIsScanning(true);
    setSearchedDomain(clean);
    setLogs([]); // Reset logs
    playSweep(); // Sound sweep alert
    
    setWhoisData(null);
    setDnsRecords(null);
    setSslData(null);
    setSubdomains(null);
    setIpIntel(null);
    setSecurityHeaders(null);

    addLog(`[SYSTEM] Initializing passive OSINT sweep on domain: ${clean}`);

    try {
      const whoisPromise = fetchWhoisData(clean, addLog).then((data) => {
        setWhoisData(data);
        return data;
      });

      const dnsPromise = fetchDnsRecords(clean, addLog).then((data) => {
        setDnsRecords(data);
        return data;
      });

      const sslPromise = fetchSslDetails(clean, addLog).then((data) => {
        setSslData(data);
        return data;
      });

      const subdomainsPromise = fetchSubdomains(clean, addLog).then((data) => {
        setSubdomains(data);
        return data;
      });

      const ipPromise = fetchIpAndAsn(clean, addLog).then((data) => {
        setIpIntel(data);
        return data;
      });

      const headersPromise = auditSecurityHeaders(clean, addLog).then((data) => {
        setSecurityHeaders(data);
        return data;
      });

      await Promise.allSettled([
        whoisPromise,
        dnsPromise,
        sslPromise,
        subdomainsPromise,
        ipPromise,
        headersPromise
      ]);

      addLog(`[SYSTEM] Passive OSINT scan complete for ${clean}. All modules resolved.`);
      playChime(); // Diagnostic resolved chime chord
    } catch (err) {
      setError(`Scan halted: ${err.message}`);
      addLog(`[CRITICAL] Scan execution halted: ${err.message}`);
      playError(); // Alert sound
    } finally {
      setIsScanning(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    handleScan(domainInput);
  };

  const handleDemoDomain = (demo) => {
    setDomainInput(demo);
    handleScan(demo);
  };

  // Callback interface to evaluate shell prompt logs
  const executeShellCommand = (cmdText) => {
    const parts = cmdText.trim().split(/\s+/);
    const command = parts[0].toLowerCase();
    const args = parts.slice(1);

    if (command === 'scan') {
      if (args.length > 0) {
        const target = args[0];
        setDomainInput(target);
        handleScan(target);
        return `[SHELL] Initiated diagnostic probe scan on: ${target}`;
      } else {
        playError();
        return `[SHELL ERROR] Provide query domain. Usage: scan <domain>`;
      }
    } else if (command === 'clear') {
      setLogs([]);
      return '';
    } else if (command === 'help') {
      return [
        '------------------------------------------------------------',
        'RECONX DECK DIAGNOSTIC CLI ENVIRONMENT - HELP MANUAL',
        '------------------------------------------------------------',
        'COMMANDS:',
        '  scan <domain>     - Launch passive OSINT diagnostics sweep',
        '  clear             - Clear terminal console entries',
        '  theme             - Show active graphic theme status',
        '  sound <on/off>    - Toggle mechanical audio synthesizer',
        '  whois             - Render active WHOIS metrics block',
        '  dns               - Print resolved DNS record logs',
        '  subdomains        - Print enumerated domain targets list',
        '  help              - Render this terminal commands index',
        '------------------------------------------------------------'
      ].join('\n');
    } else if (command === 'theme') {
      return `[SHELL] Graphic theme layout is locked to MATRIX code rain.`;
    } else if (command === 'sound') {
      if (args.length > 0) {
        const val = args[0].toLowerCase();
        if (val === 'on' || val === '1') {
          setSoundEnabled(true);
          return `[SHELL] Audio audio synthesis initialized.`;
        } else if (val === 'off' || val === '0') {
          setSoundEnabled(false);
          return `[SHELL] Audio silenced.`;
        }
      }
      return `Usage: sound <on|off>`;
    } else if (command === 'whois') {
      if (!whoisData) return '[SHELL WARN] No WHOIS data query found in workspace buffers.';
      return `[WHOIS REGISTRY DATA]\n  Registrar: ${whoisData.registrar}\n  Created: ${whoisData.created}\n  Expires: ${whoisData.expires}\n  Nameservers:\n` + whoisData.nameservers.map(ns => `    * ${ns}`).join('\n');
    } else if (command === 'dns') {
      if (!dnsRecords) return '[SHELL WARN] No resolved DNS buffers located in memory.';
      const out = [];
      Object.keys(dnsRecords).forEach(type => {
        const records = dnsRecords[type] || [];
        if (records.length > 0) {
          out.push(`  [${type}] Records:`);
          records.forEach(r => out.push(`    - ${r.name} (TTL: ${r.ttl}s) -> ${r.data}`));
        }
      });
      return `[RESOLVED DNS ENTRIES]\n` + (out.length > 0 ? out.join('\n') : '  No records mapped.');
    } else if (command === 'subdomains') {
      if (!subdomains || subdomains.length === 0) return '[SHELL WARN] No subdomains discovered in cache.';
      return `[ENUMERATED CHILD TARGETS]\n` + subdomains.map(s => `  ├── ${s}`).join('\n');
    } else {
      playError();
      return `[SHELL ERROR] Unrecognized shell command '${command}'. Type 'help' to review directory instructions.`;
    }
  };

  // Stagger animation configuration
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 120 } }
  };

  return (
    <div className={`min-h-screen flex flex-col hacker-grid relative bg-slate-950 font-sans ${crtActive ? 'crt-overlay' : ''}`}>
      
      {/* Background Matrix/Binary effect */}
      <MatrixRain theme={theme} enabled={rainEnabled} />

      {/* Visual cyber background scanlines */}
      <div className="absolute inset-0 scanline pointer-events-none z-0" />

      {/* Top Banner Navigation */}
      <header className="border-b border-neon-accent/15 bg-slate-950/80 backdrop-blur-md relative z-20 px-4 md:px-8 py-3.5 flex flex-col sm:flex-row gap-4 items-center justify-between shadow-[0_4px_20px_rgba(3,7,18,0.8)]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-900 border border-neon-accent/30 overflow-hidden flex items-center justify-center shadow-[0_0_12px_var(--accent-glow)]">
            <img src="/logo.png" alt="ReconX Logo" className="w-full h-full object-cover scale-105" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-wider text-slate-100 flex items-center gap-1 font-mono uppercase">
              RECON<span className="text-neon-accent font-extrabold glow-accent">X</span>
            </h1>
            <p className="text-[10px] text-slate-500 tracking-widest font-mono font-semibold uppercase">
              // DECK TERMINAL OSINT Aggregator
            </p>
          </div>
        </div>

        {/* Cyber Command Settings Bar */}
        <div className="flex flex-wrap items-center justify-center gap-3.5 text-xs font-mono font-semibold">
          {/* Sound Synthesizer toggle */}
          <button
            onClick={() => {
              const nextVal = !soundEnabled;
              setSoundEnabled(nextVal);
              if (nextVal) {
                setTimeout(() => playClick(), 50);
              }
            }}
            className="flex items-center gap-1.5 bg-slate-900/90 border border-white/5 hover:border-neon-accent/30 rounded-lg px-2.5 py-1 text-slate-400 hover:text-neon-accent transition-all cursor-pointer text-[10px]"
            title="Toggle synthesizer beeps"
          >
            {soundEnabled ? (
              <span className="text-emerald-400 flex items-center gap-1.5">
                <Volume2 size={12} className="animate-pulse" /> AUDIO: ON
              </span>
            ) : (
              <span className="text-slate-500 flex items-center gap-1.5">
                <VolumeX size={12} /> AUDIO: OFF
              </span>
            )}
          </button>

          {/* CRT Screen curve Toggler */}
          <button
            onClick={() => {
              setCrtActive(!crtActive);
              playClick();
            }}
            className={`flex items-center gap-1 bg-slate-900/90 border rounded-lg px-2.5 py-1 transition-all cursor-pointer text-[10px] ${
              crtActive ? 'border-neon-accent/40 text-neon-accent shadow-[0_0_8px_var(--accent-glow)]' : 'border-white/5 text-slate-500 hover:text-slate-400'
            }`}
            title="Toggle CRT display simulation"
          >
            <Radio size={11} className={crtActive ? 'animate-pulse' : ''} />
            CRT: {crtActive ? 'ACTIVE' : 'OFF'}
          </button>

          {/* Rain toggle */}
          <button
            onClick={() => {
              setRainEnabled(!rainEnabled);
              playClick();
            }}
            className={`flex items-center gap-1 bg-slate-900/90 border rounded-lg px-2.5 py-1 transition-all cursor-pointer text-[10px] ${
              rainEnabled ? 'border-neon-accent/40 text-neon-accent shadow-[0_0_8px_var(--accent-glow)]' : 'border-white/5 text-slate-500 hover:text-slate-400'
            }`}
            title="Toggle matrix code background"
          >
            RAIN: {rainEnabled ? 'ACTIVE' : 'OFF'}
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-8 py-6 relative z-10 flex flex-col gap-6">
        
        {/* Search Panel */}
        <section className="cyber-panel border border-neon-accent/20 rounded-xl p-5 md:p-6 shadow-xl relative overflow-hidden group">
          {/* Cyber card HUD accents */}
          <div className="cyber-corner-tl" />
          <div className="cyber-corner-tr" />
          <div className="cyber-corner-bl" />
          <div className="cyber-corner-br" />
          <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-neon-accent via-purple-500 to-emerald-500" />
          
          <div className="flex flex-col gap-4">
            <div>
              <h2 className="text-sm font-mono text-neon-accent font-semibold flex items-center gap-2 mb-1.5 uppercase tracking-widest glow-accent">
                <Terminal size={16} />
                [ MAIN SCANNER DECK INTERFACE ]
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed max-w-4xl font-mono">
                ReconX conducts non-intrusive domain diagnostics by querying DNS records, Certificate Transparency logs, RDAP registries, and HTTP headers. No active probes, pings, or scans are directed at the target server.
              </p>
            </div>

            <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1 font-mono">
                <input
                  type="text"
                  placeholder="ENTER TARGET DOMAIN (E.G. GITHUB.COM)..."
                  value={domainInput}
                  onChange={(e) => {
                    setDomainInput(e.target.value);
                  }}
                  disabled={isScanning}
                  className="w-full bg-slate-950/90 border border-neon-accent/20 hover:border-neon-accent/40 rounded-lg py-3 px-4 text-xs font-semibold tracking-widest text-slate-100 uppercase focus:outline-none focus:border-neon-accent focus:ring-1 focus:ring-neon-accent/50 focus:shadow-[0_0_12px_var(--accent-glow)] transition-all select-all disabled:opacity-60"
                />
              </div>
              <button
                type="submit"
                disabled={isScanning}
                onClick={() => playClick()}
                className="bg-neon-accent border border-neon-accent text-slate-950 hover:bg-neon-accent/90 hover:shadow-[0_0_15px_var(--accent)] font-mono text-xs font-extrabold tracking-widest uppercase px-6 py-3 rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none"
              >
                {isScanning ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    RUNNING SWEEP
                  </>
                ) : (
                  <>
                    INITIALIZE SCAN
                  </>
                )}
              </button>
            </form>

            {/* Error alerts */}
            {error && (
              <div className="bg-rose-500/10 border border-rose-500/20 rounded-lg p-3 flex items-start gap-2.5 text-xs text-rose-400 font-mono">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <div>
                  <strong className="font-bold">SCAN ERROR:</strong> {error}
                </div>
              </div>
            )}

            {/* Demo buttons */}
            <div className="flex flex-wrap items-center gap-2.5 text-[10px] font-mono select-none">
              <span className="text-slate-500 flex items-center gap-1">
                // SYSTEM CORE DEMOS:
              </span>
              {['github.com', 'google.com', 'wikipedia.org', 'cloudflare.com'].map((demo) => (
                <button
                  key={demo}
                  type="button"
                  onClick={() => {
                    playClick();
                    handleDemoDomain(demo);
                  }}
                  disabled={isScanning}
                  className="bg-slate-900 border border-white/5 text-slate-400 hover:text-neon-accent hover:border-neon-accent/30 rounded px-2.5 py-1 transition-all cursor-pointer disabled:opacity-40 text-[10px] uppercase font-bold"
                >
                  {demo}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Live console logging widget */}
        <ConsoleWidget 
          logs={logs} 
          isScanning={isScanning} 
          onCommandSubmit={executeShellCommand} 
        />

        {/* Dashboard Results (Progressive loading cards) */}
        {(searchedDomain || whoisData || dnsRecords || sslData || subdomains || ipIntel || securityHeaders) && (
          <div className="flex flex-col gap-6">
            
            {/* Header info bar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-neon-accent/15 pb-2 font-mono text-xs text-slate-500 gap-2">
              <div>
                SCAN TARGET PROTOCOL: <span className="text-neon-accent font-bold glow-accent uppercase select-all">{searchedDomain}</span>
              </div>
              <div className="flex items-center gap-3">
                <span>INTEL STATUS: {isScanning ? <span className="text-neon-accent animate-pulse font-bold">STREAMING DATA...</span> : <span className="text-emerald-400 font-bold glow-green">DIAGNOSTICS COMPLETE</span>}</span>
              </div>
            </div>

            {/* Grid Layout of Cards */}
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              
              {/* WHOIS Card */}
              {whoisData && (
                <motion.div variants={itemVariants} className="lg:col-span-2">
                  <WhoisCard data={whoisData} />
                </motion.div>
              )}

              {/* IP Intelligence Card */}
              {ipIntel && (
                <motion.div variants={itemVariants}>
                  <IpIntelCard data={ipIntel} />
                </motion.div>
              )}

              {/* DNS Records Card */}
              {dnsRecords && (
                <motion.div variants={itemVariants} className="lg:col-span-2">
                  <DnsCard records={dnsRecords} />
                </motion.div>
              )}

              {/* SSL Certificate Card */}
              {sslData && (
                <motion.div variants={itemVariants}>
                  <SslCard data={sslData} />
                </motion.div>
              )}

              {/* Subdomains Card */}
              {subdomains && (
                <motion.div variants={itemVariants}>
                  <SubdomainsCard 
                    subdomains={subdomains} 
                    onDomainSelect={(sub) => {
                      setDomainInput(sub);
                      handleScan(sub);
                    }}
                  />
                </motion.div>
              )}

              {/* Security Headers Card */}
              {securityHeaders && (
                <motion.div variants={itemVariants} className="lg:col-span-2">
                  <SecurityHeadersCard data={securityHeaders} />
                </motion.div>
              )}

            </motion.div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-neon-accent/10 py-6 mt-12 bg-slate-950/90 font-mono text-center text-[10px] text-slate-600 tracking-wider">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>RECONX OSINT SYSTEMS © {new Date().getFullYear()} — NETWORK INTEL DECK</span>
          <span>100% ETHICAL & COMPLIANT QUERY CHANNELS // SECURE CLIENT DIRECT ROUTING</span>
        </div>
      </footer>
    </div>
  );
}
