import React from 'react';
import type { SlashCommand } from '../types/chat';
import { HelpCircle, Bug, Sparkles, ShieldCheck, TestTube, FileText } from 'lucide-react';

export const COMMANDS: SlashCommand[] = [
  {
    command: '/explain',
    label: 'Explain',
    description: 'Explain code structure and architectural concepts clearly.',
    iconName: 'HelpCircle',
  },
  {
    command: '/debug',
    label: 'Debug',
    description: 'Find subtle runtime bugs, memory leaks, and logic errors.',
    iconName: 'Bug',
  },
  {
    command: '/refactor',
    label: 'Refactor',
    description: 'Improve code readability, performance, and modularity.',
    iconName: 'Sparkles',
  },
  {
    command: '/review',
    label: 'Review',
    description: 'Perform a security and performance code review.',
    iconName: 'ShieldCheck',
  },
  {
    command: '/test',
    label: 'Test',
    description: 'Generate comprehensive unit tests and edge case coverage.',
    iconName: 'TestTube',
  },
  {
    command: '/document',
    label: 'Document',
    description: 'Generate docstrings, inline comments, and OpenAPI docs.',
    iconName: 'FileText',
  },
];

interface SlashCommandMenuProps {
  onSelectCommand: (command: SlashCommand) => void;
  onClose: () => void;
}

export const SlashCommandMenu: React.FC<SlashCommandMenuProps> = ({
  onSelectCommand,
  onClose,
}) => {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'HelpCircle': return <HelpCircle className="w-4 h-4 text-indigo-400" />;
      case 'Bug': return <Bug className="w-4 h-4 text-emerald-400" />;
      case 'Sparkles': return <Sparkles className="w-4 h-4 text-purple-400" />;
      case 'ShieldCheck': return <ShieldCheck className="w-4 h-4 text-blue-400" />;
      case 'TestTube': return <TestTube className="w-4 h-4 text-amber-400" />;
      case 'FileText': return <FileText className="w-4 h-4 text-cyan-400" />;
      default: return <Sparkles className="w-4 h-4 text-cy-accent-light" />;
    }
  };

  return (
    <div className="absolute bottom-full mb-2 left-0 right-0 max-w-lg bg-[#111113] border border-[#27272A] rounded-xl shadow-cy-panel overflow-hidden z-30 animate-slide-up select-none">
      <div className="px-3 py-2 bg-[#151518] border-b border-[#27272A] flex items-center justify-between">
        <span className="text-[11px] font-mono font-semibold text-cy-text-secondary uppercase tracking-wider">
          Slash Commands
        </span>
        <button onClick={onClose} className="text-[10px] font-mono text-cy-text-muted hover:text-cy-text-primary">
          Press Esc to close
        </button>
      </div>

      <div className="p-1.5 max-h-64 overflow-y-auto space-y-0.5">
        {COMMANDS.map((cmd) => (
          <button
            key={cmd.command}
            onClick={() => onSelectCommand(cmd)}
            className="w-full flex items-start gap-3 p-2.5 rounded-lg hover:bg-[#1F1F23] text-left transition-colors group"
          >
            <div className="p-1.5 rounded-md bg-[#151518] border border-[#27272A] group-hover:border-cy-accent-border transition-colors mt-0.5">
              {getIcon(cmd.iconName)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-cy-accent-light group-hover:text-white">
                  {cmd.command}
                </span>
                <span className="text-[10px] font-mono text-cy-text-muted uppercase">
                  {cmd.label}
                </span>
              </div>
              <p className="text-xs text-cy-text-secondary line-clamp-1 mt-0.5">
                {cmd.description}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
