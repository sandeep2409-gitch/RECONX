import React, { useState } from 'react';
import type { Message } from '../types/chat';
import { CodeBlock } from './CodeBlock';
import { Bot, User, Copy, Check, RotateCw, Edit3, ArrowRight, ShieldCheck } from 'lucide-react';

interface ChatMessageProps {
  message: Message;
  onRegenerate?: () => void;
  onEdit?: (newContent: string) => void;
  onContinue?: () => void;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  onRegenerate,
  onEdit,
  onContinue,
}) => {
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(message.content);

  const isUser = message.role === 'user';

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveEdit = () => {
    if (onEdit && editValue.trim() !== '') {
      onEdit(editValue);
      setIsEditing(false);
    }
  };

  // Simple Markdown Parser for Assistant Responses
  const renderFormattedContent = (content: string) => {
    const parts = content.split(/(```[\s\S]*?```)/g);

    return parts.map((part, index) => {
      if (part.startsWith('```') && part.endsWith('```')) {
        const firstLineEnd = part.indexOf('\n');
        const lang = part.substring(3, firstLineEnd).trim();
        const code = part.substring(firstLineEnd + 1, part.length - 3);
        return <CodeBlock key={index} language={lang} code={code} />;
      }

      // Render lines & inline markup
      const paragraphs = part.split('\n\n');
      return (
        <div key={index} className="space-y-3">
          {paragraphs.map((p, pIdx) => {
            if (!p.trim()) return null;

            // GitHub Alert checks
            if (p.includes('[!NOTE]') || p.includes('[!IMPORTANT]') || p.includes('[!WARNING]')) {
              return (
                <div key={pIdx} className="my-3 p-3 rounded-lg border border-cy-accent-border bg-cy-accent-subtle text-cy-text-primary text-xs flex gap-2.5 items-start">
                  <ShieldCheck className="w-4 h-4 text-cy-accent-light shrink-0 mt-0.5" />
                  <div>{p.replace(/ opacity:.*|>\s*\[!.*?\]/g, '').trim()}</div>
                </div>
              );
            }

            // Headings
            if (p.startsWith('### ')) {
              return <h3 key={pIdx} className="text-sm font-semibold text-cy-text-primary mt-4 mb-1">{p.replace('### ', '')}</h3>;
            }
            if (p.startsWith('## ')) {
              return <h2 key={pIdx} className="text-base font-semibold text-cy-text-primary mt-5 mb-2">{p.replace('## ', '')}</h2>;
            }

            // Bullet lists
            if (p.includes('\n- ') || p.startsWith('- ')) {
              const listItems = p.split('\n').filter(line => line.trim().startsWith('- '));
              return (
                <ul key={pIdx} className="list-disc list-inside space-y-1 text-cy-text-secondary text-xs pl-2">
                  {listItems.map((item, lIdx) => (
                    <li key={lIdx}>{item.replace(/^- /, '')}</li>
                  ))}
                </ul>
              );
            }

            // Paragraph text with inline code blocks
            const inlineParts = p.split(/(`[^`]+`)/g);
            return (
              <p key={pIdx} className="text-xs leading-relaxed text-cy-text-secondary">
                {inlineParts.map((ip, ipIdx) => {
                  if (ip.startsWith('`') && ip.endsWith('`')) {
                    return (
                      <code key={ipIdx} className="px-1.5 py-0.5 rounded bg-[#1F1F23] border border-[#27272A] text-cy-accent-light font-mono text-[11px]">
                        {ip.slice(1, -1)}
                      </code>
                    );
                  }
                  return ip;
                })}
              </p>
            );
          })}
        </div>
      );
    });
  };

  return (
    <div className={`py-4 px-4 sm:px-6 transition-colors ${isUser ? 'bg-[#0A0A0B]' : 'bg-[#111113]/70 border-y border-[#27272A]/40'}`}>
      <div className="max-w-4xl mx-auto flex gap-4">
        {/* Avatar */}
        <div className="shrink-0 mt-0.5 select-none">
          {isUser ? (
            <div className="w-7 h-7 rounded-lg bg-[#1F1F23] border border-[#27272A] flex items-center justify-center text-cy-text-secondary">
              <User className="w-4 h-4" />
            </div>
          ) : (
            <div className="w-7 h-7 rounded-lg bg-cy-accent-subtle border border-cy-accent-border flex items-center justify-center text-cy-accent-light shadow-sm">
              <Bot className="w-4 h-4" />
            </div>
          )}
        </div>

        {/* Content Body */}
        <div className="flex-1 min-w-0 space-y-2">
          {/* Header Metadata */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-semibold text-cy-text-primary">
                {isUser ? 'You' : 'MR.CYPHER'}
              </span>
              {!isUser && message.model && (
                <span className="text-[10px] font-mono px-1.5 py-0.2 bg-[#151518] border border-[#27272A] text-cy-text-muted rounded">
                  {message.model}
                </span>
              )}
            </div>

            {/* Timestamp */}
            <span className="text-[10px] font-mono text-cy-text-muted">
              {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>

          {/* User Message Edit Mode or Display */}
          {isEditing ? (
            <div className="space-y-2 mt-2">
              <textarea
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                className="w-full bg-[#151518] border border-cy-accent-border rounded-lg p-3 text-xs text-cy-text-primary font-mono focus:outline-none focus:ring-1 focus:ring-cy-accent"
                rows={3}
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-2.5 py-1 text-xs text-cy-text-muted hover:text-cy-text-primary"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="px-3 py-1 bg-cy-accent text-white rounded text-xs hover:bg-cy-accent-hover font-medium"
                >
                  Save & Resend
                </button>
              </div>
            </div>
          ) : (
            <div className="prose prose-invert max-w-none text-xs leading-relaxed text-cy-text-primary">
              {renderFormattedContent(message.content)}
            </div>
          )}

          {/* Message Action Toolbar */}
          <div className="pt-2 flex items-center justify-between text-cy-text-muted border-t border-transparent hover:border-[#27272A]/30 transition-colors">
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                title="Copy response"
                className="flex items-center gap-1 text-[11px] hover:text-cy-text-primary px-1.5 py-0.5 rounded hover:bg-[#151518] transition-colors"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>

              {!isUser && onRegenerate && (
                <button
                  onClick={onRegenerate}
                  title="Regenerate response"
                  className="flex items-center gap-1 text-[11px] hover:text-cy-text-primary px-1.5 py-0.5 rounded hover:bg-[#151518] transition-colors"
                >
                  <RotateCw className="w-3 h-3" />
                  <span>Regenerate</span>
                </button>
              )}

              {isUser && (
                <button
                  onClick={() => setIsEditing(true)}
                  title="Edit prompt"
                  className="flex items-center gap-1 text-[11px] hover:text-cy-text-primary px-1.5 py-0.5 rounded hover:bg-[#151518] transition-colors"
                >
                  <Edit3 className="w-3 h-3" />
                  <span>Edit</span>
                </button>
              )}

              {!isUser && onContinue && (
                <button
                  onClick={onContinue}
                  title="Continue generation"
                  className="flex items-center gap-1 text-[11px] hover:text-cy-text-primary px-1.5 py-0.5 rounded hover:bg-[#151518] transition-colors"
                >
                  <ArrowRight className="w-3 h-3" />
                  <span>Continue</span>
                </button>
              )}
            </div>

            {message.tokens && (
              <span className="text-[10px] font-mono text-cy-text-muted/70">
                {message.tokens} tokens
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
