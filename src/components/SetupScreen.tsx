import React from 'react';
import type { OllamaStatus } from '../types/chat';
import { Cpu, ArrowRight, ShieldCheck } from 'lucide-react';

interface SetupScreenProps {
  ollamaStatus: OllamaStatus;
  currentModel: string;
  onStartCoding: () => void;
}

export const SetupScreen: React.FC<SetupScreenProps> = ({
  ollamaStatus,
  currentModel,
  onStartCoding,
}) => {
  return (
    <div className="fixed inset-0 bg-[#0A0A0B] z-50 flex items-center justify-center p-6 select-none cy-grid-bg animate-fade-in">
      <div className="max-w-md w-full bg-[#111113] border border-[#27272A] rounded-2xl p-8 shadow-cy-panel text-center space-y-6">
        {/* Official MR.CYPHER AI Logo Emblem */}
        <div className="flex justify-center">
          <div className="w-24 h-24 rounded-2xl bg-[#111113] border-2 border-[#38BDF8]/60 shadow-[0_0_30px_rgba(56,189,248,0.4)] overflow-hidden">
            <img
              src="/logo.jpg"
              alt="MR.CYPHER AI"
              className="w-full h-full object-cover rounded-2xl scale-105"
            />
          </div>
        </div>

        {/* Title & Tagline */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold font-mono text-cy-text-primary tracking-tight">
            MR.CYPHER <span className="text-sky-400">AI</span>
          </h1>
          <p className="text-sm font-mono text-cy-accent-light font-semibold">
            YOUR CODE. YOUR MACHINE. YOUR AI.
          </p>
          <p className="text-xs text-cy-text-secondary leading-relaxed pt-1">
            Local coding intelligence powered by Ollama on your Apple Silicon / Mac hardware.
          </p>
        </div>

        {/* Status Card */}
        <div className="p-4 rounded-xl bg-[#151518] border border-[#27272A] space-y-3 text-left font-mono text-xs">
          <div className="flex items-center justify-between">
            <span className="text-cy-text-secondary">Ollama Status</span>
            <div className="flex items-center gap-1.5">
              <span
                className={`w-2 h-2 rounded-full ${
                  ollamaStatus === 'connected'
                    ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.7)] animate-pulse'
                    : 'bg-amber-500'
                }`}
              />
              <span className={ollamaStatus === 'connected' ? 'text-emerald-400 font-semibold' : 'text-amber-400'}>
                {ollamaStatus === 'connected' ? '● Detected' : '● Offline (Fallback Active)'}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-[#27272A] pt-2">
            <span className="text-cy-text-secondary">Default Model</span>
            <div className="flex items-center gap-1 text-cy-text-primary font-semibold">
              <Cpu className="w-3.5 h-3.5 text-cy-accent-light" />
              <span>{currentModel}</span>
            </div>
          </div>
        </div>

        {/* Privacy Note */}
        <div className="flex items-center justify-center gap-2 text-[11px] font-mono text-cy-text-muted">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Zero cloud latency • 100% On-device privacy</span>
        </div>

        {/* Action Button */}
        <button
          onClick={onStartCoding}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-cy-accent hover:bg-cy-accent-hover text-white text-sm font-mono font-bold shadow-cy-glow transition-all active:scale-98"
        >
          <span>Start Coding</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
