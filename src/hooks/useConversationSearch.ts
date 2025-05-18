import { useState, useCallback } from 'react';
import { Content, Message } from '@/types/core';

interface SearchResult {
  conversationId: string;
  messageId: string;
  messageContent: Content;
  relevanceScore: number;
  context: {
    previousMessage?: Message;
    nextMessage?: Message;
  };
}

interface SearchHookResult {
  results: SearchResult[];
  answer: string | null;
  loading: boolean;
  error: string | null;
  search: (query: string) => Promise<void>;
  getAnswer: (query: string) => Promise<string | null>;
  getContextualAnswer: (query: string, conversationId: string) => Promise<string | null>;
}

export function useConversationSearch(): SearchHookResult {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [answer, setAnswer] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(async (query: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query, type: 'search' }),
      });
      
      if (!response.ok) {
        throw new Error(`Search failed with status: ${response.status}`);
      }
      
      const data = await response.json();
      setResults(data.results || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const getAnswer = useCallback(async (query: string): Promise<string | null> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query, type: 'answer' }),
      });
      
      if (!response.ok) {
        throw new Error(`Search failed with status: ${response.status}`);
      }
      
      const data = await response.json();
      setAnswer(data.answer);
      return data.answer;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      setAnswer(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getContextualAnswer = useCallback(async (query: string, conversationId: string): Promise<string | null> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query, conversationId, type: 'conversationAware' }),
      });
      
      if (!response.ok) {
        throw new Error(`Search failed with status: ${response.status}`);
      }
      
      const data = await response.json();
      setAnswer(data.answer);
      return data.answer;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      setAnswer(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    results,
    answer,
    loading,
    error,
    search,
    getAnswer,
    getContextualAnswer,
  };
} 