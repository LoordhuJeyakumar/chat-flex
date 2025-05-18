'use client';

import { useCallback, useEffect } from 'react';
import { Message, Content } from '@/types/core';

export interface ContentSuggestion {
  type: string;
  confidence: number;
}

interface ContextAnalyzerProps {
  messages?: Message[];
  onSuggestionChange?: (suggestion: ContentSuggestion | null) => void;
}

export default function ContextAnalyzer({ 
  messages = [],
  onSuggestionChange 
}: ContextAnalyzerProps) {
  
  /**
   * Analyze the conversation context to suggest the next content type
   */
  const analyzeContext = useCallback(() => {
    if (messages.length === 0) return null;
    
    // Get the last message
    const lastMessage = messages[messages.length - 1];
    if (lastMessage.sender !== 'ai') return null;
    
    const content = extractTextContent(lastMessage.content);
    
    // Simple keyword-based suggestion
    if (content.includes('code') || content.includes('function') || content.includes('syntax')) {
      return { type: 'code', confidence: 0.8 };
    } else if (content.includes('image') || content.includes('picture') || content.includes('photo')) {
      return { type: 'image', confidence: 0.8 };
    } else if (content.includes('audio') || content.includes('sound') || content.includes('voice')) {
      return { type: 'audio', confidence: 0.8 };
    } else if (content.includes('document') || content.includes('pdf') || content.includes('file')) {
      return { type: 'document', confidence: 0.8 };
    } else if (content.includes('data') || content.includes('spreadsheet') || content.includes('table')) {
      return { type: 'spreadsheet', confidence: 0.8 };
    } else if (content.includes('chart') || content.includes('graph') || content.includes('visualization')) {
      return { type: 'chart', confidence: 0.8 };
    } else if (content.includes('diagram') || content.includes('flow') || content.includes('sequence')) {
      return { type: 'diagram', confidence: 0.8 };
    }
    
    // If multiple types of content in the conversation, suggest the most relevant next type
    // based on conversation flow
    const contentTypeCounts = countContentTypes(messages);
    
    // If there's a predominant content type, suggest it might continue
    const maxType = Object.entries(contentTypeCounts)
      .sort((a, b) => b[1] - a[1])[0];
    
    if (maxType && maxType[1] > 1 && maxType[0] !== 'text') {
      return { type: maxType[0], confidence: 0.6 };
    }
    
    // No clear suggestion
    return null;
  }, [messages]);
  
  // Run analysis whenever messages change and notify parent
  useEffect(() => {
    if (onSuggestionChange) {
      const suggestion = analyzeContext();
      onSuggestionChange(suggestion);
    }
  }, [messages, analyzeContext, onSuggestionChange]);
  
  // Helper function to extract text content from any content type
  const extractTextContent = (content: Content | string): string => {
    if (typeof content === 'string') return content;
    
    switch (content.type) {
      case 'text':
        return content.data;
      case 'code':
        return content.data;
      case 'image':
        return content.caption || '';
      case 'audio':
        return content.transcription || '';
      case 'document':
        return typeof content.data === 'string' ? content.data : '';
      case 'spreadsheet':
        return content.metadata?.summary || '';
      case 'chart':
        return JSON.stringify(content.data);
      case 'diagram':
        return content.data;
      default:
        return '';
    }
  };
  
  // Helper to count content types in the conversation
  const countContentTypes = (messages: Message[]): Record<string, number> => {
    const counts: Record<string, number> = {};
    
    messages.forEach(message => {
      if (typeof message.content === 'string') {
        counts['text'] = (counts['text'] || 0) + 1;
      } else {
        counts[message.content.type] = (counts[message.content.type] || 0) + 1;
      }
    });
    
    return counts;
  };
  
  // This is a headless component, so it doesn't render anything visible
  return null;
}
