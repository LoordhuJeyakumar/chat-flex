'use client';
import { useEffect, useState, useCallback, useRef } from 'react';
import { useConversationStore } from '@/store/conversationStore';
import { Conversation } from '@/types/core';

// Same storage key as in other hooks
const STORAGE_KEY = 'chat-flex-conversations';

export function useChat(conversationId: string) {
  // Use refs to store stable function references
  const storeRef = useRef(useConversationStore.getState);
  
  // Get data from the store with stable selectors
  const messages = useConversationStore(
    useCallback(state => state.messages[conversationId] || [], [conversationId])
  );
  
  const thinking = useConversationStore(
    useCallback(state => state.thinking[conversationId] || [], [conversationId])
  );
  
  const toolUsage = useConversationStore(
    useCallback(state => state.toolUsage[conversationId] || [], [conversationId])
  );
  
  // Store setMessages in a ref to avoid dependency changes
  const setMessagesRef = useRef(useConversationStore.getState().setMessages);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isLoadingRef = useRef(false);
  const hasInitializedRef = useRef<string | null>(null);
  
  // Update refs when store changes
  useEffect(() => {
    storeRef.current = useConversationStore.getState;
    setMessagesRef.current = useConversationStore.getState().setMessages;
    
    const unsubscribe = useConversationStore.subscribe((state) => {
      storeRef.current = () => state;
      setMessagesRef.current = state.setMessages;
    });
    
    return unsubscribe;
  }, []);

  // Load conversation data - only run once per conversation ID
  useEffect(() => {
    console.log(`[CHAT] Loading data for conversation: ${conversationId || 'none'}`);
    
    // Reset state for new conversation ID
    if (!conversationId) {
      console.log('[CHAT] No conversation ID provided, skipping load');
      setLoading(false);
      return;
    }

    // Prevent duplicate loads
    if (isLoadingRef.current) {
      console.log('[CHAT] Already loading, skipping duplicate request');
      return;
    }
    
    // Check if we already have messages for this conversation
    const currentMessages = storeRef.current().messages[conversationId] || [];
    if (currentMessages.length > 0) {
      console.log(`[CHAT] Already have ${currentMessages.length} messages for conversation ${conversationId} in store`);
      setLoading(false);
      return;
    }
    
    // Only load data once per conversation ID
    if (hasInitializedRef.current && conversationId === hasInitializedRef.current) {
      console.log(`[CHAT] Already initialized for ${conversationId}, skipping`);
      return;
    }
    
    const loadConversation = async () => {
      if (isLoadingRef.current) return;
      
      isLoadingRef.current = true;
      setLoading(true);
      setError(null);
      
      console.log(`[CHAT] Starting load process for ${conversationId}`);
      
      try {
        // First try to load from localStorage
        if (typeof window !== 'undefined') {
          console.log(`[CHAT] Checking localStorage for conversation ${conversationId}`);
          const savedData = localStorage.getItem(STORAGE_KEY);
          
          if (savedData) {
            try {
              const savedConvs = JSON.parse(savedData);
              console.log(`[CHAT] Found ${savedConvs.length} conversations in localStorage`);
              console.log(`[CHAT] Available IDs in localStorage: ${savedConvs.map((c: Conversation) => c.id).join(', ')}`);
              
              const savedConv = savedConvs.find((c: Conversation) => c.id === conversationId);
              
              if (savedConv) {
                console.log(`[CHAT] Found conversation ${conversationId} in localStorage`);
                if (savedConv.messages?.length > 0) {
                  console.log(`[CHAT] Conversation has ${savedConv.messages.length} messages in localStorage`);
                  setMessagesRef.current(conversationId, savedConv.messages);
                  hasInitializedRef.current = conversationId;
                  setLoading(false);
                  isLoadingRef.current = false;
                  return;
                } else {
                  console.log(`[CHAT] Conversation found in localStorage but has no messages`);
                }
              } else {
                console.log(`[CHAT] Conversation ${conversationId} not found in localStorage`);
              }
            } catch (e) {
              console.error('[CHAT] Error parsing localStorage data:', e);
            }
          } else {
            console.log('[CHAT] No saved data found in localStorage');
          }
        }
        
        // If not in localStorage or parsing failed, fetch from API
        console.log(`[CHAT] Fetching conversation ${conversationId} from API`);
        const res = await fetch(`/api/mock/${conversationId}`);
        
        console.log(`[CHAT] API response status: ${res.status}`);
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          console.error('[CHAT] API error:', errorData);
          throw new Error(errorData.error || res.statusText);
        }
        
        const data = await res.json();
        console.log(`[CHAT] API returned data:`, data);
        
        if (data.messages && Array.isArray(data.messages)) {
          console.log(`[CHAT] Setting ${data.messages.length} messages from API response`);
          setMessagesRef.current(conversationId, data.messages);
          hasInitializedRef.current = conversationId;
          
          // Also save to localStorage
          if (typeof window !== 'undefined') {
            try {
              const savedData = localStorage.getItem(STORAGE_KEY);
              const localConvs: Conversation[] = savedData ? JSON.parse(savedData) : [];
              const existingIndex = localConvs.findIndex(c => c.id === conversationId);
              
              if (existingIndex >= 0) {
                localConvs[existingIndex] = data;
                console.log(`[CHAT] Updated conversation in localStorage`);
              } else {
                localConvs.unshift(data);
                console.log(`[CHAT] Added conversation to localStorage`);
              }
              
              localStorage.setItem(STORAGE_KEY, JSON.stringify(localConvs));
            } catch (storageError) {
              console.error('[CHAT] Error saving to localStorage:', storageError);
            }
          }
        } else {
          console.log(`[CHAT] API response doesn't have messages array, using empty array`);
          setMessagesRef.current(conversationId, []);
          hasInitializedRef.current = conversationId;
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        console.error(`[CHAT] Error loading conversation:`, errorMessage);
        setError(errorMessage);
      } finally {
        setLoading(false);
        isLoadingRef.current = false;
      }
    };

    // Execute the loading process
    loadConversation();
  }, [conversationId]); // Only depends on conversationId

  return { 
    messages, 
    thinking, 
    toolUsage, 
    loading, 
    error 
  };
}