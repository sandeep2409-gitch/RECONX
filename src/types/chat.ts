export type Role = 'user' | 'assistant' | 'system';

export interface CodeSnippet {
  language: string;
  code: string;
  filename?: string;
}

export interface Message {
  id: string;
  role: Role;
  content: string;
  timestamp: number;
  model?: string;
  tokens?: number;
  status?: 'sending' | 'streaming' | 'complete' | 'error';
  error?: string;
}

export interface ProjectFile {
  id: string;
  name: string;
  path: string;
  content: string;
  size: number;
  language: string;
  isSelected?: boolean;
}

export interface Conversation {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  isFavorite: boolean;
  model: string;
  messages: Message[];
  attachedFiles: ProjectFile[];
}

export interface OllamaModel {
  name: string;
  size?: number;
  modified_at?: string;
  parameter_size?: string;
  family?: string;
}

export type OllamaStatus = 'connected' | 'offline' | 'checking';

export interface SlashCommand {
  command: string;
  label: string;
  description: string;
  iconName: string;
}

export interface AppSettings {
  ollamaUrl: string;
  model: string;
  temperature: number;
  contextLength: number;
  theme: 'dark' | 'system';
  fontSize: number;
  sidebarCollapsed: boolean;
  rightPanelOpen: boolean;
  rightPanelTab: 'context' | 'files' | 'activity';
}

export interface TelemetryState {
  totalTokens: number;
  tokensPerSec: number;
  latencyMs: number;
  isGenerating: boolean;
  lastResponseTime: number;
}
