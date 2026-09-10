import React from 'react';
import type { Conversation, OllamaStatus } from '../types/chat';
import {
  Plus,
  Search,
  FolderGit2,
  MessageSquare,
  Star,
  Settings as SettingsIcon,
  Info,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Cpu,
} from 'lucide-react';

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  conversations: Conversation[];
  activeConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onNewChat: () => void;
  onDeleteConversation: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  ollamaStatus: OllamaStatus;
  currentModel: string;
  onOpenSettings: () => void;
  onOpenAbout: () => void;
  onOpenSearch: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  collapsed,
  onToggleCollapse,
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewChat,
  onDeleteConversation,
  onToggleFavorite,
  ollamaStatus,
  currentModel,
  onOpenSettings,
  onOpenAbout,
  onOpenSearch,
}) => {
  const favorites = conversations.filter((c) => c.isFavorite);
  const recent = conversations.filter((c) => !c.isFavorite);

  return (
    <aside
      className={`h-full bg-[#111113] border-r border-[#27272A] flex flex-col justify-between transition-all duration-300 z-20 select-none ${
        collapsed ? 'w-16' : 'w-60'
      }`}
    >
      {/* Sidebar Top: New Chat & Actions (No Duplicate Header) */}
      <div className="p-3 space-y-2.5">
        {/* Collapse Toggle Row */}
        <div className="flex items-center justify-between pb-1 border-b border-[#27272A]/40">
          {!collapsed && (
            <span className="text-[10px] font-mono font-bold text-cy-text-muted uppercase tracking-wider">
              WORKSPACE
            </span>
          )}
          <button
            onClick={onToggleCollapse}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="p-1 rounded-md text-cy-text-muted hover:text-cy-text-primary hover:bg-[#151518] transition-colors ml-auto"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* New Chat Primary Action */}
        <button
          onClick={onNewChat}
          className={`w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-cy-accent hover:bg-cy-accent-hover text-white text-xs font-mono font-semibold shadow-cy-glow transition-all active:scale-98 ${
            collapsed ? 'px-0' : ''
          }`}
          title="Create New Chat (Cmd+N)"
        >
          <Plus className="w-4 h-4" />
          {!collapsed && <span>New Chat</span>}
        </button>

        {/* Navigation Quick Actions */}
        <div className="space-y-0.5 pt-1">
          <button
            onClick={onOpenSearch}
            className={`w-full flex items-center gap-2.5 py-1.5 px-2.5 rounded-md text-xs font-mono text-cy-text-secondary hover:bg-[#151518] hover:text-cy-text-primary transition-colors ${
              collapsed ? 'justify-center' : ''
            }`}
            title="Search Chats (Cmd+K)"
          >
            <Search className="w-4 h-4 text-cy-text-muted" />
            {!collapsed && <span>Search</span>}
          </button>

          <button
            className={`w-full flex items-center gap-2.5 py-1.5 px-2.5 rounded-md text-xs font-mono text-cy-text-secondary hover:bg-[#151518] hover:text-cy-text-primary transition-colors ${
              collapsed ? 'justify-center' : ''
            }`}
            title="Projects"
          >
            <FolderGit2 className="w-4 h-4 text-cy-text-muted" />
            {!collapsed && <span>Projects</span>}
          </button>
        </div>
      </div>

      {/* Middle Section: Recent Chats & Favorites */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-4">
        {/* Favorites */}
        {favorites.length > 0 && (
          <div>
            {!collapsed && (
              <div className="px-2 mb-1.5 text-[10px] font-mono font-semibold text-cy-text-muted uppercase tracking-wider flex items-center gap-1">
                <Star className="w-3 h-3 text-amber-400 fill-amber-400/20" />
                <span>Favorites</span>
              </div>
            )}
            <div className="space-y-0.5">
              {favorites.map((c) => (
                <div
                  key={c.id}
                  onClick={() => onSelectConversation(c.id)}
                  className={`group relative flex items-center justify-between py-1.5 px-2.5 rounded-lg text-xs font-mono cursor-pointer transition-colors ${
                    activeConversationId === c.id
                      ? 'bg-cy-accent-subtle text-cy-accent-light font-semibold border border-cy-accent-border'
                      : 'text-cy-text-secondary hover:bg-[#151518] hover:text-cy-text-primary'
                  } ${collapsed ? 'justify-center' : ''}`}
                  title={c.title}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <MessageSquare className="w-3.5 h-3.5 shrink-0 text-cy-text-muted" />
                    {!collapsed && <span className="truncate">{c.title}</span>}
                  </div>
                  {!collapsed && (
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleFavorite(c.id);
                        }}
                        className="text-amber-400"
                        title="Unfavorite"
                      >
                        <Star className="w-3 h-3 fill-current" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Chats List */}
        <div>
          {!collapsed && (
            <div className="px-2 mb-1.5 text-[10px] font-mono font-semibold text-cy-text-muted uppercase tracking-wider">
              Recent Chats
            </div>
          )}
          <div className="space-y-0.5">
            {recent.length === 0 && favorites.length === 0 ? (
              !collapsed ? (
                <div className="px-2 py-4 text-center text-xs text-cy-text-muted font-mono">
                  No previous chats
                </div>
              ) : null
            ) : (
              recent.map((c) => (
                <div
                  key={c.id}
                  onClick={() => onSelectConversation(c.id)}
                  className={`group relative flex items-center justify-between py-1.5 px-2.5 rounded-lg text-xs font-mono cursor-pointer transition-colors ${
                    activeConversationId === c.id
                      ? 'bg-[#151518] text-cy-text-primary font-semibold border border-[#27272A]'
                      : 'text-cy-text-secondary hover:bg-[#151518] hover:text-cy-text-primary'
                  } ${collapsed ? 'justify-center' : ''}`}
                  title={c.title}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <MessageSquare className="w-3.5 h-3.5 shrink-0 text-cy-text-muted" />
                    {!collapsed && <span className="truncate">{c.title}</span>}
                  </div>
                  {!collapsed && (
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleFavorite(c.id);
                        }}
                        className="text-cy-text-muted hover:text-amber-400"
                        title="Favorite"
                      >
                        <Star className="w-3 h-3" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteConversation(c.id);
                        }}
                        className="text-cy-text-muted hover:text-rose-400"
                        title="Delete chat"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Bottom Section: Ollama Status & App Settings */}
      <div className="p-3 border-t border-[#27272A] space-y-2">
        {/* Ollama Status Box */}
        <div className="p-2.5 rounded-lg bg-[#151518] border border-[#27272A]">
          <div className="flex items-center justify-between text-xs font-mono mb-1">
            <div className="flex items-center gap-1.5">
              <span
                className={`w-2 h-2 rounded-full ${
                  ollamaStatus === 'connected'
                    ? 'bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.7)] animate-pulse'
                    : 'bg-rose-500'
                }`}
              />
              {!collapsed && (
                <span className="font-semibold text-cy-text-primary">
                  {ollamaStatus === 'connected' ? 'Connected' : 'Offline'}
                </span>
              )}
            </div>
            {!collapsed && (
              <span className="text-[10px] text-cy-text-muted">Ollama</span>
            )}
          </div>
          {!collapsed && (
            <div className="flex items-center gap-1 text-[11px] font-mono text-cy-text-secondary truncate mt-1">
              <Cpu className="w-3 h-3 text-cy-accent-light shrink-0" />
              <span className="truncate">{currentModel}</span>
            </div>
          )}
        </div>

        {/* Settings & About Actions */}
        <div className="space-y-0.5">
          <button
            onClick={onOpenSettings}
            className={`w-full flex items-center gap-2 py-1.5 px-2.5 rounded-md text-xs font-mono text-cy-text-secondary hover:bg-[#151518] hover:text-cy-text-primary transition-colors ${
              collapsed ? 'justify-center' : ''
            }`}
            title="Settings"
          >
            <SettingsIcon className="w-4 h-4 text-cy-text-muted" />
            {!collapsed && <span>Settings</span>}
          </button>
          <button
            onClick={onOpenAbout}
            className={`w-full flex items-center gap-2 py-1.5 px-2.5 rounded-md text-xs font-mono text-cy-text-secondary hover:bg-[#151518] hover:text-cy-text-primary transition-colors ${
              collapsed ? 'justify-center' : ''
            }`}
            title="About MR.CYPHER"
          >
            <Info className="w-4 h-4 text-cy-text-muted" />
            {!collapsed && <span>About</span>}
          </button>
        </div>
      </div>
    </aside>
  );
};
