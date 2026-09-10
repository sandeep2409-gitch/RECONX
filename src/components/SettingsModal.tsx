import React, { useState } from 'react';
import type { AppSettings, OllamaStatus } from '../types/chat';
import { X, Sliders, Cpu, Server, ShieldCheck, Check, RefreshCw } from 'lucide-react';
import { checkOllamaStatus } from '../lib/ollama';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
  ollamaStatus: OllamaStatus;
  onRefreshOllamaStatus: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  ollamaStatus,
  onRefreshOllamaStatus,
}) => {
  const [activeTab, setActiveTab] = useState<'general' | 'ai' | 'ollama' | 'about'>('general');
  const [testingUrl, setTestingUrl] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    setTestingUrl(true);
    setTestResult(null);
    const ok = await checkOllamaStatus(settings.ollamaUrl);
    setTestingUrl(false);
    if (ok) {
      setTestResult('Successfully connected to Ollama server!');
      onRefreshOllamaStatus();
    } else {
      setTestResult('Failed to reach Ollama server. Check that Ollama is running.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 select-none animate-fade-in">
      <div className="bg-[#111113] border border-[#27272A] rounded-2xl w-full max-w-2xl overflow-hidden shadow-cy-panel flex flex-col md:flex-row h-[520px]">
        {/* Modal Left Sidebar */}
        <div className="w-full md:w-52 bg-[#0A0A0B] border-r border-[#27272A] p-4 flex flex-col justify-between shrink-0">
          <div className="space-y-4">
            <span className="text-xs font-mono font-bold text-cy-text-primary uppercase tracking-wider block">
              SETTINGS
            </span>
            <div className="space-y-1">
              <button
                onClick={() => setActiveTab('general')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-mono text-left transition-colors ${
                  activeTab === 'general'
                    ? 'bg-cy-accent-subtle text-cy-accent-light font-semibold border border-cy-accent-border'
                    : 'text-cy-text-secondary hover:bg-[#151518] hover:text-cy-text-primary'
                }`}
              >
                <Sliders className="w-4 h-4" />
                <span>General</span>
              </button>

              <button
                onClick={() => setActiveTab('ai')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-mono text-left transition-colors ${
                  activeTab === 'ai'
                    ? 'bg-cy-accent-subtle text-cy-accent-light font-semibold border border-cy-accent-border'
                    : 'text-cy-text-secondary hover:bg-[#151518] hover:text-cy-text-primary'
                }`}
              >
                <Cpu className="w-4 h-4" />
                <span>AI Model</span>
              </button>

              <button
                onClick={() => setActiveTab('ollama')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-mono text-left transition-colors ${
                  activeTab === 'ollama'
                    ? 'bg-cy-accent-subtle text-cy-accent-light font-semibold border border-cy-accent-border'
                    : 'text-cy-text-secondary hover:bg-[#151518] hover:text-cy-text-primary'
                }`}
              >
                <Server className="w-4 h-4" />
                <span>Ollama Server</span>
              </button>

              <button
                onClick={() => setActiveTab('about')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-mono text-left transition-colors ${
                  activeTab === 'about'
                    ? 'bg-cy-accent-subtle text-cy-accent-light font-semibold border border-cy-accent-border'
                    : 'text-cy-text-secondary hover:bg-[#151518] hover:text-cy-text-primary'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                <span>About</span>
              </button>
            </div>
          </div>

          <div className="text-[10px] font-mono text-cy-text-muted">
            MR.CYPHER v1.0.0
          </div>
        </div>

        {/* Modal Right Content Pane */}
        <div className="flex-1 flex flex-col justify-between p-6 bg-[#111113] overflow-y-auto">
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-[#27272A] pb-3">
              <h2 className="text-sm font-mono font-bold text-cy-text-primary uppercase tracking-wider">
                {activeTab} Settings
              </h2>
              <button
                onClick={onClose}
                className="p-1 rounded text-cy-text-muted hover:text-cy-text-primary hover:bg-[#151518]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* General Tab */}
            {activeTab === 'general' && (
              <div className="space-y-4 text-xs font-mono">
                <div>
                  <label className="text-cy-text-secondary block mb-1.5 font-semibold">Theme Mode</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => onUpdateSettings({ theme: 'dark' })}
                      className={`p-2.5 rounded-lg border text-center font-semibold transition-colors ${
                        settings.theme === 'dark'
                          ? 'bg-cy-accent-subtle border-cy-accent text-cy-accent-light'
                          : 'bg-[#151518] border-[#27272A] text-cy-text-secondary'
                      }`}
                    >
                      Dark Workspace
                    </button>
                    <button
                      onClick={() => onUpdateSettings({ theme: 'system' })}
                      className={`p-2.5 rounded-lg border text-center font-semibold transition-colors ${
                        settings.theme === 'system'
                          ? 'bg-cy-accent-subtle border-cy-accent text-cy-accent-light'
                          : 'bg-[#151518] border-[#27272A] text-cy-text-secondary'
                      }`}
                    >
                      System Default
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-cy-text-secondary block mb-1.5 font-semibold">
                    Code Editor Font Size ({settings.fontSize}px)
                  </label>
                  <input
                    type="range"
                    min={11}
                    max={18}
                    value={settings.fontSize}
                    onChange={(e) => onUpdateSettings({ fontSize: Number(e.target.value) })}
                    className="w-full accent-cy-accent"
                  />
                </div>
              </div>
            )}

            {/* AI Model Tab */}
            {activeTab === 'ai' && (
              <div className="space-y-4 text-xs font-mono">
                <div>
                  <label className="text-cy-text-secondary block mb-1.5 font-semibold">Default Model</label>
                  <input
                    type="text"
                    value={settings.model}
                    onChange={(e) => onUpdateSettings({ model: e.target.value })}
                    className="w-full bg-[#151518] border border-[#27272A] rounded-lg p-2.5 text-cy-text-primary focus:outline-none focus:border-cy-accent"
                  />
                </div>

                <div>
                  <label className="text-cy-text-secondary block mb-1.5 font-semibold">
                    Temperature ({settings.temperature})
                  </label>
                  <input
                    type="range"
                    min={0.0}
                    max={1.0}
                    step={0.05}
                    value={settings.temperature}
                    onChange={(e) => onUpdateSettings({ temperature: Number(e.target.value) })}
                    className="w-full accent-cy-accent"
                  />
                </div>

                <div>
                  <label className="text-cy-text-secondary block mb-1.5 font-semibold">
                    Context Window ({settings.contextLength} tokens)
                  </label>
                  <select
                    value={settings.contextLength}
                    onChange={(e) => onUpdateSettings({ contextLength: Number(e.target.value) })}
                    className="w-full bg-[#151518] border border-[#27272A] rounded-lg p-2.5 text-cy-text-primary focus:outline-none focus:border-cy-accent"
                  >
                    <option value={4096}>4,096 tokens (Fast)</option>
                    <option value={8192}>8,192 tokens (Standard)</option>
                    <option value={16384}>16,384 tokens (High)</option>
                    <option value={32768}>32,768 tokens (Full Context)</option>
                  </select>
                </div>
              </div>
            )}

            {/* Ollama Server Tab */}
            {activeTab === 'ollama' && (
              <div className="space-y-4 text-xs font-mono">
                <div>
                  <label className="text-cy-text-secondary block mb-1.5 font-semibold">
                    Ollama Server Endpoint
                  </label>
                  <input
                    type="text"
                    value={settings.ollamaUrl}
                    onChange={(e) => onUpdateSettings({ ollamaUrl: e.target.value })}
                    placeholder="http://localhost:11434"
                    className="w-full bg-[#151518] border border-[#27272A] rounded-lg p-2.5 text-cy-text-primary focus:outline-none focus:border-cy-accent"
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-[#151518] border border-[#27272A]">
                  <div>
                    <span className="text-cy-text-primary font-semibold block">Connection Status</span>
                    <span className="text-[11px] text-cy-text-muted">
                      {ollamaStatus === 'connected' ? 'Connected to local server' : 'Server not detected'}
                    </span>
                  </div>
                  <button
                    onClick={handleTestConnection}
                    disabled={testingUrl}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-cy-accent hover:bg-cy-accent-hover text-white text-xs font-semibold"
                  >
                    {testingUrl ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                    <span>Test Connection</span>
                  </button>
                </div>

                {testResult && (
                  <div
                    className={`p-3 rounded-lg text-xs ${
                      testResult.includes('Successfully')
                        ? 'bg-emerald-950/60 border border-emerald-800 text-emerald-300'
                        : 'bg-rose-950/60 border border-rose-800 text-rose-300'
                    }`}
                  >
                    {testResult}
                  </div>
                )}
              </div>
            )}

            {/* About Tab */}
            {activeTab === 'about' && (
              <div className="space-y-4 text-xs font-mono">
                <div className="p-4 rounded-xl bg-[#0A0A0B] border border-[#27272A] text-center space-y-2">
                  <h3 className="text-base font-bold text-cy-text-primary">MR.CYPHER</h3>
                  <p className="text-cy-accent-light font-semibold">Your Code. Your Machine. Your AI.</p>
                  <p className="text-[11px] text-cy-text-muted leading-relaxed">
                    Designed as a modern developer workstation pairing local machine intelligence with professional code editing capability.
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-[#151518] border border-[#27272A] flex items-center gap-3">
                  <ShieldCheck className="w-6 h-6 text-emerald-400 shrink-0" />
                  <div>
                    <span className="font-semibold text-cy-text-primary block">100% Local Privacy</span>
                    <span className="text-[11px] text-cy-text-muted">
                      No external API keys required. Your code never leaves your computer.
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-[#27272A] flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-cy-accent text-white rounded-lg text-xs font-mono font-semibold hover:bg-cy-accent-hover"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
