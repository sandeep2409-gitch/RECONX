import React from 'react';
import type { ProjectFile, OllamaStatus, TelemetryState } from '../types/chat';
import { Cpu, FileCode, Activity, X, Plus, Trash2, Gauge, Zap } from 'lucide-react';

interface RightContextPanelProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: 'context' | 'files' | 'activity';
  onTabChange: (tab: 'context' | 'files' | 'activity') => void;
  currentModel: string;
  ollamaStatus: OllamaStatus;
  attachedFiles: ProjectFile[];
  onRemoveFile: (fileId: string) => void;
  onAttachFileClick: () => void;
  telemetry: TelemetryState;
}

export const RightContextPanel: React.FC<RightContextPanelProps> = ({
  isOpen,
  onClose,
  activeTab,
  onTabChange,
  currentModel,
  ollamaStatus,
  attachedFiles,
  onRemoveFile,
  onAttachFileClick,
  telemetry,
}) => {
  if (!isOpen) return null;

  return (
    <aside className="w-72 bg-[#111113] border-l border-[#27272A] flex flex-col h-full z-20 select-none shrink-0 animate-slide-up">
      {/* Panel Top Bar & Tabs */}
      <div className="px-3 pt-3 border-b border-[#27272A]">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-mono font-bold text-cy-text-primary uppercase tracking-wider">
            Cyber Workstation
          </span>
          <button
            onClick={onClose}
            className="p-1 rounded text-cy-text-muted hover:text-cy-text-primary hover:bg-[#151518]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 3 Tabs Header */}
        <div className="flex items-center justify-around border-b border-transparent gap-1">
          <button
            onClick={() => onTabChange('context')}
            className={`pb-2 px-2 text-xs font-mono flex items-center gap-1.5 transition-colors border-b-2 ${
              activeTab === 'context'
                ? 'border-cy-accent text-cy-accent-light font-semibold'
                : 'border-transparent text-cy-text-muted hover:text-cy-text-primary'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>CONTEXT</span>
          </button>

          <button
            onClick={() => onTabChange('files')}
            className={`pb-2 px-2 text-xs font-mono flex items-center gap-1.5 transition-colors border-b-2 ${
              activeTab === 'files'
                ? 'border-cy-accent text-cy-accent-light font-semibold'
                : 'border-transparent text-cy-text-muted hover:text-cy-text-primary'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>FILES</span>
          </button>

          <button
            onClick={() => onTabChange('activity')}
            className={`pb-2 px-2 text-xs font-mono flex items-center gap-1.5 transition-colors border-b-2 ${
              activeTab === 'activity'
                ? 'border-cy-accent text-cy-accent-light font-semibold'
                : 'border-transparent text-cy-text-muted hover:text-cy-text-primary'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>ACTIVITY</span>
          </button>
        </div>
      </div>

      {/* Tab Contents */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs font-mono">
        {/* Tab 1: CONTEXT */}
        {activeTab === 'context' && (
          <div className="space-y-4">
            <div className="p-3 rounded-lg bg-[#151518] border border-[#27272A] space-y-2">
              <span className="text-[10px] text-cy-text-muted uppercase tracking-wider block">MODEL SPECS</span>
              <div className="flex items-center justify-between text-cy-text-primary">
                <span>Model</span>
                <span className="font-semibold text-cy-accent-light">{currentModel}</span>
              </div>
              <div className="flex items-center justify-between text-cy-text-secondary">
                <span>Runtime</span>
                <span>Ollama Local</span>
              </div>
              <div className="flex items-center justify-between text-cy-text-secondary">
                <span>Status</span>
                <span className="flex items-center gap-1 text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  {ollamaStatus === 'connected' ? 'Connected' : 'Offline'}
                </span>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-[#151518] border border-[#27272A] space-y-2">
              <span className="text-[10px] text-cy-text-muted uppercase tracking-wider block">TOKEN BUDGET</span>
              <div className="flex justify-between text-cy-text-secondary">
                <span>Context Window</span>
                <span>32,768 tokens</span>
              </div>
              <div className="w-full h-1.5 bg-[#0A0A0B] rounded-full overflow-hidden border border-[#27272A]">
                <div className="h-full bg-cy-accent w-1/8 rounded-full"></div>
              </div>
              <div className="text-[10px] text-cy-text-muted text-right">4,096 tokens used (~12%)</div>
            </div>

            <div className="p-3 rounded-lg bg-[#151518] border border-[#27272A] space-y-2">
              <span className="text-[10px] text-cy-text-muted uppercase tracking-wider block">SYSTEM PROMPT</span>
              <p className="text-[11px] text-cy-text-secondary italic leading-relaxed">
                "You are MR.CYPHER, a senior software architect and cybersecurity expert assistant..."
              </p>
            </div>
          </div>
        )}

        {/* Tab 2: FILES */}
        {activeTab === 'files' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] text-cy-text-muted uppercase tracking-wider">PROJECT CONTEXT</span>
              <button
                onClick={onAttachFileClick}
                className="flex items-center gap-1 text-[11px] text-cy-accent-light hover:underline"
              >
                <Plus className="w-3 h-3" />
                <span>Add File</span>
              </button>
            </div>

            {attachedFiles.length === 0 ? (
              <div className="p-4 rounded-lg bg-[#151518] border border-[#27272A] text-center text-cy-text-muted text-xs">
                No files attached to context.
              </div>
            ) : (
              attachedFiles.map((file) => (
                <div
                  key={file.id}
                  className="p-2.5 rounded-lg bg-[#151518] border border-[#27272A] flex items-center justify-between group hover:border-cy-accent-border transition-colors"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <FileCode className="w-4 h-4 text-cy-accent-light shrink-0" />
                    <div className="truncate">
                      <div className="text-cy-text-primary text-xs font-semibold truncate">{file.name}</div>
                      <div className="text-[10px] text-cy-text-muted">
                        {(file.size / 1024).toFixed(1)} KB • {file.content.split('\n').length} lines
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => onRemoveFile(file.id)}
                    className="text-cy-text-muted hover:text-rose-400 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Remove file"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 3: ACTIVITY */}
        {activeTab === 'activity' && (
          <div className="space-y-4">
            <div className="p-3 rounded-lg bg-[#151518] border border-[#27272A] space-y-3">
              <span className="text-[10px] text-cy-text-muted uppercase tracking-wider block">REALTIME METRICS</span>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-cy-text-secondary">
                  <Gauge className="w-4 h-4 text-cy-accent-light" />
                  <span>Speed</span>
                </div>
                <span className="font-bold text-cy-text-primary">{telemetry.tokensPerSec} t/s</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-cy-text-secondary">
                  <Zap className="w-4 h-4 text-amber-400" />
                  <span>Latency</span>
                </div>
                <span className="font-bold text-cy-text-primary">{telemetry.latencyMs} ms</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-cy-text-secondary">
                  <Cpu className="w-4 h-4 text-emerald-400" />
                  <span>Total Generated</span>
                </div>
                <span className="font-bold text-cy-text-primary">{telemetry.totalTokens} tokens</span>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-[#151518] border border-[#27272A] space-y-2">
              <span className="text-[10px] text-cy-text-muted uppercase tracking-wider block">LIVE EVENT LOG</span>
              <div className="space-y-1 text-[11px] font-mono text-cy-text-muted">
                <div className="text-emerald-400">[00:01] Ollama engine health check passed</div>
                <div className="text-cy-text-secondary">[00:02] Model {currentModel} initialized</div>
                {telemetry.isGenerating && (
                  <div className="text-cy-accent-light animate-pulse">[STREAMING] Response tokens rendering...</div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
