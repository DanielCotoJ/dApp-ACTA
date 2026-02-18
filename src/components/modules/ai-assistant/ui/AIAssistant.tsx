'use client';

import React from 'react';
import { Search, X, Sparkles, Loader2, ArrowRight } from 'lucide-react';
import { useAIAssistant } from '../hooks/useAIAssistant';

interface AIAssistantProps {
  onNavigate?: (path: string) => void;
  onClose: () => void;
}

function renderMarkdown(
  text: string,
  onNavigate?: (path: string) => void,
  onClose?: () => void,
): React.ReactNode[] {
  const routePattern = /`(\/dashboard(?:\/[\w-]+)*)`/g;
  const boldPattern = /\*\*(.+?)\*\*/g;
  const codePattern = /`([^`]+)`/g;

  const combined = new RegExp(
    `(${routePattern.source})|(${boldPattern.source})|(${codePattern.source})`,
    'g',
  );

  const result: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = combined.exec(text)) !== null) {
    if (match.index > lastIndex) {
      result.push(text.slice(lastIndex, match.index));
    }

    if (match[1]) {
      const path = match[2];
      result.push(
        <button
          key={`route-${match.index}`}
          onClick={() => {
            onNavigate?.(path);
            onClose?.();
          }}
          className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#edeed1]/10 text-[#edeed1] hover:bg-[#edeed1]/20 transition-colors text-xs font-mono cursor-pointer"
        >
          {path}
          <ArrowRight className="w-3 h-3" />
        </button>,
      );
    } else if (match[3]) {
      result.push(
        <strong key={`bold-${match.index}`} className="font-semibold text-zinc-100">
          {match[4]}
        </strong>,
      );
    } else if (match[5]) {
      result.push(
        <code
          key={`code-${match.index}`}
          className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 text-xs font-mono"
        >
          {match[6]}
        </code>,
      );
    }

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    result.push(text.slice(lastIndex));
  }

  return result;
}

export function AIAssistant({ onNavigate, onClose }: AIAssistantProps) {
  const {
    query,
    setQuery,
    isLoading,
    response,
    suggestedPages,
    inputRef,
    pageRoutes,
    handleKeyDown,
    handlePageClick,
  } = useAIAssistant({ onNavigate, onClose });

  return (
    <div className="fixed inset-0 z-100 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="fixed left-1/2 top-[10%] -translate-x-1/2 w-[calc(100%-2rem)] max-w-2xl bg-zinc-900 border border-[#edeed1]/20 rounded-xl shadow-2xl shadow-[#edeed1]/10 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-4 border-b border-zinc-800">
          <Sparkles className="w-5 h-5 text-[#edeed1] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything about ACTA..."
            className="flex-1 bg-transparent text-zinc-100 placeholder:text-zinc-500 focus:outline-none text-lg"
          />
          <button
            onClick={onClose}
            className="p-1 hover:bg-zinc-800 rounded-md transition-colors"
          >
            <X className="w-5 h-5 text-zinc-400" />
          </button>
        </div>

        {/* Results */}
        <div className="max-h-[60vh] overflow-y-auto p-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 text-[#edeed1] animate-spin" />
              <span className="ml-3 text-zinc-400">Thinking...</span>
            </div>
          ) : response ? (
            <div className="space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-4 h-4 text-[#edeed1]" />
                  <span className="text-xs text-[#edeed1] font-medium">AI-powered</span>
                </div>
                <div className="text-zinc-300 leading-relaxed text-sm space-y-2">
                  {response.split('\n').map((line, i) => (
                    <p key={i}>
                      {renderMarkdown(line, onNavigate, onClose)}
                    </p>
                  ))}
                </div>
              </div>

              {suggestedPages.length > 0 && (
                <div className="pt-4 border-t border-zinc-800">
                  <p className="text-xs text-zinc-500 mb-3">Related pages</p>
                  <div className="flex flex-wrap gap-2">
                    {suggestedPages.map((slug) => {
                      const page = pageRoutes[slug];
                      if (!page) return null;
                      return (
                        <button
                          key={slug}
                          onClick={() => handlePageClick(slug)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg transition-colors border border-zinc-700/50"
                        >
                          <ArrowRight className="w-3.5 h-3.5 text-[#edeed1]" />
                          {page.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="py-12 text-center">
              <Search className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
              <p className="text-zinc-500 text-sm">
                Ask anything about ACTA — credentials, vault, sharing, ZK proofs...
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-zinc-800 bg-zinc-900/80 flex items-center justify-between">
          <span className="text-xs text-zinc-500 flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            Powered by Gemini AI
          </span>
          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <kbd className="px-1.5 py-0.5 bg-zinc-800 rounded border border-zinc-700 text-zinc-400">
              Enter
            </kbd>
            <span>to search</span>
            <kbd className="px-1.5 py-0.5 bg-zinc-800 rounded border border-zinc-700 text-zinc-400 ml-2">
              Esc
            </kbd>
            <span>to close</span>
          </div>
        </div>
      </div>
    </div>
  );
}
