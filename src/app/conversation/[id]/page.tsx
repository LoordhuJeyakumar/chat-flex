'use client'
import { useParams } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { Conversation } from '@/types/core';
import MessageList from '@/components/chat/MessageList';
import InputBar from '@/components/input/InputBar';
import { useConversationStore } from '@/store/conversationStore';
import Link from 'next/link';

// Storage key constant
const STORAGE_KEY = 'chat-flex-conversations';

export default function ConversationPage() {
  const params = useParams();
  const id = params?.id as string;
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Get setMessages function from the store with memoization
  const setMessages = useConversationStore(
    useCallback(state => state.setMessages, [])
  );

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    let isMounted = true;

    const loadConversationData = async () => {
      // Only load if still loading and component is mounted
      if (!loading || !isMounted) return;

      try {
        // First try to load from localStorage
        if (typeof window !== 'undefined') {
          console.log('[PAGE] Checking localStorage for conversation');
          const savedData = localStorage.getItem(STORAGE_KEY);
          
          if (savedData) {
            const savedConvs = JSON.parse(savedData);
            const savedConv = savedConvs.find((c: Conversation) => c.id === id);
            
            if (savedConv && isMounted) {
              console.log('[PAGE] Found conversation in localStorage');
              setConversation(savedConv);
              if (savedConv.messages?.length > 0) {
                // Set messages in store for components that need them
                setMessages(id, savedConv.messages);
              }
              setLoading(false);
              return;
            }
          }
        }
        
        // If not found in localStorage or no messages, fetch from API
        console.log('[PAGE] Fetching conversation from API');
        const res = await fetch(`/api/mock/${id}`);
        
        if (!res.ok) {
          throw new Error('Failed to fetch conversation');
        }
        
        const data = await res.json();
        
        if (isMounted) {
          setConversation(data);
          if (data.messages?.length > 0) {
            setMessages(id, data.messages);
          }
          
          // Save to localStorage
          if (typeof window !== 'undefined') {
            try {
              const savedData = localStorage.getItem(STORAGE_KEY);
              const localConvs = savedData ? JSON.parse(savedData) : [];
              const existingIndex = localConvs.findIndex((c: Conversation) => c.id === id);
              
              if (existingIndex >= 0) {
                localConvs[existingIndex] = data;
              } else {
                localConvs.unshift(data);
              }
              
              localStorage.setItem(STORAGE_KEY, JSON.stringify(localConvs));
            } catch (e) {
              console.error('[PAGE] Error saving to localStorage:', e);
            }
          }
        }
      } catch (err) {
        console.error('[PAGE] Error loading conversation:', err);
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Unknown error');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadConversationData();

    return () => {
      isMounted = false;
    };
  }, [id, loading, setMessages]);

  // To prevent re-renders, memoize the conversation ID
  const memoizedId = useCallback(() => id, [id]);

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p>Loading conversation...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-1 items-center justify-center p-4">
        <div className="text-center text-red-500">
          <p className="mb-2">Error loading conversation:</p>
          <p className="font-mono">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Reload
          </button>
        </div>
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className="flex flex-1 items-center justify-center p-4">
        <div className="text-center">
          <p>Conversation not found</p>
          <Link
            href="/"
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 inline-block"
          >
            Return to home
          </Link>
        </div>
      </div>
    );
  }

  // Get current ID from memoized function to avoid re-renders
  const currentId = memoizedId();

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <div className="bg-white rounded-lg shadow p-4 mb-4">
        <h1 className="text-xl font-semibold">{conversation.title}</h1>
        <p className="text-sm text-gray-500">{conversation.description}</p>
      </div>
      
      <div className="flex-1 flex flex-col bg-gray-100 rounded-lg overflow-hidden">
        <MessageList conversationId={currentId} />
        <InputBar conversationId={currentId} />
      </div>
    </div>
  );
}