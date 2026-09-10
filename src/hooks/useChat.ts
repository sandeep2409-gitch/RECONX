import { useState, useEffect, useRef, useCallback } from 'react';
import type { Conversation, Message, ProjectFile, TelemetryState, OllamaStatus } from '../types/chat';
import { streamOllamaChatResponse } from '../lib/ollama';
import { generateMockStreamResponse } from '../lib/mockEngine';

const STORAGE_KEY = 'mrcypher_conversations_v1';

const DEFAULT_PROJECT_FILES: ProjectFile[] = [
  {
    id: 'f1',
    name: 'main.py',
    path: '/my-project/main.py',
    language: 'python',
    size: 1420,
    content: `from fastapi import FastAPI, Depends, HTTPException
import uvicorn
from scanner import CyberScanner

app = FastAPI(title="MR.CYPHER Local Scanner")
scanner = CyberScanner()

@app.get("/scan")
async def run_scan(target: str = "127.0.0.1"):
    return await scanner.scan_target(target)

if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)`,
  },
  {
    id: 'f2',
    name: 'scanner.py',
    path: '/my-project/scanner.py',
    language: 'python',
    size: 2150,
    content: `import asyncio
import socket
from typing import List, Dict

class CyberScanner:
    def __init__(self, timeout: float = 1.5):
        self.timeout = timeout

    async def scan_target(self, target: str, ports: List[int] = [80, 443, 8000, 11434]) -> Dict:
        results = {}
        for port in ports:
            is_open = await self._check_port(target, port)
            results[port] = "open" if is_open else "closed"
        return {"target": target, "ports": results}

    async def _check_port(self, target: str, port: int) -> bool:
        try:
            _, writer = await asyncio.wait_for(
                asyncio.open_connection(target, port),
                timeout=self.timeout
            )
            writer.close()
            await writer.wait_closed()
            return True
        except:
            return False`,
  },
];

function detectLanguage(fileName: string): string {
  const ext = fileName.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'py': return 'python';
    case 'js': return 'javascript';
    case 'ts':
    case 'tsx': return 'typescript';
    case 'json': return 'json';
    case 'html': return 'html';
    case 'css': return 'css';
    case 'sql': return 'sql';
    case 'sh':
    case 'bash': return 'bash';
    case 'md': return 'markdown';
    default: return 'text';
  }
}

export function useChat(
  ollamaStatus: OllamaStatus,
  ollamaUrl: string,
  selectedModel: string
) {
  const [conversations, setConversations] = useState<Conversation[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [attachedFiles, setAttachedFiles] = useState<ProjectFile[]>(DEFAULT_PROJECT_FILES);
  const [isGenerating, setIsGenerating] = useState(false);

  const [telemetry, setTelemetry] = useState<TelemetryState>({
    totalTokens: 1420,
    tokensPerSec: 38,
    latencyMs: 120,
    isGenerating: false,
    lastResponseTime: Date.now(),
  });

  const abortControllerRef = useRef<AbortController | null>(null);

  // Save conversations to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
    } catch {}
  }, [conversations]);

  const activeConversation = conversations.find((c) => c.id === activeConversationId) || null;

  const createNewChat = useCallback(() => {
    const newConv: Conversation = {
      id: `conv_${Date.now()}`,
      title: 'New Conversation',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      isFavorite: false,
      model: selectedModel,
      messages: [],
      attachedFiles: [],
    };
    setConversations((prev) => [newConv, ...prev]);
    setActiveConversationId(newConv.id);
    return newConv.id;
  }, [selectedModel]);

  const deleteConversation = useCallback((id: string) => {
    setConversations((prev) => prev.filter((c) => c.id !== id));
    if (activeConversationId === id) {
      setActiveConversationId(null);
    }
  }, [activeConversationId]);

  const toggleFavorite = useCallback((id: string) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isFavorite: !c.isFavorite } : c))
    );
  }, []);

  const addFiles = useCallback((fileList: FileList | File[]) => {
    const filesArray = Array.from(fileList);
    filesArray.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const textContent = e.target?.result as string || '';
        const newFile: ProjectFile = {
          id: `file_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          name: file.name,
          path: file.name,
          content: textContent,
          size: file.size,
          language: detectLanguage(file.name),
          isSelected: true,
        };
        setAttachedFiles((prev) => {
          // Avoid duplicate filenames
          const filtered = prev.filter((f) => f.name !== file.name);
          return [...filtered, newFile];
        });
      };
      reader.readAsText(file);
    });
  }, []);

  const removeFile = useCallback((fileId: string) => {
    setAttachedFiles((prev) => prev.filter((f) => f.id !== fileId));
  }, []);

  const updateFileContent = useCallback((fileId: string, content: string) => {
    setAttachedFiles((prev) =>
      prev.map((f) => (f.id === fileId ? { ...f, content, size: content.length } : f))
    );
  }, []);

  const stopGeneration = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsGenerating(false);
    setTelemetry((prev) => ({ ...prev, isGenerating: false }));
  }, []);

  const sendMessage = useCallback(
    async (content: string) => {
      let targetConvId = activeConversationId;
      let isFirstMessage = false;

      if (!targetConvId) {
        targetConvId = createNewChat();
        isFirstMessage = true;
      }

      const userMsgId = `msg_user_${Date.now()}`;
      const userMsg: Message = {
        id: userMsgId,
        role: 'user',
        content,
        timestamp: Date.now(),
      };

      const assistantMsgId = `msg_ast_${Date.now() + 1}`;
      const assistantMsg: Message = {
        id: assistantMsgId,
        role: 'assistant',
        content: '',
        timestamp: Date.now() + 1,
        model: selectedModel,
        status: 'streaming',
      };

      // Add user and initial empty assistant message
      setConversations((prev) =>
        prev.map((conv) => {
          if (conv.id === targetConvId) {
            const updatedMessages = [...conv.messages, userMsg, assistantMsg];
            const updatedTitle =
              isFirstMessage || conv.title === 'New Conversation'
                ? content.slice(0, 32) + (content.length > 32 ? '...' : '')
                : conv.title;
            return {
              ...conv,
              title: updatedTitle,
              updatedAt: Date.now(),
              messages: updatedMessages,
            };
          }
          return conv;
        })
      );

      setIsGenerating(true);
      const startTime = Date.now();
      abortControllerRef.current = new AbortController();

      const onToken = (token: string) => {
        setConversations((prev) =>
          prev.map((conv) => {
            if (conv.id === targetConvId) {
              const updatedMessages = conv.messages.map((m) =>
                m.id === assistantMsgId ? { ...m, content: m.content + token } : m
              );
              return { ...conv, messages: updatedMessages };
            }
            return conv;
          })
        );
      };

      const onComplete = (fullText: string, tokenCount: number) => {
        const elapsedTimeSec = Math.max((Date.now() - startTime) / 1000, 0.1);
        const tps = Math.round(tokenCount / elapsedTimeSec);

        setConversations((prev) =>
          prev.map((conv) => {
            if (conv.id === targetConvId) {
              return {
                ...conv,
                messages: conv.messages.map((m) =>
                  m.id === assistantMsgId
                    ? { ...m, content: fullText, status: 'complete', tokens: tokenCount }
                    : m
                ),
              };
            }
            return conv;
          })
        );

        setIsGenerating(false);
        setTelemetry((prev) => ({
          totalTokens: prev.totalTokens + tokenCount,
          tokensPerSec: tps > 0 ? tps : 36,
          latencyMs: Math.round(Date.now() - startTime),
          isGenerating: false,
          lastResponseTime: Date.now(),
        }));
      };

      const onError = (err: Error) => {
        setConversations((prev) =>
          prev.map((conv) => {
            if (conv.id === targetConvId) {
              return {
                ...conv,
                messages: conv.messages.map((m) =>
                  m.id === assistantMsgId
                    ? {
                        ...m,
                        content: `**Ollama Connection Error**: Could not generate response from model \`${selectedModel}\`.\n\n*Error details*: ${err.message}`,
                        status: 'error',
                      }
                    : m
                ),
              };
            }
            return conv;
          })
        );
        setIsGenerating(false);
      };

      // Construct system prompt with attached files context
      let systemPrompt = 'You are MR.CYPHER, a senior software architect and cybersecurity expert AI. Answer all user questions thoroughly, accurately, and safely.';
      if (attachedFiles.length > 0) {
        systemPrompt += '\n\nAttached Project Context Files:\n' +
          attachedFiles.map((f) => `--- File: ${f.name} (Language: ${f.language}) ---\n${f.content}`).join('\n\n');
      }

      if (ollamaStatus === 'connected') {
        const historyMessages = activeConversation
          ? [...activeConversation.messages, userMsg]
          : [userMsg];

        streamOllamaChatResponse(
          ollamaUrl,
          selectedModel,
          historyMessages,
          systemPrompt,
          onToken,
          onComplete,
          onError,
          abortControllerRef.current.signal
        );
      } else {
        // Fallback simulated local stream engine (reads attached files)
        generateMockStreamResponse(
          content,
          attachedFiles,
          onToken,
          onComplete,
          abortControllerRef.current.signal
        );
      }
    },
    [
      activeConversationId,
      activeConversation,
      createNewChat,
      selectedModel,
      attachedFiles,
      ollamaStatus,
      ollamaUrl,
    ]
  );

  return {
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
    updateFileContent,
    telemetry,
  };
}
