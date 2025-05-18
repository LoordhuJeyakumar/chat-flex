'use client';
import { useCallback } from 'react';
import { useConversationStore } from '@/store/conversationStore';
import { Content, Message, TextContent, Conversation } from '@/types/core';

// Define store state type
interface ConversationStoreState {
  addMessage: (conversationId: string, message: Message) => void;
  // Add other state properties as needed
}

export function useChatActions(conversationId: string) {
  // Create a stable selector with proper dependencies
  const addMessageSelector = useCallback(
    (state: ConversationStoreState) => state.addMessage, 
    []
  );
  
  // Get the addMessage function from the store
  const addMessage = useConversationStore(addMessageSelector);

  // Return a stable function reference
  return useCallback(
    (content: { type: string; content: string }) => {
      // Create content based on type
      // For now we'll default to treating everything as text content
      // In a real app, you'd handle different content types appropriately
      const processedContent: Content = {
        type: "text",
        data: content.content
      } as TextContent;
      
      // Create message with correct typing
      const newMsg: Message = {
        id: `msg-${Date.now()}`,
        sender: "user",
        timestamp: new Date(),
        content: processedContent,
      };
      
      // Add to store
      addMessage(conversationId, newMsg);
      
      // Also update localStorage to persist the message
      if (typeof window !== 'undefined') {
        try {
          const STORAGE_KEY = 'chat-flex-conversations';
          const saved = localStorage.getItem(STORAGE_KEY);
          const savedConvs = saved ? JSON.parse(saved) : [];
          
          const existingIndex = savedConvs.findIndex((c: Conversation) => c.id === conversationId);
          if (existingIndex >= 0) {
            if (!savedConvs[existingIndex].messages) {
              savedConvs[existingIndex].messages = [];
            }
            savedConvs[existingIndex].messages.push(newMsg);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(savedConvs));
          }
        } catch (err) {
          console.error('[CHAT_ACTIONS] Error updating localStorage:', err);
        }
      }
      
      // In a real app, you would call the AI API here and add the AI response
      // For now, we'll just simulate a response after a delay
      setTimeout(() => {
        const aiResponse: Message = {
          id: `msg-${Date.now()}-ai`,
          sender: "ai",
          timestamp: new Date(),
          content: {
            type: "text",
            data: `This is a simulated response to your message.`
          } as TextContent
        };
        
        // Add to store
        addMessage(conversationId, aiResponse);
        
        // Also update localStorage to persist the AI response
        if (typeof window !== 'undefined') {
          try {
            const STORAGE_KEY = 'chat-flex-conversations';
            const saved = localStorage.getItem(STORAGE_KEY);
            const savedConvs = saved ? JSON.parse(saved) : [];
            
            const existingIndex = savedConvs.findIndex((c: Conversation) => c.id === conversationId);
            if (existingIndex >= 0) {
              if (!savedConvs[existingIndex].messages) {
                savedConvs[existingIndex].messages = [];
              }
              savedConvs[existingIndex].messages.push(aiResponse);
              localStorage.setItem(STORAGE_KEY, JSON.stringify(savedConvs));
            }
          } catch (err) {
            console.error('[CHAT_ACTIONS] Error updating localStorage with AI response:', err);
          }
        }
      }, 1000);
    },
    [conversationId, addMessage]
  );
}
