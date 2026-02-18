import { useState, useEffect, useRef, useCallback } from 'react';

interface UseAIAssistantProps {
  onNavigate?: (path: string) => void;
  onClose: () => void;
}

const PAGE_ROUTES: Record<string, { label: string; path: string }> = {
  dashboard: { label: 'Home', path: '/dashboard' },
  issue: { label: 'Issue Credentials', path: '/dashboard/issue' },
  authorize: { label: 'Authorize Issuers', path: '/dashboard/authorize' },
  credentials: { label: 'Vault', path: '/dashboard/credentials' },
  'api-keys': { label: 'API Keys', path: '/dashboard/api-keys' },
  tutorials: { label: 'Tutorials', path: '/dashboard/tutorials' },
};

export function useAIAssistant({ onNavigate, onClose }: UseAIAssistantProps) {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<string | null>(null);
  const [suggestedPages, setSuggestedPages] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const handleSearch = useCallback(async () => {
    if (!query.trim()) return;

    setIsLoading(true);
    setResponse(null);
    setSuggestedPages([]);

    try {
      const res = await fetch('/api/ai-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });

      if (!res.ok) throw new Error('Search failed');

      const data = await res.json();
      setResponse(data.answer);
      setSuggestedPages(data.suggestedPages || []);
    } catch {
      setResponse('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [query]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        handleSearch();
      }
    },
    [handleSearch],
  );

  const handlePageClick = useCallback(
    (slug: string) => {
      const page = PAGE_ROUTES[slug];
      if (page && onNavigate) {
        onNavigate(page.path);
      }
      onClose();
    },
    [onNavigate, onClose],
  );

  return {
    query,
    setQuery,
    isLoading,
    response,
    suggestedPages,
    inputRef,
    pageRoutes: PAGE_ROUTES,
    handleSearch,
    handleKeyDown,
    handlePageClick,
  };
}
