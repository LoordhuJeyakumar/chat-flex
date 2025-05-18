'use client';
import { useState, useRef, useEffect } from 'react';
import { Paperclip, Mic, Send, X } from 'lucide-react';
import ContentTypeSwitcher from './ContentTypeSwitcher';
import { ContentType } from '@/types/message';
import { ContentSuggestion } from '../context/ContextAnalyzer';

interface PreviewData {
  url?: string;
  name?: string;
  language?: string;
  content?: string;
  type?: string;
  size?: number;
  data?: string | ArrayBuffer | null;
  duration?: string;
}

interface MediaInputBarProps {
  onSend: (content: string, contentType: ContentType, metadata?: PreviewData) => void;
  placeholder?: string;
  suggestion?: ContentSuggestion | null;
  disabled?: boolean;
  className?: string;
}

export default function MediaInputBar({
  onSend,
  placeholder = 'Type a message...',
  suggestion,
  disabled = false,
  className = ''
}: MediaInputBarProps) {
  const [message, setMessage] = useState('');
  const [contentType, setContentType] = useState<ContentType>('text');
  const [isRecording, setIsRecording] = useState(false);
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Apply content type suggestion when provided
  useEffect(() => {
    if (suggestion && (suggestion?.confidence || 0) > 0.7) {
      setContentType(suggestion?.type as ContentType);
    }
  }, [suggestion]);
  
  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
  }, [message]);
  
  // Handle message input
  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    
    // Auto-detect content type based on input
    if (e.target.value.startsWith('```') || e.target.value.includes('function ')) {
      setContentType('code');
    }
  };
  
  // Handle key press (Enter to send)
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };
  
  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    const reader = new FileReader();
    
    // Determine content type based on file type
    let detectedType: ContentType = 'document';
    
    if (file.type.startsWith('image/')) {
      detectedType = 'image';
    } else if (file.type.startsWith('audio/')) {
      detectedType = 'audio';
    } else if (file.type.includes('spreadsheet') || file.name.endsWith('.csv') || file.name.endsWith('.xlsx')) {
      detectedType = 'spreadsheet';
    } else if (file.type.includes('javascript') || file.name.endsWith('.js') || file.name.endsWith('.ts')) {
      detectedType = 'code';
    }
    
    // Set the content type based on the file
    setContentType(detectedType);
    
    // Read file content
    reader.onload = (event) => {
      if (!event.target) return;
      
      const fileData: PreviewData = {
        name: file.name,
        type: file.type,
        size: file.size,
        data: event.target.result
      };
      
      setPreviewData(fileData);
    };
    
    if (detectedType === 'image') {
      reader.readAsDataURL(file);
    } else {
      reader.readAsText(file);
    }
  };
  
  // Start voice recording
  const startRecording = () => {
    setIsRecording(true);
    setContentType('audio');
    
    // In a real app, you would implement actual recording logic here
    // For demo purposes, we'll just simulate recording
    setTimeout(() => {
      setPreviewData({
        name: 'Voice recording',
        duration: '0:05',
        data: 'audio-data-placeholder'
      });
      setIsRecording(false);
    }, 3000);
  };
  
  // Handle send message
  const handleSend = () => {
    if (disabled) return;
    
    // Don't send empty messages
    if (!message.trim() && !previewData) return;
    
    // Send the message with appropriate content type
    onSend(message, contentType, previewData || undefined);
    
    // Reset the input
    setMessage('');
    setPreviewData(null);
    
    // Reset content type to text after sending
    setContentType('text');
    
    // Focus the textarea
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };
  
  // Trigger file input click
  const openFileSelector = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  return (
    <div className={`bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-2 ${className}`}>
      {/* Content type switcher */}
      <div className="flex items-center mb-2">
        <ContentTypeSwitcher
          currentType={contentType}
          onTypeChange={setContentType}
          previewData={previewData ?? undefined }
          onEditPreview={setPreviewData as (data: PreviewData | string | null) => void}
        />
        
        {suggestion && (
          <div className="ml-2 text-xs text-gray-500 dark:text-gray-400 flex items-center">
            <span>Suggested: {suggestion.type}</span>
            <button 
              className="ml-1 text-blue-500 hover:text-blue-600"
              onClick={() => setContentType(suggestion.type as ContentType)}
            >
              Use
            </button>
          </div>
        )}
      </div>
      
      {/* Input area */}
      <div className="flex items-end gap-2">
        <div className="flex-grow relative">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleMessageChange}
            onKeyDown={handleKeyPress}
            placeholder={placeholder}
            disabled={disabled}
            className="w-full resize-none rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-3 pr-10 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:text-gray-200"
            rows={1}
          />
          
          {/* Quick action buttons */}
          <div className="absolute right-2 bottom-2 flex items-center">
            {message.trim() && (
              <button 
                onClick={() => setMessage('')}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>
        
        {/* Action buttons */}
        <div className="flex items-center gap-1">
          {/* File attachment button */}
          <button
            onClick={openFileSelector}
            disabled={disabled}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500"
            title="Attach file"
          >
            <Paperclip size={20} />
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileSelect}
              className="hidden"
              accept="image/*,audio/*,.pdf,.doc,.docx,.js,.ts,.jsx,.tsx,.csv,.xlsx"
            />
          </button>
          
          {/* Voice recording button */}
          <button
            onClick={startRecording}
            disabled={disabled || isRecording}
            className={`p-2 rounded-full ${
              isRecording 
                ? 'bg-red-100 text-red-500 dark:bg-red-900/30 dark:text-red-400' 
                : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500'
            }`}
            title={isRecording ? 'Recording...' : 'Voice message'}
          >
            <Mic size={20} />
          </button>
          
          {/* Send button */}
          <button
            onClick={handleSend}
            disabled={disabled || (!message.trim() && !previewData)}
            className={`p-2 rounded-full ${
              message.trim() || previewData
                ? 'bg-blue-500 text-white hover:bg-blue-600'
                : 'bg-gray-200 text-gray-400 dark:bg-gray-700 dark:text-gray-500'
            }`}
            title="Send message"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}