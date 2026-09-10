import React, { useState, useRef, useEffect } from 'react';
import { Send, Square, Paperclip, X, Slash, Trash2, Cpu, FileCode, UploadCloud, Hash } from 'lucide-react';
import type { ProjectFile, SlashCommand } from '../types/chat';
import { SlashCommandMenu } from './SlashCommandMenu';

interface ChatInputProps {
  onSendMessage: (content: string) => void;
  isGenerating: boolean;
  onStopGeneration: () => void;
  attachedFiles: ProjectFile[];
  onRemoveFile: (fileId: string) => void;
  onFilesDropped: (files: FileList | File[]) => void;
  onClearConversation: () => void;
  currentModel: string;
  onModelSelectClick: () => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  isGenerating,
  onStopGeneration,
  attachedFiles,
  onRemoveFile,
  onFilesDropped,
  onClearConversation,
  currentModel,
  onModelSelectClick,
}) => {
  const [prompt, setPrompt] = useState('');
  const [showCommandsMenu, setShowCommandsMenu] = useState(false);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-grow textarea height
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  }, [prompt]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setPrompt(val);

    if (val.trim() === '/') {
      setShowCommandsMenu(true);
    } else if (!val.startsWith('/')) {
      setShowCommandsMenu(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    } else if (e.key === 'Escape') {
      setShowCommandsMenu(false);
    }
  };

  const handleSend = () => {
    if (isGenerating) {
      onStopGeneration();
      return;
    }

    if (prompt.trim() !== '') {
      onSendMessage(prompt);
      setPrompt('');
      setShowCommandsMenu(false);
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleSelectSlashCommand = (cmd: SlashCommand) => {
    setPrompt(`${cmd.command} `);
    setShowCommandsMenu(false);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFilesDropped(e.target.files);
    }
  };

  // Drag & Drop Handlers for file attachments
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFilesDropped(e.dataTransfer.files);
    }
  };

  const estimatedTokens = Math.ceil(prompt.length / 4);

  return (
    <div className="relative max-w-4xl mx-auto w-full px-4 pb-4 pt-2">
      {/* Hidden File Dialog Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileInputChange}
        multiple
        className="hidden"
      />

      {/* Slash Command Menu Popover */}
      {showCommandsMenu && (
        <SlashCommandMenu
          onSelectCommand={handleSelectSlashCommand}
          onClose={() => setShowCommandsMenu(false)}
        />
      )}

      {/* Main Input Container with Drag & Drop */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative rounded-xl bg-[#111113] border transition-all duration-200 ${
          isDraggingOver
            ? 'border-cy-accent ring-2 ring-cy-accent/60 bg-cy-accent-subtle/30 shadow-[0_0_20px_rgba(99,102,241,0.3)]'
            : 'border-[#27272A] focus-within:border-cy-accent focus-within:ring-1 focus-within:ring-cy-accent/40 shadow-cy-input'
        }`}
      >
        {/* Drag Over Hint Overlay */}
        {isDraggingOver && (
          <div className="absolute inset-0 bg-[#0A0A0B]/90 backdrop-blur-sm rounded-xl z-20 flex items-center justify-center gap-2 text-cy-accent-light font-mono text-xs font-semibold pointer-events-none">
            <UploadCloud className="w-5 h-5 animate-bounce" />
            <span>Drop local files here to attach as AI context...</span>
          </div>
        )}

        {/* Context File Chips Header Bar */}
        {attachedFiles.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap px-3 pt-2.5 pb-1 border-b border-[#27272A]/50">
            <span className="text-[10px] font-mono text-cy-text-muted uppercase tracking-wider mr-1">
              Attached Context ({attachedFiles.length}):
            </span>
            {attachedFiles.map((file) => (
              <div
                key={file.id}
                className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[#151518] border border-[#27272A] text-xs font-mono text-cy-text-secondary group hover:border-cy-accent-border transition-colors"
              >
                <FileCode className="w-3 h-3 text-cy-accent-light" />
                <span className="truncate max-w-[120px]">{file.name}</span>
                <button
                  onClick={() => onRemoveFile(file.id)}
                  className="text-cy-text-muted hover:text-rose-400 ml-0.5"
                  title="Remove file context"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Textarea Input */}
        <textarea
          ref={textareaRef}
          value={prompt}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Ask MR.CYPHER anything or query your dropped files... (Type / for commands)"
          rows={1}
          className="w-full bg-transparent text-cy-text-primary text-xs sm:text-sm p-3.5 focus:outline-none resize-none placeholder:text-cy-text-muted font-sans leading-relaxed min-h-[44px]"
        />

        {/* Input Footer Toolbar */}
        <div className="flex items-center justify-between px-3 pb-2.5 pt-1 border-t border-transparent select-none">
          <div className="flex items-center gap-1">
            {/* Attach File Button */}
            <button
              onClick={() => fileInputRef.current?.click()}
              title="Drag & Drop or click to attach local code files"
              className="flex items-center gap-1 px-2 py-1 rounded-md text-xs font-mono text-cy-text-muted hover:text-cy-text-primary hover:bg-[#1F1F23] transition-colors"
            >
              <Paperclip className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Attach File</span>
            </button>

            {/* Slash Commands Button */}
            <button
              onClick={() => setShowCommandsMenu(!showCommandsMenu)}
              title="View slash commands"
              className="flex items-center gap-1 px-2 py-1 rounded-md text-xs font-mono text-cy-text-muted hover:text-cy-text-primary hover:bg-[#1F1F23] transition-colors"
            >
              <Slash className="w-3.5 h-3.5 text-cy-accent-light" />
              <span className="hidden sm:inline">/commands</span>
            </button>

            {/* Clear Conversation */}
            <button
              onClick={onClearConversation}
              title="Clear active chat"
              className="p-1 rounded-md text-cy-text-muted hover:text-rose-400 hover:bg-[#1F1F23] transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            {/* Live Token Estimator */}
            {prompt.length > 0 && (
              <div className="hidden sm:flex items-center gap-1 px-2 py-0.5 rounded bg-[#151518] border border-[#27272A] text-[10px] font-mono text-cy-text-muted">
                <Hash className="w-3 h-3 text-cy-accent-light" />
                <span>{prompt.length} chars • ~{estimatedTokens} tokens</span>
              </div>
            )}

            {/* Model Pill */}
            <button
              onClick={onModelSelectClick}
              className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-[#151518] border border-[#27272A] text-[11px] font-mono text-cy-text-secondary hover:border-cy-accent-border transition-colors"
            >
              <Cpu className="w-3 h-3 text-cy-accent-light" />
              <span className="truncate max-w-[110px]">{currentModel}</span>
            </button>

            {/* Send or Stop Generation Button */}
            {isGenerating ? (
              <button
                onClick={onStopGeneration}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-950/80 border border-rose-800/80 text-rose-300 text-xs font-medium hover:bg-rose-900 transition-all shadow-sm"
              >
                <Square className="w-3.5 h-3.5 fill-current animate-pulse" />
                <span>Stop</span>
              </button>
            ) : (
              <button
                onClick={handleSend}
                disabled={prompt.trim() === ''}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all shadow-sm ${
                  prompt.trim() !== ''
                    ? 'bg-cy-accent hover:bg-cy-accent-hover text-white cursor-pointer active:scale-95 shadow-cy-glow'
                    : 'bg-[#1F1F23] text-cy-text-muted cursor-not-allowed border border-[#27272A]'
                }`}
              >
                <span>Send</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
