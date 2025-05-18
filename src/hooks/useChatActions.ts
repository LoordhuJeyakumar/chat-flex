'use client';
import { useCallback } from 'react';
import { useConversationStore } from '@/store/conversationStore';
import { Content, Message, TextContent } from '@/types/core';

export function useChatActions(conversationId: string) {
  const addMessage = useConversationStore((s) => s.addMessage);

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
        addMessage(conversationId, aiResponse);
      }, 1000);
    },
    [conversationId, addMessage]
  );
}
