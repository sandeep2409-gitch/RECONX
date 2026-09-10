import { useState, useEffect, useCallback } from 'react';
import type { OllamaModel, OllamaStatus } from '../types/chat';
import { checkOllamaStatus, getOllamaModels, DEFAULT_MODELS, DEFAULT_OLLAMA_URL } from '../lib/ollama';

export function useOllama(ollamaUrl: string = DEFAULT_OLLAMA_URL) {
  const [ollamaStatus, setOllamaStatus] = useState<OllamaStatus>('checking');
  const [models, setModels] = useState<OllamaModel[]>(DEFAULT_MODELS);
  const [selectedModel, setSelectedModel] = useState<string>('mr-cypher');

  const checkStatus = useCallback(async () => {
    setOllamaStatus('checking');
    const isOnline = await checkOllamaStatus(ollamaUrl);
    if (isOnline) {
      setOllamaStatus('connected');
      const fetchedModels = await getOllamaModels(ollamaUrl);
      setModels(fetchedModels);
    } else {
      setOllamaStatus('offline');
      setModels(DEFAULT_MODELS);
    }
  }, [ollamaUrl]);

  useEffect(() => {
    checkStatus();
    const interval = setInterval(checkStatus, 30000); // Periodic health check
    return () => clearInterval(interval);
  }, [checkStatus]);

  return {
    ollamaStatus,
    models,
    selectedModel,
    setSelectedModel,
    refreshOllama: checkStatus,
  };
}
