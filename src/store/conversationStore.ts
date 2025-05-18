'use client';
import { create } from 'zustand';
import { Conversation, Message, ToolUsage } from '@/types/core';

interface ChatState {
  conversations: Conversation[];
  messages: Record<string, Message[]>;
  thinking: Record<string, string[]>;
  toolUsage: Record<string, ToolUsage[]>;
  setConversations: (convs: Conversation[]) => void;
  addConversation: (conv: Conversation) => void;
  setMessages: (id: string, msgs: Message[]) => void;
  addMessage: (id: string, msg: Message) => void;
}

export const useConversationStore = create<ChatState>((set) => ({
  conversations: [],
  messages: {},
  thinking: {},
  toolUsage: {},
  
  setConversations: (convs) => 
    set((state) => {
      // Check if the conversations array is actually different
      if (
        state.conversations.length === convs.length &&
        JSON.stringify(state.conversations) === JSON.stringify(convs)
      ) {
        return state; // Return unchanged state to prevent re-render
      }
      return { conversations: convs }; // Removed the spreading to avoid creating new references
    }),
    
  addConversation: (conv) => 
    set((state) => {
      // Check if conversation already exists
      if (state.conversations.some(c => c.id === conv.id)) {
        return state; // Return unchanged state to prevent re-render
      }
      return {
        ...state,
        conversations: [conv, ...state.conversations]
      };
    }),
    
  setMessages: (id, msgs) => 
    set((state) => {
      // Check if messages are actually different
      if (
        state.messages[id] &&
        state.messages[id].length === msgs.length &&
        JSON.stringify(state.messages[id]) === JSON.stringify(msgs)
      ) {
        return state; // Return unchanged state to prevent re-render
      }
      
      return {
        ...state,
        messages: { ...state.messages, [id]: msgs }, // Removed the spreading of msgs array
      };
    }),
    
  addMessage: (id, msg) => 
    set((state) => {
      const currentMessages = state.messages[id] || [];
      
      // Check if message already exists
      if (currentMessages.some(m => m.id === msg.id)) {
        return state; // Return unchanged state to prevent re-render
      }
      
      return {
        ...state,
        messages: {
          ...state.messages,
          [id]: [...currentMessages, msg],
        },
      };
    }),
}));