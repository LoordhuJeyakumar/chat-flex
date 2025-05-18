// Use Node.js module pattern for better compatibility
import initialData from './mockData';
import { Conversation } from '@/types/core';

// Switch to default export to avoid import path issues
// Store it in a module-level variable that's properly exported
const mockStore = {
  // In-memory storage
  conversations: [...initialData],

  // Methods to interact with the store
  getConversations(): Conversation[] {
    return this.conversations;
  },

  getConversation(id: string): Conversation | undefined {
    return this.conversations.find(c => c.id === id);
  },

  addConversation(conversation: Conversation): void {
    // Don't add if it already exists
    if (this.conversations.some(c => c.id === conversation.id)) {
      return;
    }
    this.conversations.unshift(conversation);
    
    // Debug log to see what's happening
    console.log(`Added conversation ${conversation.id}, store now has ${this.conversations.length} items`);
    console.log(`First item ID: ${this.conversations[0]?.id}`);
  },

  updateConversation(id: string, updates: Partial<Conversation>): Conversation | null {
    const index = this.conversations.findIndex(c => c.id === id);
    if (index === -1) {
      return null;
    }
    
    this.conversations[index] = { ...this.conversations[index], ...updates };
    return this.conversations[index];
  },

  deleteConversation(id: string): boolean {
    const initialLength = this.conversations.length;
    this.conversations = this.conversations.filter(c => c.id !== id);
    return this.conversations.length < initialLength;
  }
};

// Export both named exports for compatibility and default export
export const { getConversations, getConversation, addConversation, 
               updateConversation, deleteConversation } = mockStore;

export default mockStore; 