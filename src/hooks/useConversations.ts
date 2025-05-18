'use client';
import { useEffect, useState, useRef } from 'react';
import { useConversationStore } from '@/store/conversationStore';
import { Conversation } from '@/types/core';

// Same storage key as in useConversationActions
const STORAGE_KEY = 'chat-flex-conversations';

export function useConversations() {
  const conversations = useConversationStore((s) => s.conversations);
  const setConversations = useConversationStore((s) => s.setConversations);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (fetchedRef.current || conversations.length > 0) {
      setLoading(false);
      return;
    }

    const loadConversations = async () => {
      setLoading(true);
      
      try {
        // First try to load from localStorage
        if (typeof window !== 'undefined') {
          const savedData = localStorage.getItem(STORAGE_KEY);
          
          if (savedData) {
            const localConvs = JSON.parse(savedData) as Conversation[];
            console.log(`Loaded ${localConvs.length} conversations from localStorage`);
            
            if (localConvs.length > 0) {
              setConversations(localConvs);
              setError(null);
              fetchedRef.current = true;
              setLoading(false);
              return;
            }
          }
        }
        
        // If no localStorage data, fetch from API
        console.log('No localStorage data, fetching from API');
        const res = await fetch('/api/mock');
        
        if (!res.ok) {
          throw new Error(`Failed to fetch: ${res.statusText}`);
        }
        
        const apiData = await res.json();
        
        if (Array.isArray(apiData)) {
          console.log(`Loaded ${apiData.length} conversations from API`);
          setConversations(apiData);
          setError(null);
          
          // Also save to localStorage for future use
          if (typeof window !== 'undefined') {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(apiData));
          }
        } else {
          throw new Error('Invalid response format');
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load conversations';
        console.error('Error loading conversations:', errorMessage);
        setError(errorMessage);
      } finally {
        fetchedRef.current = true;
        setLoading(false);
      }
    };
    
    loadConversations();
  }, [conversations.length, setConversations]);

  return { conversations, error, loading };
}