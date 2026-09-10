import React, { useState } from 'react';
import type { Conversation } from '../types/chat';
import { Search, MessageSquare, X } from 'lucide-react';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  conversations: Conversation[];
  onSelectConversation: (id: string) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  conversations,
  onSelectConversation,
}) => {
  const [query, setQuery] = useState('');

  if (!isOpen) return null;

  const filtered = conversations.filter(
    (c) =>
      c.title.toLowerCase().includes(query.toLowerCase()) ||
      c.messages.some((m) => m.content.toLowerCase().includes(query.toLowerCase()))
  );

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-start justify-center pt-20 z-50 p-4 select-none animate-fade-in">
      <div className="bg-[#111113] border border-[#27272A] rounded-xl w-full max-w-xl overflow-hidden shadow-cy-panel flex flex-col">
        {/* Search Input Bar */}
        <div className="p-3 border-b border-[#27272A] flex items-center gap-3 bg-[#0A0A0B]">
          <Search className="w-4 h-4 text-cy-accent-light shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search all conversations, code snippets, and prompts..."
            autoFocus
            className="w-full bg-transparent text-xs font-mono text-cy-text-primary focus:outline-none placeholder:text-cy-text-muted"
          />
          <button onClick={onClose} className="p-1 text-cy-text-muted hover:text-cy-text-primary">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search Results */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1 font-mono text-xs">
          {filtered.length === 0 ? (
            <div className="p-6 text-center text-cy-text-muted">
              No matching conversations found for "{query}"
            </div>
          ) : (
            filtered.map((c) => (
              <button
                key={c.id}
                onClick={() => {
                  onSelectConversation(c.id);
                  onClose();
                }}
                className="w-full flex items-center justify-between p-2.5 rounded-lg hover:bg-[#151518] text-left transition-colors group"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <MessageSquare className="w-4 h-4 text-cy-text-muted group-hover:text-cy-accent-light shrink-0" />
                  <div className="truncate">
                    <div className="text-cy-text-primary font-semibold truncate">{c.title}</div>
                    <div className="text-[10px] text-cy-text-muted truncate">
                      {c.messages.length} messages • Model: {c.model}
                    </div>
                  </div>
                </div>
                <span className="text-[10px] text-cy-text-muted shrink-0">
                  {new Date(c.updatedAt).toLocaleDateString()}
                </span>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
