'use client';
import { useState } from 'react';
import ContentTypePicker from './ContentTypePicker';
import ContextAwareInput from './ContextAwareInput';
import { Message, TextContent, Content, Conversation } from '@/types/core';

export default function InputBar({ conversationId }: { conversationId: string }) {
  const [type, setType] = useState<'text'|'image'|'audio'|'code'>('text');
  const [value, setValue] = useState<string>('');
  const [isSending, setIsSending] = useState(false);

  // Direct localStorage approach instead of using hooks
  function sendMessage(content: { type: string; content: string }) {
    if (!conversationId) return;
    setIsSending(true);
    
    try {
      // Create the user message
      const processedContent: Content = {
        type: "text",
        data: content.content
      } as TextContent;
      
      const newMsg: Message = {
        id: `msg-${Date.now()}`,
        sender: "user",
        timestamp: new Date(),
        content: processedContent,
      };
      
      // Save to localStorage
      updateLocalStorage(newMsg);
      
      // Simulate AI response after a short delay
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
        
        // Save AI response to localStorage
        updateLocalStorage(aiResponse);
        setIsSending(false);
      }, 1000);
    } catch (err) {
      console.error('Error sending message:', err);
      setIsSending(false);
    }
  }
  
  function updateLocalStorage(message: Message) {
    try {
      const STORAGE_KEY = 'chat-flex-conversations';
      const savedData = localStorage.getItem(STORAGE_KEY);
      const conversations = savedData ? JSON.parse(savedData) : [];
      
      const existingIndex = conversations.findIndex((c: Conversation) => c.id === conversationId);
      
      if (existingIndex >= 0) {
        // Initialize messages array if it doesn't exist
        if (!conversations[existingIndex].messages) {
          conversations[existingIndex].messages = [];
        }
        
        // Add message to conversation
        conversations[existingIndex].messages.push(message);
        
        // Save back to localStorage
        localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
      }
    } catch (err) {
      console.error('Error updating localStorage:', err);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!value.trim()) return;
    
    // Send the message
    sendMessage({ 
      type: type, 
      content: value 
    });
    
    setValue('');
  }
  
  // Create a handler that matches ContentTypePicker's expected type
  const handleTypeChange = (newType: string) => {
    // Cast to our expected type since we know ContentTypePicker only returns valid types
    setType(newType as 'text'|'image'|'audio'|'code');
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center border-t bg-white p-2">
      <ContentTypePicker selected={type} onSelect={handleTypeChange} />
      <ContextAwareInput
        type={type}
        value={value}
        onChange={setValue}
        placeholder="Type a message or select media..."
        disabled={isSending}
      />
      <button 
        type="submit" 
        className="ml-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
        disabled={!value.trim() || isSending}
      >
        {isSending ? 'Sending...' : 'Send'}
      </button>
    </form>
  );
}
