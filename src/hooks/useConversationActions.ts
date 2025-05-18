'use client';
import { useCallback, useRef } from 'react';
import { useConversationStore } from '@/store/conversationStore';
import { Content, Message, TextContent, Conversation } from '@/types/core';

// Local storage key for storing conversations
const STORAGE_KEY = 'chat-flex-conversations';

export function useConversationActions() {
  const addConversation = useConversationStore((s) => s.addConversation);
  const addMessage = useConversationStore((s) => s.addMessage);
  const conversations = useConversationStore((s) => s.conversations);
  const creatingRef = useRef(false); // Track creation state across renders

  // Helper to save to localStorage
  const saveToLocalStorage = useCallback((conv: Conversation) => {
    if (typeof window === 'undefined') return;
    
    try {
      // Get current saved conversations
      const saved = localStorage.getItem(STORAGE_KEY);
      const savedConvs: Conversation[] = saved ? JSON.parse(saved) : [];
      
      // DEBUGGING: Log what's in localStorage
      console.log(`[STORAGE] Before update - ${savedConvs.length} conversations in localStorage`);
      if (savedConvs.length > 0) {
        console.log(`[STORAGE] First ID: ${savedConvs[0].id}`);
      }
      
      // Check if this conversation already exists
      const existingIndex = savedConvs.findIndex(c => c.id === conv.id);
      
      if (existingIndex >= 0) {
        // Update existing
        savedConvs[existingIndex] = conv;
        console.log(`[STORAGE] Updated conversation ${conv.id} in localStorage`);
      } else {
        // Add new at the beginning
        savedConvs.unshift(conv);
        console.log(`[STORAGE] Added new conversation ${conv.id} to localStorage`);
      }
      
      // Save back to localStorage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(savedConvs));
      console.log(`[STORAGE] Saved ${savedConvs.length} conversations to localStorage`);
      
      // DEBUGGING: Verify saved
      const afterSave = localStorage.getItem(STORAGE_KEY);
      if (afterSave) {
        try {
          const afterConvs = JSON.parse(afterSave) as Conversation[];
          console.log(`[STORAGE] After save - ${afterConvs.length} conversations, first ID: ${afterConvs[0]?.id || 'none'}`);
        } catch (e) {
          console.error('[STORAGE] Error parsing after save:', e);
        }
      }
    } catch (err) {
      console.error('[STORAGE] Error saving to localStorage:', err);
    }
  }, []);

  const createConversation = useCallback(async () => {
    // Guard against multiple simultaneous creations
    if (creatingRef.current) {
      console.log('[CREATE] Already creating a conversation, skipping');
      return { id: null, error: "Creation already in progress" };
    }
    
    creatingRef.current = true;
    console.log('[CREATE] Starting conversation creation process');
    
    try {
      // Check if we already have a pending "New Conversation" with no messages
      const existingNew = conversations.find(c => 
        c.title === 'New Conversation' && 
        (!c.messages || c.messages.length === 0)
      );
      
      if (existingNew) {
        console.log(`[CREATE] Using existing new conversation: ${existingNew.id}`);
        
        // Make sure it's in localStorage too
        saveToLocalStorage(existingNew);
        
        return { id: existingNew.id, error: null };
      }
      
      // Generate a unique ID for the new conversation
      const id = `conv-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      console.log(`[CREATE] Generated new conversation ID: ${id}`);
      
      const newConv: Conversation = { 
        id, 
        title: 'New Conversation', 
        description: 'Start typing to begin your conversation', 
        messages: [] 
      };
      
      // Add to store
      console.log('[CREATE] Adding to store:', newConv);
      addConversation(newConv);
      
      // DEBUGGING: Check store after adding
      setTimeout(() => {
        const storeConvs = useConversationStore.getState().conversations;
        console.log(`[CREATE] Store now has ${storeConvs.length} conversations`);
        const found = storeConvs.find(c => c.id === id);
        console.log(`[CREATE] New conversation in store: ${found ? 'YES' : 'NO'}`);
      }, 0);
      
      // Save to localStorage
      console.log('[CREATE] Saving to localStorage');
      saveToLocalStorage(newConv);
      
      // Also try to persist to API
      try {
        console.log('[CREATE] Sending to API');
        const res = await fetch('/api/mock', {
          method: 'POST', 
          headers: { 'Content-Type': 'application/json' }, 
          body: JSON.stringify(newConv)
        });
        
        if (!res.ok) {
          console.error("[CREATE] API error:", res.status);
          const errorData = await res.json().catch(() => ({}));
          console.error("[CREATE] API error details:", errorData);
        } else {
          console.log('[CREATE] Successfully saved to API');
        }
      } catch (apiError) {
        console.error("[CREATE] Error communicating with API:", apiError);
        // Even if API fails, we've already added to local store and localStorage
      }
      
      console.log(`[CREATE] Completed conversation creation for ${id}`);
      return { id, error: null };
    } catch (err) {
      console.error("[CREATE] Error in createConversation:", err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      return { id: null, error: errorMessage };
    } finally {
      creatingRef.current = false;
    }
  }, [addConversation, conversations, saveToLocalStorage]);

  const sendMessage = useCallback((conversationId: string, content: { type: string; content: string }) => {
    console.log(`[SEND] Sending message to conversation: ${conversationId}`);
    
    // Create content based on type
    const processedContent: Content = {
      type: "text",
      data: content.content
    } as TextContent;
    
    // Create message
    const newMsg: Message = {
      id: `msg-${Date.now()}`,
      sender: "user",
      timestamp: new Date(),
      content: processedContent,
    };
    
    // Add to store
    console.log('[SEND] Adding message to store');
    addMessage(conversationId, newMsg);
    
    // Update localStorage
    const conversation = conversations.find(c => c.id === conversationId);
    if (conversation) {
      const updatedConv = {
        ...conversation,
        messages: [...(conversation.messages || []), newMsg]
      };
      
      console.log('[SEND] Saving updated conversation to localStorage');
      saveToLocalStorage(updatedConv);
    } else {
      console.error(`[SEND] Conversation ${conversationId} not found in store`);
    }
    
    // In a real app, you would call the AI API here and add the AI response
    // For now, we'll just simulate a response after a delay
    setTimeout(() => {
      console.log(`[SEND] Adding AI response to conversation: ${conversationId}`);
      const aiResponse: Message = {
        id: `msg-${Date.now()}-ai`,
        sender: "ai",
        timestamp: new Date(),
        content: {
          type: "text",
          data: `This is a simulated response to your message.`
        } as TextContent
      };
      
      addMessage(conversationId, aiResponse);
      
      // Update localStorage again with AI response
      const updatedConversation = conversations.find(c => c.id === conversationId);
      if (updatedConversation) {
        const finalConv = {
          ...updatedConversation,
          messages: [...(updatedConversation.messages || []), aiResponse]
        };
        console.log('[SEND] Saving conversation with AI response to localStorage');
        saveToLocalStorage(finalConv);
      } else {
        console.error(`[SEND] Conversation ${conversationId} not found in store after AI response`);
      }
    }, 1000);
    
    return newMsg;
  }, [addMessage, conversations, saveToLocalStorage]);

  return { createConversation, sendMessage };
}