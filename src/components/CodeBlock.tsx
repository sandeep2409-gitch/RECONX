import React, { useState } from 'react';
import { Copy, Check, Download, Code2 } from 'lucide-react';
import Prism from 'prismjs';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-sql';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-markup';

interface CodeBlockProps {
  language: string;
  code: string;
  filename?: string;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({ language, code, filename }) => {
  const [copied, setCopied] = useState(false);

  const cleanLang = (language || 'text').toLowerCase().replace('language-', '').trim();
  const lines = code.trim().split('\n');

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const extMap: Record<string, string> = {
      python: 'py',
      py: 'py',
      javascript: 'js',
      js: 'js',
      typescript: 'ts',
      ts: 'ts',
      bash: 'sh',
      sh: 'sh',
      json: 'json',
      sql: 'sql',
      html: 'html',
      css: 'css',
    };
    const ext = extMap[cleanLang] || 'txt';
    const blob = new Blob([code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || `mrcypher_code.${ext}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getHighlightedCode = () => {
    try {
      const grammarMap: Record<string, any> = {
        python: Prism.languages.python,
        py: Prism.languages.python,
        typescript: Prism.languages.typescript,
        ts: Prism.languages.typescript,
        javascript: Prism.languages.javascript,
        js: Prism.languages.javascript,
        bash: Prism.languages.bash,
        sh: Prism.languages.bash,
        json: Prism.languages.json,
        sql: Prism.languages.sql,
        html: Prism.languages.markup,
        css: Prism.languages.css,
      };

      const grammar = grammarMap[cleanLang] || Prism.languages[cleanLang] || Prism.languages.javascript;
      return Prism.highlight(code, grammar, cleanLang);
    } catch {
      return code;
    }
  };

  return (
    <div className="my-4 rounded-lg border border-[#27272A] bg-[#111113] overflow-hidden shadow-cy-panel font-mono text-xs">
      {/* IDE Header Bar */}
      <div className="flex items-center justify-between px-3 py-2 bg-[#151518] border-b border-[#27272A] select-none">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5 mr-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444]/60"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]/60"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]/60"></span>
          </div>
          <Code2 className="w-3.5 h-3.5 text-cy-accent-light" />
          <span className="text-cy-text-secondary font-medium text-xs">
            {filename || cleanLang}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handleDownload}
            title="Download Code"
            className="flex items-center gap-1 px-2 py-1 rounded text-[11px] text-cy-text-muted hover:text-cy-text-primary hover:bg-[#27272A] transition-colors"
          >
            <Download className="w-3 h-3" />
          </button>

          <button
            onClick={handleCopy}
            className={`flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-medium transition-all ${
              copied
                ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/80 shadow-sm'
                : 'bg-[#1F1F23] text-cy-text-secondary hover:text-cy-text-primary hover:bg-[#27272A] border border-[#27272A]'
            }`}
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 text-emerald-400" />
                <span>✓ Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Code Area with Line Numbers */}
      <div className="relative flex overflow-x-auto p-3 text-cy-text-primary leading-relaxed bg-[#0A0A0B]">
        {/* Line Numbers column */}
        <div className="flex flex-col text-right pr-4 border-r border-[#27272A]/50 select-none text-cy-text-muted/50 min-w-[2.5rem]">
          {lines.map((_, idx) => (
            <span key={idx} className="h-5 leading-5 text-[11px]">
              {idx + 1}
            </span>
          ))}
        </div>

        {/* Syntax Highlighted Code */}
        <pre className="pl-4 font-mono text-xs overflow-x-auto whitespace-pre">
          <code
            dangerouslySetInnerHTML={{ __html: getHighlightedCode() }}
          />
        </pre>
      </div>
    </div>
  );
};
