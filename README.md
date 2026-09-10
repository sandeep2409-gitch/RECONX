# ⚡ MR.CYPHER AI — Premium Local Coding AI Workstation

> **Your Code. Your Machine. Your AI.**  
> High-performance, dark-first local AI coding assistant web application powered by Ollama.

---

## 🎯 Overview

**MR.CYPHER AI** is a production-quality, developer-focused local AI coding workstation. It combines the sleek productivity of modern AI tools (Cursor, Raycast, Linear) with a futuristic cybersecurity workstation aesthetic—running **100% offline** on your machine with zero cloud latency and total privacy.

---

## ✨ Features

- 🔒 **100% Private & Local**: Powered by local [Ollama](https://ollama.com) models. Your source code never leaves your machine.
- 📁 **Drag & Drop File Context**: Drag and drop any code files (`.py`, `.js`, `.ts`, `.json`, `.sql`, `.html`, `.css`, `.md`, etc.) directly into the workspace for instant offline AI analysis.
- 🧠 **Default `mr-cypher` Model**: Pre-configured to default to the `mr-cypher` model with support for dynamic local Ollama model switching (`Qwen2.5-Coder`, `Llama 3.2`, `DeepSeek-Coder`).
- 🎨 **Vibrant IDE Syntax Highlighting**: Custom VS Code / One Dark Prism token theme (Purple keywords, Blue functions, Emerald strings, Amber numbers, Sky Blue operators).
- ⚡ **Interactive Slash Commands**: Type `/` to trigger instant commands (`/explain`, `/debug`, `/refactor`, `/review`, `/test`, `/document`).
- 🖥️ **3-Zone Developer Layout**:
  - **Left Sidebar**: Workspace navigation (`+ New Chat`, `Search`, `Projects`, `Recent Chats`, `Favorites`, Ollama status).
  - **Main Chat Area**: Streamed AI responses, IDE code blocks with `✓ Copied` feedback, line numbers, and action toolbars (Copy, Regenerate, Edit, Continue).
  - **Right Context Panel**: 3 tabs (`CONTEXT`, `FILES`, `ACTIVITY`) displaying model specs, attached project context files, and live streaming metrics.
- ⌨️ **Keyboard Shortcuts**:
  - `Cmd / Ctrl + K` — Global conversation search modal
  - `Cmd / Ctrl + N` — Create new chat
  - `Esc` — Stop generation / Close modals

---

## 🚀 Getting Started

### 1. Prerequisites

- **Node.js**: v18+ installed on your system.
- **Ollama**: Installed and running locally on `http://localhost:11434`.

### 2. Prepare the `mr-cypher` Model

To use or create the default `mr-cypher` model with Ollama:

```bash
# Pull a recommended base coder model
ollama pull qwen2.5-coder:3b

# Optional: Create custom mr-cypher model from Modelfile
ollama create mr-cypher -f Modelfile
```

### 3. Installation & Setup

Clone or open the repository and install dependencies:

```bash
# Install dependencies
npm install

# Start the local development server
npm run dev
```

Open `http://localhost:5173` in your browser to launch **MR.CYPHER AI**.

---

## 📦 Building for Production

To create an optimized production build:

```bash
npm run build
```

The output bundle will be generated inside the `dist/` directory.

---

## 📂 Project Structure

```
Project Expo/
├── public/
│   └── logo.jpg               # Official MR.CYPHER AI Hooded Logo Graphic
├── src/
│   ├── components/            # UI Components (Header, Sidebar, EmptyState, ChatInput, etc.)
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx
│   │   ├── EmptyState.tsx
│   │   ├── ChatInput.tsx
│   │   ├── ChatMessage.tsx
│   │   ├── CodeBlock.tsx
│   │   ├── RightContextPanel.tsx
│   │   ├── SettingsModal.tsx
│   │   ├── SetupScreen.tsx
│   │   ├── SearchModal.tsx
│   │   └── SlashCommandMenu.tsx
│   ├── hooks/                 # Custom React Hooks (useChat, useOllama)
│   ├── lib/                   # Native Ollama API client & offline fallback engine
│   ├── types/                 # TypeScript data models
│   ├── App.tsx                # Main App Router & Workspace Layout
│   └── index.css              # Custom Tailwind CSS & Prism Syntax Highlighting
├── package.json
├── tailwind.config.js
├── vite.config.ts
└── README.md
```

---

## 🛡️ Privacy Guarantee

MR.CYPHER AI operates entirely on-device:
- Zero external cloud telemetry or third-party API calls.
- Dragged-and-dropped source files are read strictly in local browser memory via HTML5 `FileReader`.
- Inference runs locally on your Apple Silicon / GPU hardware through Ollama.

---

## 📄 License

MIT License. Designed for privacy-first developers.
Push is done 
