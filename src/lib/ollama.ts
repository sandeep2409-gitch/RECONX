import type { OllamaModel, Message } from '../types/chat';

export function getSystemOllamaUrl(): string {
  if (
    typeof window !== 'undefined' &&
    window.location.hostname &&
    window.location.hostname !== 'localhost' &&
    window.location.hostname !== '127.0.0.1'
  ) {
    return `http://${window.location.hostname}:11434`;
  }
  return 'http://localhost:11434';
}

export const DEFAULT_OLLAMA_URL = getSystemOllamaUrl();

export const DEFAULT_MODELS: OllamaModel[] = [
  { name: 'mr-cypher', parameter_size: '7B', family: 'cypher' },
  { name: 'Qwen2.5-Coder 3B', parameter_size: '3B', family: 'qwen' },
  { name: 'Qwen2.5-Coder 1.5B', parameter_size: '1.5B', family: 'qwen' },
  { name: 'Llama 3.2 3B', parameter_size: '3B', family: 'llama' },
  { name: 'DeepSeek-Coder 6.7B', parameter_size: '6.7B', family: 'deepseek' },
];

export async function checkOllamaStatus(baseUrl: string = DEFAULT_OLLAMA_URL): Promise<boolean> {
  try {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), 2500);
    const response = await fetch(`${baseUrl}/api/version`, {
      method: 'GET',
      signal: controller.signal,
    });
    clearTimeout(id);
    return response.ok;
  } catch {
    return false;
  }
}

export async function getOllamaModels(baseUrl: string = DEFAULT_OLLAMA_URL): Promise<OllamaModel[]> {
  try {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), 3000);
    const response = await fetch(`${baseUrl}/api/tags`, {
      method: 'GET',
      signal: controller.signal,
    });
    clearTimeout(id);
    if (!response.ok) return DEFAULT_MODELS;
    const data = await response.json();
    if (data.models && Array.isArray(data.models) && data.models.length > 0) {
      const fetched = data.models.map((m: any) => ({
        name: m.name,
        size: m.size,
        modified_at: m.modified_at,
        parameter_size: m.details?.parameter_size || '7B',
        family: m.details?.family || 'coder',
      }));
      if (!fetched.some((f: any) => f.name.toLowerCase() === 'mr-cypher')) {
        return [{ name: 'mr-cypher', parameter_size: '7B', family: 'cypher' }, ...fetched];
      }
      return fetched;
    }
    return DEFAULT_MODELS;
  } catch {
    return DEFAULT_MODELS;
  }
}

export async function streamOllamaChatResponse(
  baseUrl: string,
  model: string,
  messages: Message[],
  systemPrompt: string,
  onToken: (token: string) => void,
  onComplete: (fullText: string, tokenCount: number) => void,
  onError: (error: Error) => void,
  signal?: AbortSignal
): Promise<void> {
  try {
    const formattedMessages = [
      { role: 'system', content: systemPrompt },
      ...messages.map((m) => ({ role: m.role, content: m.content })),
    ];

    const response = await fetch(`${baseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: model.toLowerCase().replace(/\s+/g, ':'),
        messages: formattedMessages,
        stream: true,
      }),
      signal,
    });

    if (!response.ok) {
      throw new Error(`Ollama server returned status ${response.status}`);
    }

    if (!response.body) {
      throw new Error('No readable stream returned by Ollama server');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let fullText = '';
    let tokenCount = 0;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n').filter((l) => l.trim() !== '');

      for (const line of lines) {
        try {
          const json = JSON.parse(line);
          if (json.message?.content) {
            const contentChunk = json.message.content;
            fullText += contentChunk;
            tokenCount += 1;
            onToken(contentChunk);
          }
        } catch {
          // Ignore partial line JSON errors during chunking
        }
      }
    }

    onComplete(fullText, tokenCount);
  } catch (err: any) {
    if (err.name === 'AbortError') {
      return;
    }
    onError(err);
  }
}
