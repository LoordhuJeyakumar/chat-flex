'use client';
import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import MessageList from './MessageList';
import InputBar from '@/components/input/InputBar';
import { useChat } from '@/hooks/useChat';
import ThinkingSteps from './ThinkingSteps';
import ToolUsage from './ToolUsage';
import { useConversationActions } from '@/hooks/useConversationActions';
import { useRouter } from 'next/navigation';
import { useConversationStore } from '@/store/conversationStore';
import { Conversation,  Annotation } from '@/types/core';
import { MessageSquare, PenLine, ExternalLink, ClipboardCheck, Share2, Download, Trash2, RotateCw } from 'lucide-react';

// Use same key as other hooks
const STORAGE_KEY = 'chat-flex-conversations';

export default function ChatContainer({ conversationId }: { conversationId?: string }) {
  const router = useRouter();
  // Use useMemo to avoid re-creating the current ID on each render
  const currentId = useMemo(() => conversationId || '', [conversationId]);
  const [isCreating, setIsCreating] = useState(false);
  const [isAnnotating, setIsAnnotating] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<string | null>(null);
  const [annotations, setAnnotations] = useState<Record<string, Annotation[]>>({});
  const [viewMode, setViewMode] = useState<'standard' | 'focused' | 'presentation'>('standard');
  const containerRef = useRef<HTMLDivElement>(null);
  
  const addConversation = useConversationStore(s => s.addConversation);
  
  // Only fetch data if we have a current ID
  const { thinking, toolUsage, loading, error } = useChat(currentId);
  const { createConversation } = useConversationActions();
  
  // EMERGENCY FIX: Check if conversation exists and create it if it doesn't
  const fixMissingConversation = useCallback((id: string) => {
    if (!id) return;
    
    console.log(`[EMERGENCY] Checking if conversation ${id} exists in localStorage`);
    
    if (typeof window !== 'undefined') {
      try {
        // Read localStorage
        const saved = localStorage.getItem(STORAGE_KEY);
        const savedConvs = saved ? JSON.parse(saved) : [];
        
        // Check if conversation exists
        const exists = savedConvs.some((c: Conversation) => c.id === id);
        
        if (!exists) {
          console.log(`[EMERGENCY] Conversation ${id} not found - creating it now!`);
          
          // Create a new conversation with this ID
          const newConv: Conversation = {
            id,
            title: 'Recovered Conversation',
            description: 'This conversation was automatically recovered',
            messages: []
          };
          
          // Add to localStorage
          savedConvs.unshift(newConv);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(savedConvs));
          
          // Also add to store
          addConversation(newConv);
          
          console.log(`[EMERGENCY] Created new conversation ${id} in localStorage`);
          
          // Force refresh after a moment
          setTimeout(() => {
            window.location.reload();
          }, 100);
          
          return true;
        }
        
        return exists;
      } catch (err) {
        console.error('[EMERGENCY] Error in fixMissingConversation:', err);
      }
    }
    
    return false;
  }, [addConversation]);
  
  // Create conversation if needed
  useEffect(() => {
    // Only create new conversation if conversationId is not provided
    if (!conversationId && !isCreating) {
      handleCreateConversation();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId, isCreating]);
  
  // Handle creating a new conversation
  const handleCreateConversation = async () => {
    try {
      setIsCreating(true);
      const { id, error: createError } = await createConversation();
      
      if (createError) {
        console.error("Error creating conversation:", createError);
        alert(`Could not start a new conversation: ${createError}`);
      } else if (id) {
        router.replace(`/conversation/${id}`);
      }
    } catch (err) {
      console.error("Failed to create conversation:", err);
      alert("An error occurred while creating a new conversation");
    } finally {
      setIsCreating(false);
    }
  };

  // Check if we need to fix the conversation
  useEffect(() => {
    if (error && currentId) {
      console.log(`[ERROR_FIX] Got error ${error} for conversation ${currentId}`);
      if (error.includes('Not Found')) {
        fixMissingConversation(currentId);
      }
    }
  }, [error, currentId, fixMissingConversation]);

  // Handle annotations
  const handleAnnotate = (messageId: string) => {
    setIsAnnotating(true);
    setSelectedMessage(messageId);
  };

  const handleAddAnnotation = (messageId: string, annotation: Annotation) => {
    setAnnotations(prev => {
      const existing = prev[messageId] || [];
      return {
        ...prev,
        [messageId]: [...existing, annotation]
      };
    });
  };

  // Get conversation title and metadata
  const getConversationTitle = (): string => {
    if (!currentId || typeof window === 'undefined') return 'Chat';
    
    try {
      const savedData = localStorage.getItem(STORAGE_KEY);
      if (savedData) {
        const conversations = JSON.parse(savedData);
        const conversation = conversations.find((c: Conversation) => c.id === currentId);
        
        if (conversation) {
          return conversation.title || 'Untitled Conversation';
        }
      }
      return 'Untitled Conversation';
    } catch (err) {
      console.error('Error getting conversation title:', err);
      return 'Chat';
    }
  };

  // Handle view mode toggles
  const toggleViewMode = () => {
    setViewMode(current => {
      if (current === 'standard') return 'focused';
      if (current === 'focused') return 'presentation';
      return 'standard';
    });
  };

  // If no conversation selected, show loading or create button
  if (!currentId) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
        <div className="max-w-md w-full p-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
          <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center mx-auto mb-6">
            <MessageSquare size={32} className="text-blue-600 dark:text-blue-400" />
          </div>
          <h2 className="text-2xl font-bold text-center mb-6 dark:text-white">Welcome to Chat-Flex</h2>
          {isCreating ? (
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-3"></div>
              <p className="text-gray-600 dark:text-gray-300">Creating new conversation...</p>
            </div>
          ) : (
            <button
              onClick={handleCreateConversation}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              <MessageSquare size={18} />
              <span>Start New Conversation</span>
            </button>
          )}
          
          <p className="mt-6 text-sm text-center text-gray-500 dark:text-gray-400">
            Adaptive Multi-Modal Chat Interface supporting rich media interactions
          </p>
        </div>
      </div>
    );
  }

  // Show loading state
  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col items-center gap-3 p-6 rounded-lg bg-white dark:bg-gray-800 shadow-md">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading conversation...</p>
        </div>
      </div>
    );
  }
  
  // Handle errors - with retry option or create new conversation
  if (error) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
        <div className="max-w-md w-full p-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
          <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center mx-auto mb-6">
            <Trash2 size={32} className="text-red-600 dark:text-red-400" />
          </div>
          <h3 className="text-xl font-bold text-center mb-4 text-red-600 dark:text-red-400">Error loading conversation</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4 text-center">{error}</p>
          <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 text-center">ID: {currentId}</p>
          <div className="flex gap-4">
            <button 
              onClick={() => {
                // Try to fix the conversation first
                fixMissingConversation(currentId);
                window.location.reload();
              }}
              className="flex-1 px-4 py-3 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors flex items-center justify-center gap-2"
            >
              <RotateCw size={16} />
              <span>Fix & Retry</span>
            </button>
            <button 
              onClick={handleCreateConversation} 
              className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              <MessageSquare size={16} />
              <span>New Chat</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Render chat UI when everything is ready
  return (
    <div 
      ref={containerRef}
      className={`flex flex-col flex-1 bg-gray-50 dark:bg-gray-900 transition-all duration-300 ${
        viewMode === 'focused' ? 'max-w-4xl mx-auto' : 
        viewMode === 'presentation' ? 'max-w-screen-lg mx-auto bg-white dark:bg-black' : ''
      }`}
    >
      {/* Chat header */}
      <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <h2 className="font-medium text-lg truncate">{getConversationTitle()}</h2>
        
        <div className="flex items-center space-x-2">
          {/* View mode toggle */}
          <button 
            onClick={toggleViewMode}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            title={`Switch to ${viewMode === 'standard' ? 'focused' : viewMode === 'focused' ? 'presentation' : 'standard'} view`}
          >
            {viewMode === 'standard' ? (
              <ExternalLink size={18} />
            ) : viewMode === 'focused' ? (
              <ClipboardCheck size={18} />
            ) : (
              <MessageSquare size={18} />
            )}
          </button>
          
          {/* Annotation tool */}
          <button 
            onClick={() => setIsAnnotating(!isAnnotating)}
            className={`p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 ${
              isAnnotating ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/20' : 'text-gray-500 dark:text-gray-400'
            }`}
            title="Toggle annotations"
          >
            <PenLine size={18} />
          </button>
          
          {/* Export/Share */}
          <button 
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            title="Share conversation"
          >
            <Share2 size={18} />
          </button>
          
          {/* Download */}
          <button 
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            title="Download conversation"
          >
            <Download size={18} />
          </button>
        </div>
      </div>
      
      {/* Main chat area with enhanced props */}
      <MessageList 
        conversationId={currentId}
        annotations={annotations} 
        onAnnotate={handleAnnotate}
        onAddAnnotation={handleAddAnnotation}
        isAnnotating={isAnnotating}
        selectedMessage={selectedMessage}
        viewMode={viewMode}
      />
      
      {thinking && thinking.length > 0 && (
        <div className={`border-t border-b border-gray-200 dark:border-gray-700 ${
          viewMode === 'presentation' ? 'hidden' : ''
        }`}>
          <ThinkingSteps steps={thinking} />
        </div>
      )}
      
      {toolUsage && toolUsage.length > 0 && (
        <div className={`border-t border-b border-gray-200 dark:border-gray-700 ${
          viewMode === 'presentation' ? 'hidden' : ''
        }`}>
          <ToolUsage usage={toolUsage.map(tu => ({ 
            tool: tu.name, 
            args: { execution: tu.execution, result: tu.result } 
          }))} />
        </div>
      )}
      
      {/* Enhanced input bar */}
      <InputBar conversationId={currentId} viewMode={viewMode} />
    </div>
  );
}