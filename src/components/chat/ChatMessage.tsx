'use client';
import { useState } from 'react';
import { Message, LayoutConfig } from '@/types/core';
import { ChevronDown, ChevronUp } from 'lucide-react';
import ImageViewer from '../content/ImageViewer';
import AudioPlayer from '../content/AudioPlayer';
import DocumentViewer from '../content/DocumentViewer';
import CodeEditor from '../content/CodeEditor';

interface ChatMessageProps {
  message: Message;
  layout: LayoutConfig;
}

export default function ChatMessage({ message, layout }: ChatMessageProps) {
  const [showThinking, setShowThinking] = useState(false);
  
  // Format timestamp
  const formattedTime = new Date(message.timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  });
  
  // Determine if message is from user or AI
  const isUser = message.role === 'user';
  
  // Render content based on type
  const renderContent = () => {
    // If no content type or it's text, just render the text content
    if (!message.contentType || message.contentType === 'text') {
      return <p className="whitespace-pre-wrap">{message.content}</p>;
    }
    
    // Render specialized content based on type
    switch (message.contentType) {
      case 'code':
        return (
          <CodeEditor
            initialCode={message.content}
            language={(message.metadata?.language as string) || 'javascript'}
            readOnly={true}
            showExplanation={!isUser}
          />
        );
        
      case 'image':
        // For image content, we need proper ImageContent type
        if (message.metadata?.url || message.metadata?.data) {
          return (
            <ImageViewer
              content={{
                type: 'image',
                data: (message.metadata?.url as string) || (message.metadata?.data as string),
                caption: message.content || undefined
              }}
            />
          );
        }
        return <p>{message.content}</p>;
        
      case 'audio':
        // For audio content, we pass audioUrl and transcription
        if (message.metadata?.url || message.metadata?.data) {
          return (
            <AudioPlayer
              audioUrl={(message.metadata?.url as string) || (message.metadata?.data as string)}
              transcription={message.content}
              keyMoments={message.metadata?.keyMoments as Array<{time: number, label: string}>}
            />
          );
        }
        return <p>{message.content}</p>;
        
      case 'document':
        // For document content, we show the DocumentViewer
        if (message.metadata?.url) {
          return (
            <DocumentViewer
              documentUrl={message.metadata.url as string}
              documentTitle={message.metadata?.name as string}
              totalPages={message.metadata?.pages as number || 1}
            />
          );
        }
        return <p>{message.content}</p>;
        
      default:
        // For any other content types, just show the text content
        return <p className="whitespace-pre-wrap">{message.content}</p>;
    }
  };
  
  // Render thinking steps if available
  const renderThinking = () => {
    if (!message.thinking || message.thinking.length === 0) return null;
    
    return (
      <div className="mt-2 border-t border-gray-200 dark:border-gray-700 pt-2">
        <button
          onClick={() => setShowThinking(!showThinking)}
          className="flex items-center text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          {showThinking ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          <span className="ml-1">
            {showThinking ? "Hide thinking" : "Show thinking"}
          </span>
        </button>
        
        {showThinking && (
          <div className="mt-2 text-sm">
            <div className="space-y-2">
              {message.thinking.map((step, index) => (
                <div key={index} className="pl-4 border-l-2 border-gray-200 dark:border-gray-700">
                  <p className="text-gray-600 dark:text-gray-400">{step}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };
  
  return (
    <div 
      className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
      id={`message-${message.id}`}
    >
      <div 
        className={`
          max-w-[80%] p-4 rounded-lg
          ${layout.mode === 'focused' ? 'max-w-[95%]' : ''}
          ${isUser 
            ? 'bg-blue-100 dark:bg-blue-900/30 text-gray-800 dark:text-gray-100' 
            : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-100'
          }
        `}
      >
        {/* Message content */}
        <div className="mb-2">
          {renderContent()}
        </div>
        
        {/* Footer with time and thinking steps toggle */}
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>{formattedTime}</span>
        </div>
        
        {/* Thinking steps for AI messages */}
        {!isUser && renderThinking()}
      </div>
    </div>
  );
} 