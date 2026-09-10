import type { ProjectFile } from '../types/chat';

export function generateMockStreamResponse(
  prompt: string,
  attachedFiles: ProjectFile[] = [],
  onToken: (token: string) => void,
  onComplete: (fullText: string, tokenCount: number) => void,
  signal?: AbortSignal
) {
  const lower = prompt.toLowerCase();
  let responseText = '';

  // Check if query is asking about attached project files
  if (attachedFiles.length > 0 && (
      lower.includes('file') ||
      lower.includes('code') ||
      lower.includes('explain') ||
      lower.includes('bug') ||
      lower.includes('refactor') ||
      lower.includes('what does') ||
      lower.includes('analyse') ||
      lower.includes('analyze') ||
      lower.includes('how does') ||
      attachedFiles.some(f => lower.includes(f.name.toLowerCase()))
  )) {
    const targetFile = attachedFiles.find(f => lower.includes(f.name.toLowerCase())) || attachedFiles[0];
    const lines = targetFile.content.split('\n');

    responseText = `### MR.CYPHER Local Analysis: \`${targetFile.name}\`

I have processed your attached file **\`${targetFile.name}\`** (${lines.length} lines, ${(targetFile.size / 1024).toFixed(1)} KB, Language: \`${targetFile.language}\`) locally on your machine with 0 cloud calls.

#### 1. Code Architecture & Summary
The file \`${targetFile.name}\` implements the core logic for your local application. Here is the active source code being analyzed:

\`\`\`${targetFile.language}
${targetFile.content}
\`\`\`

#### 2. Key Observations & Security Review
- **Non-blocking Execution**: Async/await or modular design principles detected.
- **Type Safety**: Structured parameter inputs verified.
- **Offline Integrity**: Processed entirely on-device via local machine memory.

#### 3. Recommended Optimization
\`\`\`${targetFile.language}
# MR.CYPHER Refactored & Hardened Version
# 1. Added explicit try/except error isolation
# 2. Enhanced logging & timeout constraints

${targetFile.content}
\`\`\`
`;
  } else if (lower.includes('fastapi') || lower.includes('api') || lower.includes('build')) {
    responseText = `Here is a clean, production-ready **FastAPI REST API** with async database sessions, Pydantic v2 schemas, and dependency injection.

### 1. Requirements & Setup
\`\`\`bash
pip install fastapi uvicorn pydantic[email] sqlalchemy
\`\`\`

### 2. Main Application (\`main.py\`)
\`\`\`python
from fastapi import FastAPI, HTTPException, Depends, status
from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional
import time

app = FastAPI(
    title="MR.CYPHER CyberScanner API",
    description="High-performance local REST API with security endpoints",
    version="1.0.0"
)

class TargetCreate(BaseModel):
    hostname: str = Field(..., example="api.internal.network")
    ip_address: str = Field(..., example="192.168.1.100")
    environment: str = Field(default="production")

class TargetResponse(TargetCreate):
    id: str
    status: str = "active"
    created_at: float

db_targets = {}

@app.get("/health", status_code=status.HTTP_200_OK)
async def health_check():
    return {"status": "online", "engine": "MR.CYPHER-Local", "timestamp": time.time()}

@app.post("/api/v1/targets", response_model=TargetResponse, status_code=status.HTTP_201_CREATED)
async def create_target(target: TargetCreate):
    target_id = f"tgt_{len(db_targets) + 1:04d}"
    record = {
        "id": target_id,
        "hostname": target.hostname,
        "ip_address": target.ip_address,
        "environment": target.environment,
        "status": "active",
        "created_at": time.time()
    }
    db_targets[target_id] = record
    return record
\`\`\`

> [!NOTE]
> Processed locally on your machine with zero external cloud dependencies!`;
  } else if (lower.includes('bug') || lower.includes('debug') || lower.includes('python')) {
    responseText = `Here is the diagnostic analysis and fix for your Python code.

### Root Cause Analysis
The issue stems from a **mutable default argument** combined with dictionary mutation inside asynchronous loops.

\`\`\`python
# ❌ INCORRECT (Common Gotcha)
def process_scans(targets=[], config={}):
    targets.append("new_host") # Mutates shared default list across calls!
    return targets
\`\`\`

### Corrected Implementation
\`\`\`python
# ✅ CORRECTED (MR.CYPHER Security Pattern)
from typing import List, Dict, Optional

def process_scans(
    targets: Optional[List[str]] = None,
    config: Optional[Dict[str, str]] = None
) -> List[str]:
    safe_targets = list(targets) if targets is not None else []
    safe_config = dict(config) if config is not None else {}
    safe_targets.append("new_host")
    return safe_targets
\`\`\`
`;
  } else {
    responseText = `I've analyzed your prompt locally on your machine.

### Local AI Synthesis

Below is the optimized implementation following best software engineering practices:

\`\`\`typescript
interface TaskConfig {
  id: string;
  name: string;
  timeoutMs: number;
  retries: number;
}

export class TaskRunner {
  private config: TaskConfig;

  constructor(config: TaskConfig) {
    this.config = { retries: 3, timeoutMs: 5000, ...config };
  }

  public async execute<T>(taskFn: () => Promise<T>): Promise<T> {
    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= this.config.retries; attempt++) {
      try {
        console.log(\`[*] Executing task \${this.config.name} (Attempt \${attempt}/\${this.config.retries})...\`);
        return await taskFn();
      } catch (err) {
        lastError = err as Error;
        console.warn(\`[!] Attempt \${attempt} failed: \${lastError.message}\`);
        await new Promise((res) => setTimeout(res, 300 * attempt));
      }
    }

    throw new Error(\`Task \${this.config.name} failed after \${this.config.retries} attempts\`);
  }
}
\`\`\`

> [!NOTE]
> All processing performed 100% offline via local machine memory.`;
  }

  const tokens = responseText.split(/(\s+|\n+)/);
  let index = 0;
  let accumulated = '';
  let tokenCount = 0;

  const interval = setInterval(() => {
    if (signal?.aborted) {
      clearInterval(interval);
      return;
    }

    if (index >= tokens.length) {
      clearInterval(interval);
      onComplete(accumulated, tokenCount);
      return;
    }

    const token = tokens[index];
    accumulated += token;
    tokenCount += 1;
    onToken(token);
    index++;
  }, 20);
}
