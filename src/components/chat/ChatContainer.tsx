'use client';
import { useEffect, useState, useCallback, useMemo } from 'react';
import MessageList from './MessageList';
import InputBar from '@/components/input/InputBar';
import { useChat } from '@/hooks/useChat';
import ThinkingSteps from './ThinkingSteps';
import ToolUsage from './ToolUsage';
import { useConversationActions } from '@/hooks/useConversationActions';
import { useRouter } from 'next/navigation';
import { useConversationStore } from '@/store/conversationStore';
import { Conversation } from '@/types/core';

// Use same key as other hooks
const STORAGE_KEY = 'chat-flex-conversations';

export default function ChatContainer({ conversationId }: { conversationId?: string }) {
  const router = useRouter();
  // Use useMemo to avoid re-creating the current ID on each render
  const currentId = useMemo(() => conversationId || '', [conversationId]);
  const [isCreating, setIsCreating] = useState(false);
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

  // If no conversation selected, show loading or create button
  if (!currentId) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-gray-100 p-4">
        <h2 className="text-xl mb-4">Welcome to Chat-Flex</h2>
        {isCreating ? (
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mb-2"></div>
            <p>Creating new conversation...</p>
          </div>
        ) : (
          <button
            onClick={handleCreateConversation}
            className="px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Start New Conversation
          </button>
        )}
      </div>
    );
  }

  // Show loading state
  if (loading) {
    return <div className="flex-1 flex items-center justify-center">Loading conversation...</div>;
  }
  
  // Handle errors - with retry option or create new conversation
  if (error) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-red-600 p-4">
        <p className="mb-4">Error loading conversation: {error}</p>
        <p className="mb-2 text-sm text-gray-600">ID: {currentId}</p>
        <div className="flex gap-4">
          <button 
            onClick={() => {
              // Try to fix the conversation first
              fixMissingConversation(currentId);
              window.location.reload();
            }}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            Fix & Retry
          </button>
          <button 
            onClick={handleCreateConversation} 
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Create New Conversation
          </button>
        </div>
      </div>
    );
  }

  // Render chat UI when everything is ready
  return (
    <div className="flex flex-col flex-1 bg-gray-100">
      <MessageList conversationId={currentId} />
      {thinking && thinking.length > 0 && <ThinkingSteps steps={thinking} />}
      {toolUsage && toolUsage.length > 0 && (
        <ToolUsage usage={toolUsage.map(tu => ({ 
          tool: tu.name, 
          args: { execution: tu.execution, result: tu.result } 
        }))} />
      )}
      <InputBar conversationId={currentId} />
    </div>
  );
}