import { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { EmptyState } from './components/EmptyState';
import { ChatMessage } from './components/ChatMessage';
import { ChatInput } from './components/ChatInput';
import { RightContextPanel } from './components/RightContextPanel';
import { SettingsModal } from './components/SettingsModal';
import { SetupScreen } from './components/SetupScreen';
import { SearchModal } from './components/SearchModal';
import { useOllama } from './hooks/useOllama';
import { useChat } from './hooks/useChat';
import { getSystemOllamaUrl } from './lib/ollama';
import type { AppSettings } from './types/chat';

export function App() {
  const [showSetup, setShowSetup] = useState<boolean>(() => {
    return !localStorage.getItem('mrcypher_setup_completed');
  });

  const [settings, setSettings] = useState<AppSettings>({
    ollamaUrl: getSystemOllamaUrl(),
    model: 'mr-cypher',
    temperature: 0.2,
    contextLength: 32768,
    theme: 'dark',
    fontSize: 13,
    sidebarCollapsed: false,
    rightPanelOpen: false,
    rightPanelTab: 'context',
  });

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);

  const globalFileInputRef = useRef<HTMLInputElement>(null);

  const { ollamaStatus, models, selectedModel, setSelectedModel, refreshOllama } =
    useOllama(settings.ollamaUrl);

  const {
    conversations,
    activeConversationId,
    setActiveConversationId,
    activeConversation,
    createNewChat,
    deleteConversation,
    toggleFavorite,
    sendMessage,
    isGenerating,
    stopGeneration,
    attachedFiles,
    addFiles,
    removeFile,
    telemetry,
  } = useChat(ollamaStatus, settings.ollamaUrl, selectedModel);

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat to bottom on new message / streaming
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeConversation?.messages]);

  // Global Keyboard Shortcuts (Cmd+K, Cmd+N, Esc)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      } else if ((e.metaKey || e.ctrlKey) && e.key === 'n') {
        e.preventDefault();
        createNewChat();
      } else if (e.key === 'Escape') {
        setSearchOpen(false);
        setSettingsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [createNewChat]);

  // Global Window Drag & Drop file attachment
  const handleGlobalDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  };

  const handleGlobalDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  };

  const handleGlobalDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      addFiles(e.dataTransfer.files);
    }
  };

  const handleStartCoding = () => {
    localStorage.setItem('mrcypher_setup_completed', 'true');
    setShowSetup(false);
  };

  const handleUpdateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  return (
    <div
      onDragOver={handleGlobalDragOver}
      onDragLeave={handleGlobalDragLeave}
      onDrop={handleGlobalDrop}
      className="h-screen w-screen flex flex-col bg-[#0A0A0B] text-cy-text-primary overflow-hidden font-sans relative"
    >
      {/* Hidden Global File Picker */}
      <input
        type="file"
        ref={globalFileInputRef}
        onChange={(e) => e.target.files && addFiles(e.target.files)}
        multiple
        className="hidden"
      />

      {/* Global Drag & Drop Overlay */}
      {isDragActive && (
        <div className="fixed inset-0 bg-[#0A0A0B]/90 backdrop-blur-md z-50 flex flex-col items-center justify-center border-4 border-dashed border-cy-accent text-cy-accent-light space-y-3 pointer-events-none animate-fade-in">
          <div className="w-16 h-16 rounded-2xl bg-cy-accent-subtle border border-cy-accent-border flex items-center justify-center">
            <span className="text-3xl animate-bounce">📁</span>
          </div>
          <h2 className="text-xl font-bold font-mono text-cy-text-primary">
            Drop Code Files to Attach Context
          </h2>
          <p className="text-xs font-mono text-cy-text-secondary">
            Files will be read locally on device (100% Offline & Private)
          </p>
        </div>
      )}

      {/* Onboarding / Setup Splash Overlay */}
      {showSetup && (
        <SetupScreen
          ollamaStatus={ollamaStatus}
          currentModel={selectedModel}
          onStartCoding={handleStartCoding}
        />
      )}

      {/* App Header */}
      <Header
        ollamaStatus={ollamaStatus}
        models={models}
        selectedModel={selectedModel}
        onSelectModel={setSelectedModel}
        rightPanelOpen={settings.rightPanelOpen}
        onToggleRightPanel={() =>
          handleUpdateSettings({ rightPanelOpen: !settings.rightPanelOpen })
        }
        onOpenSearch={() => setSearchOpen(true)}
        onRefreshModels={refreshOllama}
      />

      {/* Main 3-Zone Developer Workspace */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Zone: Sidebar */}
        <Sidebar
          collapsed={settings.sidebarCollapsed}
          onToggleCollapse={() =>
            handleUpdateSettings({ sidebarCollapsed: !settings.sidebarCollapsed })
          }
          conversations={conversations}
          activeConversationId={activeConversationId}
          onSelectConversation={setActiveConversationId}
          onNewChat={createNewChat}
          onDeleteConversation={deleteConversation}
          onToggleFavorite={toggleFavorite}
          ollamaStatus={ollamaStatus}
          currentModel={selectedModel}
          onOpenSettings={() => setSettingsOpen(true)}
          onOpenAbout={() => setSettingsOpen(true)}
          onOpenSearch={() => setSearchOpen(true)}
        />

        {/* Center Zone: Main Chat Workspace */}
        <main className="flex-1 flex flex-col h-full bg-[#0A0A0B] overflow-hidden relative">
          <div className="flex-1 flex flex-col h-full overflow-hidden">
            {/* Either Empty State OR Message History Feed */}
            {!activeConversation || activeConversation.messages.length === 0 ? (
              <EmptyState onSelectPrompt={(prompt) => sendMessage(prompt)} />
            ) : (
              <div className="flex-1 overflow-y-auto space-y-1">
                {activeConversation.messages.map((message) => (
                  <ChatMessage
                    key={message.id}
                    message={message}
                    onRegenerate={() => {
                      const lastUserMsg = activeConversation.messages
                        .filter((m) => m.role === 'user')
                        .pop();
                      if (lastUserMsg) {
                        sendMessage(lastUserMsg.content);
                      }
                    }}
                  />
                ))}

                {/* AI Thinking Indicator */}
                {isGenerating && (
                  <div className="py-4 px-6 bg-[#111113]/70 border-y border-[#27272A]/40 animate-fade-in">
                    <div className="max-w-4xl mx-auto flex items-center gap-3 text-xs font-mono text-cy-accent-light">
                      <span className="w-2 h-2 rounded-full bg-cy-accent animate-ping" />
                      <span>MR.CYPHER is analyzing context & synthesizing answer...</span>
                    </div>
                  </div>
                )}

                <div ref={chatEndRef} />
              </div>
            )}

            {/* Chat Input Bar Fixed at Bottom */}
            <ChatInput
              onSendMessage={sendMessage}
              isGenerating={isGenerating}
              onStopGeneration={stopGeneration}
              attachedFiles={attachedFiles}
              onRemoveFile={removeFile}
              onFilesDropped={addFiles}
              onClearConversation={createNewChat}
              currentModel={selectedModel}
              onModelSelectClick={() => {}}
            />
          </div>
        </main>

        {/* Right Zone: Right Context Panel */}
        <RightContextPanel
          isOpen={settings.rightPanelOpen}
          onClose={() => handleUpdateSettings({ rightPanelOpen: false })}
          activeTab={settings.rightPanelTab}
          onTabChange={(tab) => handleUpdateSettings({ rightPanelTab: tab })}
          currentModel={selectedModel}
          ollamaStatus={ollamaStatus}
          attachedFiles={attachedFiles}
          onRemoveFile={removeFile}
          onAttachFileClick={() => globalFileInputRef.current?.click()}
          telemetry={telemetry}
        />
      </div>

      {/* Global Search Modal */}
      <SearchModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        conversations={conversations}
        onSelectConversation={setActiveConversationId}
      />

      {/* Settings & About Modal */}
      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
        ollamaStatus={ollamaStatus}
        onRefreshOllamaStatus={refreshOllama}
      />
    </div>
  );
}

export default App;
