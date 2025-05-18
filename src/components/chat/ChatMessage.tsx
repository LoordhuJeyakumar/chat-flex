'use client';
import { useState } from 'react';

import { ChevronDown, ChevronUp } from 'lucide-react';
import ImageViewer from '../content/ImageViewer';
import AudioPlayer from '../content/AudioPlayer';
import DocumentViewer from '../content/DocumentViewer';
import CodeEditor from '../content/CodeEditor';
import { Message, ThinkingStep, } from '@/types/core';

interface LayoutConfig {
  width: number;
  height: number;
  mode: string;
}

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
  const isUser = message.sender === 'user';
  
  // Render content based on type
  const renderContent = () => {
    // If no content type or it's text, just render the text content
    if (!message.content.type || message.content.type === 'text') {
      return <p className="whitespace-pre-wrap">{message.content.data}</p>;
    }
    
    // Render specialized content based on type
    switch (message.content.type) {
      case 'code':
        return (
          <CodeEditor
            initialCode={message.content.data}
            language={(message.content.language as string) || 'javascript'}
            readOnly={true}
            showExplanation={!isUser}
          />
        );
        
      case 'image':
        // For image content, we need proper ImageContent type
        if (message.content.data || message.content.data) {
          return (
            <ImageViewer
              content={{
                type: 'image',
                data: (message.content?.data as string) || (message.content?.data as string),
                caption: message.content.caption || ''
              }}
            />
          );
        }
        return <p>{message.content.data}</p>;
        
      case 'audio':
        // For audio content, we pass audioUrl and transcription
        if (message.content.data) {
          return (
            <AudioPlayer
              audioUrl={(message.content.data as string) || ''}
              transcription={message.content.transcription as string}
              
            />
          );
        }
        return <p>{message.content.data}</p>;
        
      case 'document':
        // For document content, we show the DocumentViewer
        if (message.content.data || message.content.fileType) {
          return (
            <DocumentViewer
              documentUrl={message.content.data as string}
              documentTitle={message.content.fileName as string}
              totalPages={message.content.totalPages as number || 1}
            />
          );
        }
        return <p>{message.content.data}</p>;
        
      default:
        // For any other content types, just show the text content
        return <p className="whitespace-pre-wrap">{message.content.data as string}</p>;
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
              {(message.thinking as ThinkingStep[]).map((step, index) => (
                <div key={index} className="pl-4 border-l-2 border-gray-200 dark:border-gray-700">
                  <p className="text-gray-600 dark:text-gray-400">{ step.step }</p>
                  <p className="text-gray-600 dark:text-gray-400">{ step.content }</p>
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