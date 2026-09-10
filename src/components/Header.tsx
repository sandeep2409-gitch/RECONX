import React, { useState } from 'react';
import { Logo } from './Logo';
import type { OllamaModel, OllamaStatus } from '../types/chat';
import { ChevronDown, PanelRight, Search, Check, RefreshCw } from 'lucide-react';

interface HeaderProps {
  ollamaStatus: OllamaStatus;
  models: OllamaModel[];
  selectedModel: string;
  onSelectModel: (modelName: string) => void;
  rightPanelOpen: boolean;
  onToggleRightPanel: () => void;
  onOpenSearch: () => void;
  onRefreshModels?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  ollamaStatus,
  models,
  selectedModel,
  onSelectModel,
  rightPanelOpen,
  onToggleRightPanel,
  onOpenSearch,
  onRefreshModels,
}) => {
  const [modelDropdownOpen, setModelDropdownOpen] = useState(false);

  return (
    <header className="h-14 bg-[#0A0A0B] border-b border-[#27272A] px-4 flex items-center justify-between select-none z-20 shrink-0">
      {/* Left section: Logo & Status */}
      <div className="flex items-center gap-4">
        <Logo size="sm" showText={true} />

        <div className="h-4 w-px bg-[#27272A] hidden sm:block" />

        {/* Ollama Engine Status Pill (100% Local - No "Online" word) */}
        <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#111113] border border-[#27272A] text-xs font-mono">
          <span
            className={`w-2 h-2 rounded-full ${
              ollamaStatus === 'connected'
                ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)] animate-pulse'
                : ollamaStatus === 'checking'
                ? 'bg-amber-500 animate-pulse'
                : 'bg-emerald-500/70'
            }`}
          />
          <span className="text-cy-text-secondary text-[11px]">
            {ollamaStatus === 'connected'
              ? 'Ollama Ready'
              : ollamaStatus === 'checking'
              ? 'Checking Engine...'
              : 'Local Engine'}
          </span>
        </div>
      </div>

      {/* Center: Model Selector Dropdown */}
      <div className="flex items-center gap-3">
        {/* Model Dropdown */}
        <div className="relative">
          <button
            onClick={() => setModelDropdownOpen(!modelDropdownOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#111113] border border-[#27272A] hover:border-cy-accent-border text-xs font-mono text-cy-text-primary transition-colors"
          >
            <span className="truncate max-w-[140px] font-semibold">{selectedModel}</span>
            <ChevronDown className="w-3.5 h-3.5 text-cy-text-muted" />
          </button>

          {modelDropdownOpen && (
            <div className="absolute top-full mt-1.5 left-1/2 -translate-x-1/2 w-64 bg-[#111113] border border-[#27272A] rounded-xl shadow-cy-panel p-1.5 z-40 animate-slide-up">
              <div className="flex items-center justify-between px-2 py-1.5 text-[10px] font-mono text-cy-text-muted border-b border-[#27272A] mb-1">
                <span>INSTALLED OLLAMA MODELS</span>
                {onRefreshModels && (
                  <button onClick={onRefreshModels} className="hover:text-cy-text-primary" title="Refresh model tags">
                    <RefreshCw className="w-3 h-3" />
                  </button>
                )}
              </div>
              <div className="space-y-0.5 max-h-48 overflow-y-auto">
                {models.map((m) => (
                  <button
                    key={m.name}
                    onClick={() => {
                      onSelectModel(m.name);
                      setModelDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between p-2 rounded-lg text-xs font-mono text-left transition-colors ${
                      selectedModel === m.name
                        ? 'bg-cy-accent-subtle text-cy-accent-light font-semibold'
                        : 'text-cy-text-secondary hover:bg-[#151518] hover:text-cy-text-primary'
                    }`}
                  >
                    <div>
                      <div>{m.name}</div>
                      {m.parameter_size && (
                        <div className="text-[10px] text-cy-text-muted">{m.parameter_size} parameters</div>
                      )}
                    </div>
                    {selectedModel === m.name && <Check className="w-4 h-4 text-cy-accent-light" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Actions: Search & Context Panel Toggle */}
      <div className="flex items-center gap-2">
        <button
          onClick={onOpenSearch}
          title="Search conversation (Cmd+K)"
          className="hidden sm:flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-[#111113] border border-[#27272A] hover:bg-[#151518] text-xs font-mono text-cy-text-muted transition-colors"
        >
          <Search className="w-3.5 h-3.5" />
          <span className="text-[11px]">Search</span>
          <kbd className="px-1.5 py-0.5 rounded bg-[#1F1F23] border border-[#27272A] text-[10px]">
            ⌘K
          </kbd>
        </button>

        <button
          onClick={onToggleRightPanel}
          title="Toggle Context Panel"
          className={`p-2 rounded-lg border transition-colors ${
            rightPanelOpen
              ? 'bg-cy-accent-subtle border-cy-accent-border text-cy-accent-light'
              : 'bg-[#111113] border-[#27272A] text-cy-text-muted hover:text-cy-text-primary hover:bg-[#151518]'
          }`}
        >
          <PanelRight className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
