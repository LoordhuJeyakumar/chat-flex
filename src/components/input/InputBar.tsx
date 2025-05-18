/* eslint-disable react-hooks/exhaustive-deps */
'use client';
import { useState, useEffect } from 'react';
import { Send, Paperclip, X, Code,  Mic, FileText, Table, BarChart3, ImageIcon } from 'lucide-react';
import ContextAwareInput from './ContextAwareInput';
import { Message, TextContent, Content, Conversation, CodeContent } from '@/types/core';

export default function InputBar({ 
  conversationId,

}: { 
  conversationId: string;
  viewMode?: 'standard' | 'focused' | 'presentation';
}) {
  const [type, setType] = useState<'text'|'image'|'audio'|'code'|'document'|'spreadsheet'|'chart'>('text');
  const [value, setValue] = useState<string>('');
  const [isSending, setIsSending] = useState(false);
  const [isAttachmentMenuOpen, setIsAttachmentMenuOpen] = useState(false);
  const [smartSuggestions, setSmartSuggestions] = useState<Array<{type: string, label: string}>>([]);

  // Content type configuration
  const contentTypes = [
    { id: 'text', label: 'Text', icon: <span className="text-gray-600">Aa</span> },
    { id: 'code', label: 'Code', icon: <Code size={16} className="text-blue-600" /> },
    { id: 'image', label: 'Image', icon: <ImageIcon size={16} className="text-emerald-600" /> },
    { id: 'audio', label: 'Audio', icon: <Mic size={16} className="text-yellow-600" /> },
    { id: 'document', label: 'Document', icon: <FileText size={16} className="text-orange-600" /> },
    { id: 'spreadsheet', label: 'Spreadsheet', icon: <Table size={16} className="text-green-600" /> },
    { id: 'chart', label: 'Chart', icon: <BarChart3 size={16} className="text-purple-600" /> },
  ];

  // Smart context-aware suggestions
  useEffect(() => {
    // Get recent messages to provide context
    const recentMessage = getLastAIMessage();
    
    // Simple rule-based content type suggestions
    if (recentMessage) {
      const suggestions: Array<{type: string, label: string}> = [];
      
      if (recentMessage.content.type === 'code') {
        suggestions.push({ type: 'code', label: 'Continue with code' });
      } else if (recentMessage.content.type === 'image') {
        suggestions.push({ type: 'image', label: 'Add another image' });
        suggestions.push({ type: 'text', label: 'Comment on image' });
      } else if (recentMessage.content.type === 'document') {
        suggestions.push({ type: 'document', label: 'Upload related document' });
        suggestions.push({ type: 'text', label: 'Ask about document' });
      }
      
      // Add text as default if no suggestions
      if (suggestions.length === 0) {
        suggestions.push({ type: 'text', label: 'Reply with text' });
      }
      
      setSmartSuggestions(suggestions);
    }
  }, [conversationId]);

  // Get last AI message for context
  function getLastAIMessage(): Message | null {
    try {
      const STORAGE_KEY = 'chat-flex-conversations';
      const savedData = localStorage.getItem(STORAGE_KEY);
      if (savedData) {
        const conversations = JSON.parse(savedData);
        const conversation = conversations.find((c: Conversation) => c.id === conversationId);
        
        if (conversation && conversation.messages) {
          // Find last AI message
          for (let i = conversation.messages.length - 1; i >= 0; i--) {
            if (conversation.messages[i].sender === 'ai') {
              return conversation.messages[i];
            }
          }
        }
      }
      return null;
    } catch (err) {
      console.error('Error getting last AI message:', err);
      return null;
    }
  }

  // Direct localStorage approach instead of using hooks
  function sendMessage(content: { type: string; content: string }) {
    if (!conversationId) return;
    setIsSending(true);
    
    try {
      // Create the user message
      const processedContent: Content = {
        type: content.type as Content['type'],
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
      
      // Create AI response based on content type
      setTimeout(() => {
        const aiResponse: Message = createAIResponse(content.type, content.content);
        
        // Save AI response to localStorage
        updateLocalStorage(aiResponse);
        setIsSending(false);
      }, 1000);
    } catch (err) {
      console.error('Error sending message:', err);
      setIsSending(false);
    }
  }
  
  // Create appropriate AI response based on content type
  function createAIResponse(contentType: string, userContent: string): Message {
    const timestamp = new Date();
    let responseContent: Content;
    
    switch (contentType) {
      case 'code':
        responseContent = {
          type: "code",
          language: "javascript",
          data: `// Here's an example implementation\nfunction example() {\n  console.log("This is a code response");\n}\n\nexample();`
        } as CodeContent;
        break;
        
      case 'image':
        responseContent = {
          type: "text",
          data: "I've received your image. It appears to show [content description would go here]."
        } as TextContent;
        break;
        
      case 'document':
        responseContent = {
          type: "text",
          data: "I've analyzed the document you shared. Here are the key points: [1] First point [2] Second point..."
        } as TextContent;
        break;
        
      default:
        responseContent = {
          type: "text",
          data: `I understand you sent a ${contentType} message. Here's my response to "${userContent.substring(0, 30)}${userContent.length > 30 ? '...' : ''}"`
        } as TextContent;
    }
    
    return {
      id: `msg-${Date.now()}-ai`,
      sender: "ai",
      timestamp,
      content: responseContent
    };
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
      type, 
      content: value 
    });
    
    setValue('');
    setIsAttachmentMenuOpen(false);
  }
  
  function handleTypeChange(newType: string) {
    // Cast to our expected type
    setType(newType as 'text' | 'image' | 'audio' | 'code' | 'document' | 'spreadsheet' | 'chart');
  }

  return (
    <div className="border-t  p-4 fixed-bottom  ">
      {/* Smart suggestions */}
      {smartSuggestions.length > 0 && (
        <div className="mb-3 flex gap-2 overflow-x-auto pb-2">
          {smartSuggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => handleTypeChange(suggestion.type)}
              className={`px-3 py-1.5 text-sm rounded-full border whitespace-nowrap
                ${type === suggestion.type 
                  ? 'bg-blue-50 border-blue-300 text-blue-700' 
                  : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'}
              `}
            >
              {suggestion.label}
            </button>
          ))}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="relative">
        <div className="flex bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
          {/* Attachment button */}
          <button 
            type="button"
            className="p-3 text-gray-500 hover:text-gray-700"
            onClick={() => setIsAttachmentMenuOpen(!isAttachmentMenuOpen)}
          >
            {isAttachmentMenuOpen ? <X size={20} /> : <Paperclip size={20} />}
          </button>
          
          {/* Input */}
          <div className="flex-grow">
            <ContextAwareInput
              type={type}
              value={value}
              onChange={setValue}
              placeholder={`${isSending ? 'Sending...' : `Type a ${type} message...`}`}
              disabled={isSending}
            />
          </div>
          
          {/* Send button */}
          <button 
            type="submit" 
            disabled={!value.trim() || isSending}
            className={`p-3 ${
              value.trim() && !isSending
                ? 'text-blue-600 hover:text-blue-800' 
                : 'text-gray-300 cursor-not-allowed'
            }`}
          >
            <Send size={20} />
          </button>
        </div>
        
        {/* Attachment menu */}
        {isAttachmentMenuOpen && (
          <div className="absolute bottom-full left-0 right-0 mb-2 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-lg">
            <h4 className="text-sm font-medium mb-2">Content type</h4>
            <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
              {contentTypes.map((cType) => (
                <button
                  key={cType.id}
                  type="button"
                  onClick={() => {
                    handleTypeChange(cType.id);
                    setIsAttachmentMenuOpen(false);
                  }}
                  className={`flex flex-col items-center justify-center p-3 rounded-lg transition-colors ${
                    type === cType.id 
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600' 
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <div className="w-8 h-8 flex items-center justify-center mb-1">
                    {cType.icon}
                  </div>
                  <span className="text-xs">{cType.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
