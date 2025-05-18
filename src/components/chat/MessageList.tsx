'use client';
import { Message as Msg, Content, Annotation, Conversation, ImageContent, AudioContent, DocumentContent, SpreadsheetContent, ChartContent } from '@/types/core';
import { useState, useEffect, useRef } from 'react';
import { Code,  FileText, Mic, Table, BarChart3, MessageSquare, PenLine, X, ChevronUp } from 'lucide-react';
import Image from 'next/image';

interface MessageListProps {
  conversationId: string;
  annotations?: Record<string, Annotation[]>;
  isAnnotating?: boolean;
  selectedMessage?: string | null;
  viewMode?: 'standard' | 'focused' | 'presentation';
  onAnnotate?: (messageId: string) => void;
  onAddAnnotation?: (messageId: string, annotation: Annotation) => void;
}

export default function MessageList({ 
  conversationId,
  annotations = {},
  isAnnotating = false,
  selectedMessage = null,
  viewMode = 'standard',
  onAnnotate,
  onAddAnnotation
}: MessageListProps) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [annotationText, setAnnotationText] = useState('');
  const [hoveredMessageId, setHoveredMessageId] = useState<string | null>(null);
  const [showScrollToTop, setShowScrollToTop] = useState(false);
  const endOfMessagesRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Load messages directly from localStorage
  useEffect(() => {
    if (!conversationId) return;
    
    const STORAGE_KEY = 'chat-flex-conversations';
    const loadMessages = () => {
      try {
        const savedData = localStorage.getItem(STORAGE_KEY);
        if (savedData) {
          const conversations = JSON.parse(savedData);
          const conversation = conversations.find((c: Conversation) => c.id === conversationId);
          
          if (conversation && conversation.messages) {
            setMessages(conversation.messages);
          } else {
            setMessages([]);
          }
        } else {
          setMessages([]);
        }
      } catch (err) {
        console.error('Error loading messages from localStorage:', err);
        setMessages([]);
      }
    };
    
    loadMessages();
    
    // Check for updates periodically
    const interval = setInterval(loadMessages, 1000);
    
    return () => {
      clearInterval(interval);
    };
  }, [conversationId]);

  // Check scroll position to show/hide the scroll-to-top button
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      // Show button when scrolled down more than 300px
      setShowScrollToTop(container.scrollTop > 300);
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  // Scroll to bottom when messages change - but only for new messages
  useEffect(() => {
    if (viewMode !== 'presentation') {
      // Store current scroll position and scroll height
      const container = containerRef.current;
      if (!container) return;
      
      const prevScrollHeight = container.scrollHeight;
      
      // Wait for DOM to update with new messages
      setTimeout(() => {
        // If we were at the bottom before new messages, scroll to bottom
        const isAtBottom = container.scrollTop + container.clientHeight >= prevScrollHeight - 50;
        if (isAtBottom || messages.length <= 1) {
          endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  }, [messages, viewMode]);

  // Handle creating a new annotation
  const handleAddAnnotation = () => {
    if (!selectedMessage || !annotationText.trim() || !onAddAnnotation) return;
    
    const newAnnotation: Annotation = {
      type: 'comment',
      position: { offset: 0 }, // Simple position for now
      comment: annotationText,
      text: '',
    };
    
    onAddAnnotation(selectedMessage, newAnnotation);
    setAnnotationText('');
  };

  // Scroll to top function
  const scrollToTop = () => {
    containerRef.current?.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <div 
      ref={containerRef}
      className={`flex-1 overflow-auto p-4 bg-background ${viewMode === 'presentation' ? 'max-w-3xl mx-auto' : ''} relative`}
    >
      {/* Scroll to top button */}
      {showScrollToTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-24 right-6 bg-primary text-primary-foreground p-2 rounded-full shadow-lg hover:bg-primary/90 transition-all z-20"
          aria-label="Scroll to top"
        >
          <ChevronUp className="h-5 w-5" />
        </button>
      )}
      
      {/* Annotation mode overlay */}
      {isAnnotating && (
        <div className="sticky top-0 z-10 bg-blue-50 dark:bg-blue-900/30 mb-4 p-3 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PenLine size={16} className="text-blue-600 dark:text-blue-400" />
            <span className="text-sm text-blue-800 dark:text-blue-300">Annotation mode active. Click on a message to annotate.</span>
          </div>
          <button 
            className="p-1 hover:bg-blue-100 dark:hover:bg-blue-800 rounded-full"
            onClick={() => onAnnotate && onAnnotate('')}
          >
            <X size={16} className="text-blue-600 dark:text-blue-400" />
          </button>
        </div>
      )}
      
      {/* Messages */}
      <div className={`space-y-6 ${viewMode === 'presentation' ? 'max-w-3xl mx-auto' : ''}`}>
        {messages.length > 0 ? (
          <>
            {messages.map((m: Msg) => (
              <Message 
                key={m.id} 
                message={m}
                isSelected={m.id === selectedMessage}
                isHovered={m.id === hoveredMessageId}
                isAnnotating={isAnnotating}
                annotations={annotations[m.id] || []}
                onAnnotate={() => onAnnotate && onAnnotate(m.id)}
                onMouseEnter={() => setHoveredMessageId(m.id)}
                onMouseLeave={() => setHoveredMessageId(null)}
                viewMode={viewMode}
              />
            ))}
            <div ref={endOfMessagesRef} />
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 py-12">
            <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
              <MessageSquare size={24} className="text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-xl font-medium mb-2 dark:text-gray-300">Start a new conversation</h3>
            <p className="text-sm text-center max-w-md dark:text-gray-400">
              Begin by sending a message. You can switch between different content types using the controls below.
            </p>
          </div>
        )}
      </div>
      
      {/* Annotation input */}
      {selectedMessage && isAnnotating && (
        <div className="fixed bottom-20 left-4 right-4 md:left-1/4 md:right-1/4 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4 z-20">
          <h3 className="text-sm font-medium mb-2 dark:text-white">Add annotation</h3>
          <textarea 
            value={annotationText}
            onChange={(e) => setAnnotationText(e.target.value)}
            className="w-full border border-gray-200 dark:border-gray-700 rounded p-2 mb-3 bg-white dark:bg-gray-900 dark:text-gray-100"
            placeholder="Type your annotation here..."
            rows={3}
          />
          <div className="flex justify-end gap-2">
            <button 
              onClick={() => onAnnotate && onAnnotate('')}
              className="px-3 py-1.5 border border-gray-200 dark:border-gray-700 rounded text-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleAddAnnotation}
              disabled={!annotationText.trim()}
              className="px-3 py-1.5 bg-blue-600 text-white rounded text-sm disabled:bg-gray-300 disabled:text-gray-500"
            >
              Add annotation
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

interface MessageProps {
  message: Msg;
  isSelected?: boolean;
  isHovered?: boolean;
  isAnnotating?: boolean;
  annotations?: Annotation[];
  viewMode?: 'standard' | 'focused' | 'presentation';
  onAnnotate?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

// Enhanced Message component with content type rendering
function Message({ 
  message, 
  isSelected = false,
  isAnnotating = false,
  annotations = [],
  viewMode = 'standard',
  onAnnotate,
  onMouseEnter,
  onMouseLeave
}: MessageProps) {
  
  // Message container with visual improvements
  return (
    <div 
      className={`animate-fadeIn transition-all duration-300 ${
        message.sender === 'user' 
          ? 'ml-12 mr-4 md:ml-16 md:mr-8' 
          : 'mr-12 ml-4 md:mr-16 md:ml-8'
      } ${isSelected ? 'ring-2 ring-blue-400 dark:ring-blue-600' : ''}`}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={isAnnotating ? onAnnotate : undefined}
    >
      <div className={`p-4 rounded-lg shadow-sm ${
        message.sender === 'user'
          ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-400 dark:border-blue-600'
          : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
      } ${isAnnotating ? 'cursor-pointer hover:bg-opacity-90' : ''}`}>
        <div className="flex items-center gap-2 mb-2">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            message.sender === 'user' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400' : 'bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-400'
          }`}>
            {message.sender === 'user' ? 'U' : 'AI'}
          </div>
          <div className="font-medium dark:text-gray-200">{message.sender === 'user' ? 'You' : 'Assistant'}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400 ml-auto">
            {new Date(message.timestamp).toLocaleTimeString()}
          </div>
          
          {/* Annotation indicator */}
          {annotations.length > 0 && (
            <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
              <PenLine size={14} />
              <span className="text-xs">{annotations.length}</span>
            </div>
          )}
        </div>
        
        <ContentRenderer content={message.content} viewMode={viewMode} />
        
        {/* Annotations display */}
        {annotations.length > 0 && (
          <div className="mt-3 border-t border-gray-200 dark:border-gray-700 pt-2">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Annotations:</p>
            {annotations.map((annotation, index) => (
              <div key={index} className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded text-sm mb-1 text-gray-800 dark:text-gray-200">
                {annotation.comment}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Content renderer based on content type
function ContentRenderer({ content, viewMode = 'standard' }: { content: Content, viewMode?: string }) {
  switch(content.type) {
    case 'text':
      return (
        <div className={`prose max-w-none dark:text-gray-200 ${viewMode === 'presentation' ? 'text-lg' : ''}`}>
          {content.data as string}
        </div>
      );
      
    case 'code':
      return (
        <div className="mt-2 rounded-md overflow-hidden">
          <div className="bg-gray-800 dark:bg-black text-white text-xs px-4 py-1 flex items-center">
            <Code size={14} className="mr-2" />
            <span>{(content as Content)?.type || 'Code'}</span>
          </div>
          <pre className={`bg-gray-900 dark:bg-gray-950 text-gray-100 p-4 overflow-x-auto ${
            viewMode === 'presentation' ? 'text-base' : 'text-sm'
          }`}>
            <code>{content.data as string}</code>
          </pre>
        </div>
      );
      
    case 'image':
      return (
        <div className="mt-2">
          <Image 
            src={content.data as string} 
            alt={(content as ImageContent).caption || 'Image'} 
            className={`rounded-md shadow-sm ${
              viewMode === 'presentation' ? 'max-h-96 mx-auto' : 'max-w-full'
            }`}
          />
          {(content as ImageContent).caption && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{(content as ImageContent).caption}</p>
          )}
        </div>
      );
      
    case 'audio':
      return (
        <div className="mt-2 flex items-center gap-2 bg-gray-100 dark:bg-gray-800 p-3 rounded-md">
          <Mic size={18} className="text-blue-600 dark:text-blue-400" />
          <audio controls src={content.data as string} className="w-full" />
          {(content as AudioContent).transcription && (
            <details className="text-sm mt-1 text-gray-700 dark:text-gray-300">
              <summary className="cursor-pointer">Transcription</summary>
              <p className="mt-1 p-2 bg-white dark:bg-gray-900 rounded">{(content as AudioContent).transcription}</p>
            </details>
          )}
        </div>
      );
      
    case 'document':
      return (
        <div className="mt-2">
          <a 
            href={content.data as string}
            target="_blank"
            rel="noopener noreferrer" 
            className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 p-3 rounded-md transition-colors"
          >
            <FileText size={18} className="text-blue-600 dark:text-blue-400" />
            <div>
              <div className="font-medium dark:text-gray-200">{(content as DocumentContent).fileName || 'Document'}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">{(content as DocumentContent).fileType || 'File'}</div>
            </div>
          </a>
        </div>
      );
      
    case 'spreadsheet':
      return (
        <div className="mt-2">
          <div className="flex items-center gap-2 mb-2">
            <Table size={18} className="text-green-600 dark:text-green-400" />
            <span className="font-medium dark:text-gray-200">Spreadsheet</span>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm">
              <thead className="bg-gray-100 dark:bg-gray-900">
                <tr>
                  {(content as SpreadsheetContent).metadata?.columns?.map((col: string, i: number) => (
                    <th key={i} className="py-2 px-3 border-b text-left font-medium dark:text-gray-200">{col}</th>
                  )) || <th className="py-2 px-3 dark:text-gray-200">Data</th>}
                </tr>
              </thead>
              <tbody>
                {Array.isArray(content.data) && content.data.map((row, i) => (
                  <tr key={i} className={i % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-850'}>
                    {Object.values(row).map((cell, j) => (
                      <td key={j} className="py-2 px-3 border-t dark:border-gray-700 dark:text-gray-300">{String(cell)}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
      
    case 'chart':
      return (
        <div className="mt-2">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 size={18} className="text-purple-600 dark:text-purple-400" />
            <span className="font-medium dark:text-gray-200">Chart ({(content as ChartContent).chartType || 'Unknown type'})</span>
          </div>
          <div className={`bg-gray-100 dark:bg-gray-800 p-4 rounded-md text-center ${
            viewMode === 'presentation' ? 'h-80' : 'h-40'
          }`}>
            <p className="text-gray-500 dark:text-gray-400">Chart visualization would render here</p>
          </div>
        </div>
      );
      
    default:
      return (
        <div className="prose max-w-none dark:text-gray-200">
          {typeof content.data === 'string' ? content.data : JSON.stringify(content.data)}
        </div>
      );
  }
}