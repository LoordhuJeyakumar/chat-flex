'use client';
import { useEffect, useState } from 'react';
import { Message, ContentType, ContentSuggestion } from '@/types/core';

interface ContextAnalyzerProps {
  messages: Message[];
  onSuggestionChange?: (suggestion: ContentSuggestion | null) => void;
  children: React.ReactNode;
}

export default function ContextAnalyzer({ 
  messages, 
  onSuggestionChange,
  children 
}: ContextAnalyzerProps) {
  const [currentSuggestion, setCurrentSuggestion] = useState<ContentSuggestion | null>(null);
  const [patterns, setPatterns] = useState<Record<string, number>>({});
  
  // Analyze messages to detect patterns and suggest content types
  useEffect(() => {
    if (!messages.length) return;
    
    // Get the last few messages for context
    const recentMessages = messages.slice(-5);
    const lastMessage = messages[messages.length - 1];
    
    // Reset patterns if conversation shifts
    if (messages.length % 10 === 0) {
      setPatterns({});
    }
    
    // Track content type patterns
    const newPatterns = { ...patterns };
    recentMessages.forEach(message => {
      if (message.contentType) {
        newPatterns[message.contentType] = (newPatterns[message.contentType] || 0) + 1;
      }
    });
    setPatterns(newPatterns);
    
    // Analyze the last message content for keywords
    let suggestion: ContentSuggestion | null = null;
    
    if (lastMessage && lastMessage.role === 'assistant') {
      const content = typeof lastMessage.content === 'string' 
        ? lastMessage.content.toLowerCase()
        : '';
      
      // Check for code-related keywords
      if (
        content.includes('code') || 
        content.includes('function') || 
        content.includes('class') ||
        content.includes('programming') ||
        content.includes('syntax')
      ) {
        suggestion = {
          type: 'code',
          confidence: 0.8,
          reason: 'The conversation is about code or programming'
        };
      }
      // Check for image-related keywords
      else if (
        content.includes('image') || 
        content.includes('picture') || 
        content.includes('photo') ||
        content.includes('diagram') ||
        content.includes('visual')
      ) {
        suggestion = {
          type: 'image',
          confidence: 0.8,
          reason: 'The conversation is about images or visual content'
        };
      }
      // Check for audio-related keywords
      else if (
        content.includes('audio') || 
        content.includes('sound') || 
        content.includes('recording') ||
        content.includes('voice') ||
        content.includes('listen')
      ) {
        suggestion = {
          type: 'audio',
          confidence: 0.8,
          reason: 'The conversation is about audio content'
        };
      }
      // Check for document-related keywords
      else if (
        content.includes('document') || 
        content.includes('pdf') || 
        content.includes('text') ||
        content.includes('paper') ||
        content.includes('read')
      ) {
        suggestion = {
          type: 'document',
          confidence: 0.8,
          reason: 'The conversation is about documents or text content'
        };
      }
      // Check for data-related keywords
      else if (
        content.includes('data') || 
        content.includes('spreadsheet') || 
        content.includes('excel') ||
        content.includes('table') ||
        content.includes('row') ||
        content.includes('column')
      ) {
        suggestion = {
          type: 'spreadsheet',
          confidence: 0.8,
          reason: 'The conversation is about data or spreadsheets'
        };
      }
      // Check for chart-related keywords
      else if (
        content.includes('chart') || 
        content.includes('graph') || 
        content.includes('plot') ||
        content.includes('visualization') ||
        content.includes('trend')
      ) {
        suggestion = {
          type: 'chart',
          confidence: 0.8,
          reason: 'The conversation is about charts or data visualization'
        };
      }
    }
    
    // If no keyword match, suggest based on patterns
    if (!suggestion && Object.keys(newPatterns).length > 0) {
      // Find the most common content type
      const mostCommonType = Object.entries(newPatterns)
        .sort((a, b) => b[1] - a[1])[0];
      
      if (mostCommonType && mostCommonType[1] >= 2) {
        suggestion = {
          type: mostCommonType[0] as ContentType,
          confidence: 0.6,
          reason: 'Based on the conversation pattern'
        };
      }
    }
    
    // Only update if suggestion changed
    if (
      suggestion?.type !== currentSuggestion?.type || 
      suggestion?.confidence !== currentSuggestion?.confidence
    ) {
      setCurrentSuggestion(suggestion);
      if (onSuggestionChange) {
        onSuggestionChange(suggestion);
      }
    }
  }, [messages, patterns, currentSuggestion, onSuggestionChange]);
  
  return <>{children}</>;
} 