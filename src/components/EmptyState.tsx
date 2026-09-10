import React from 'react';
import { Terminal, Bug, HelpCircle, Sparkles, Command } from 'lucide-react';

interface EmptyStateProps {
  onSelectPrompt: (prompt: string) => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ onSelectPrompt }) => {
  const suggestions = [
    {
      title: 'Build',
      prompt: 'Build a FastAPI REST API with async database sessions and Pydantic schemas',
      icon: Terminal,
      color: 'text-indigo-400',
      badgeBg: 'bg-indigo-950/40 border-indigo-800/40 text-indigo-300',
      borderColor: 'hover:border-indigo-500/60 hover:shadow-[0_0_15px_rgba(99,102,241,0.15)]',
    },
    {
      title: 'Debug',
      prompt: 'Find the bug in my Python code and explain why it occurs',
      icon: Bug,
      color: 'text-emerald-400',
      badgeBg: 'bg-emerald-950/40 border-emerald-800/40 text-emerald-300',
      borderColor: 'hover:border-emerald-500/60 hover:shadow-[0_0_15px_rgba(16,185,129,0.15)]',
    },
    {
      title: 'Explain',
      prompt: 'Explain async/await like I am a beginner with practical examples',
      icon: HelpCircle,
      color: 'text-amber-400',
      badgeBg: 'bg-amber-950/40 border-amber-800/40 text-amber-300',
      borderColor: 'hover:border-amber-500/60 hover:shadow-[0_0_15px_rgba(245,158,11,0.15)]',
    },
    {
      title: 'Improve',
      prompt: 'Refactor this JavaScript function to make it cleaner and more performance-optimized',
      icon: Sparkles,
      color: 'text-purple-400',
      badgeBg: 'bg-purple-950/40 border-purple-800/40 text-purple-300',
      borderColor: 'hover:border-purple-500/60 hover:shadow-[0_0_15px_rgba(168,85,247,0.15)]',
    },
  ];

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center select-none cy-grid-bg relative overflow-hidden">
      {/* Ambient background glow gradient */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cy-accent-glow/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-2xl w-full space-y-8 animate-fade-in relative z-10">
        {/* Headline & Subtitle */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#111113] border border-[#27272A] text-xs font-mono text-cy-accent-light shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>MR.CYPHER AI • Local Machine Intelligence</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold font-mono tracking-tight text-cy-text-primary">
            What are we building today?
          </h1>
          <p className="text-xs sm:text-sm text-cy-text-secondary max-w-md mx-auto leading-relaxed">
            Ask MR.CYPHER AI to write, debug, explain, or refactor code on your local machine.
          </p>
        </div>

        {/* 4 Interactive Suggestion Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-left">
          {suggestions.map((item, idx) => {
            const Icon = item.icon;
            return (
              <button
                key={idx}
                onClick={() => onSelectPrompt(item.prompt)}
                className={`group p-4 rounded-xl bg-[#111113] border border-[#27272A] ${item.borderColor} hover:bg-[#151518] transition-all duration-200 shadow-sm flex flex-col justify-between cursor-pointer`}
              >
                <div className="flex items-center justify-between mb-2.5">
                  <span className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${item.badgeBg}`}>
                    {item.title}
                  </span>
                  <Icon className={`w-4 h-4 ${item.color} opacity-80 group-hover:scale-110 transition-transform`} />
                </div>
                <p className="text-xs text-cy-text-secondary group-hover:text-cy-text-primary line-clamp-2 leading-relaxed">
                  “{item.prompt}”
                </p>
              </button>
            );
          })}
        </div>

        {/* Keyboard Shortcuts & Local Security Footer */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4 text-[11px] font-mono text-cy-text-muted">
          <div className="flex items-center gap-1.5 bg-[#111113] border border-[#27272A] px-3 py-1 rounded-full">
            <Command className="w-3.5 h-3.5 text-cy-text-secondary" />
            <span><kbd className="text-cy-text-primary">⌘K</kbd> Search</span>
            <span className="text-[#27272A]">•</span>
            <span><kbd className="text-cy-text-primary">⌘N</kbd> New Chat</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            <span>100% Offline & Private (Ollama Local)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
