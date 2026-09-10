import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  showSubtitle?: boolean;
}

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  showText = true,
  showSubtitle = false,
}) => {
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
  };

  return (
    <div className="flex items-center gap-3 select-none">
      {/* Official MR.CYPHER AI Hooded Cyber Emblem */}
      <div className={`relative flex items-center justify-center rounded-xl bg-[#111113] border border-[#38BDF8]/40 overflow-hidden shadow-[0_0_12px_rgba(56,189,248,0.3)] ${iconSizes[size]} group hover:border-[#38BDF8] transition-all`}>
        <img
          src="/logo.jpg"
          alt="MR.CYPHER AI"
          className="w-full h-full object-cover rounded-xl scale-105"
        />
      </div>

      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="font-mono font-bold tracking-tight text-cy-text-primary text-base">
              MR.CYPHER
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-sky-950/70 border border-sky-500/40 text-sky-400 uppercase tracking-wider font-bold">
              AI
            </span>
          </div>
          {showSubtitle && (
            <span className="text-[11px] text-cy-text-muted font-mono tracking-wide">
              Your Code. Your Machine. Your AI.
            </span>
          )}
        </div>
      )}
    </div>
  );
};
