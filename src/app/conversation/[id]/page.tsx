'use client'
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState, useCallback, useMemo } from 'react';
import { Conversation } from '@/types/core';
import MessageList from '@/components/chat/MessageList';
import InputBar from '@/components/input/InputBar';
import { useConversationStore } from '@/store/conversationStore';
import Link from 'next/link';
import { Loader2, AlertCircle, Home, RotateCw, MessageSquare } from 'lucide-react';
import { useConversationActions } from '@/hooks/useConversationActions';

// Storage key constant
const STORAGE_KEY = 'chat-flex-conversations';

export default function ConversationPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRecoveryMode, setIsRecoveryMode] = useState(false);
  const [recoveryStatus, setRecoveryStatus] = useState<'idle' | 'attempting' | 'success' | 'failed'>('idle');
  
  // Get conversation related functions from store and hooks
  const setMessages = useConversationStore(
    useCallback(state => state.setMessages, [])
  );
  const addConversation = useConversationStore(
    useCallback(state => state.addConversation, [])
  );
  const { createConversation } = useConversationActions();

  // Use memo to prevent recreating the conversationId
  const conversationId = useMemo(() => id, [id]);
  
  // Function to recover or create a conversation
  const recoverConversation = async () => {
    try {
      setIsRecoveryMode(true);
      setRecoveryStatus('attempting');
      
      // Try to create a conversation with this ID
      const newConv: Conversation = {
        id: conversationId,
        title: 'Recovered Conversation',
        description: 'This conversation was automatically recovered',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        messages: []
      };
      
      // Add to localStorage
      if (typeof window !== 'undefined') {
        try {
          const savedData = localStorage.getItem(STORAGE_KEY);
          const localConvs = savedData ? JSON.parse(savedData) : [];
          localConvs.unshift(newConv);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(localConvs));
        } catch (err) {
          console.error('[RECOVERY] Failed to save to localStorage:', err);
        }
      }
      
      // Add to store
      addConversation(newConv);
      setConversation(newConv);
      setRecoveryStatus('success');
      setLoading(false);
      setError(null);
      
      // Give it a moment to update store before continuing
      setTimeout(() => {
        window.location.reload();
      }, 1000);
      
      return true;
    } catch (err) {
      console.error('[RECOVERY] Error in recovery process:', err);
      setRecoveryStatus('failed');
      return false;
    }
  };
  
  // Create a new conversation and navigate to it
  const handleCreateNew = async () => {
    try {
      setLoading(true);
      const result = await createConversation();
      
      if (result.error) {
        setError(result.error);
        setLoading(false);
      } else if (result.id) {
        router.replace(`/conversation/${result.id}`);
      }
    } catch (err: any) {
      setError(err.message || "Couldn't create a new conversation");
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!conversationId) {
      setLoading(false);
      return;
    }

    let isMounted = true;
    let loadTimeout: NodeJS.Timeout;

    const loadConversationData = async () => {
      // Only load if still loading and component is mounted
      if (!loading || !isMounted) return;

      try {
        // First try to load from localStorage
        if (typeof window !== 'undefined') {
          console.log('[PAGE] Checking localStorage for conversation');
          const savedData = localStorage.getItem(STORAGE_KEY);
          
          if (savedData) {
            const savedConvs = JSON.parse(savedData);
            const savedConv = savedConvs.find((c: Conversation) => c.id === conversationId);
            
            if (savedConv && isMounted) {
              console.log('[PAGE] Found conversation in localStorage');
              setConversation(savedConv);
              if (savedConv.messages?.length > 0) {
                // Set messages in store for components that need them
                setMessages(conversationId, savedConv.messages);
              }
              setLoading(false);
              return;
            }
          }
        }
        
        // If not found in localStorage, fetch from API with timeout
        console.log('[PAGE] Fetching conversation from API');
        
        // Set up a timeout to guard against API hanging
        const timeoutPromise = new Promise((_, reject) => {
          loadTimeout = setTimeout(() => {
            reject(new Error('Request timed out'));
          }, 5000); // 5 seconds timeout
        });
        
        // Race between actual fetch and timeout
        const response = await Promise.race([
          fetch(`/api/mock/${conversationId}`),
          timeoutPromise
        ]) as Response;
        
        // Clear timeout since we got a response
        clearTimeout(loadTimeout);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch conversation: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (isMounted) {
          setConversation(data);
          if (data.messages?.length > 0) {
            setMessages(conversationId, data.messages);
          }
          
          // Save to localStorage
          if (typeof window !== 'undefined') {
            try {
              const savedData = localStorage.getItem(STORAGE_KEY);
              const localConvs = savedData ? JSON.parse(savedData) : [];
              const existingIndex = localConvs.findIndex((c: Conversation) => c.id === conversationId);
              
              if (existingIndex >= 0) {
                localConvs[existingIndex] = data;
              } else {
                localConvs.unshift(data);
              }
              
              localStorage.setItem(STORAGE_KEY, JSON.stringify(localConvs));
            } catch (e) {
              console.error('[PAGE] Error saving to localStorage:', e);
            }
          }
          
          setLoading(false);
        }
      } catch (err) {
        console.error('[PAGE] Error loading conversation:', err);
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Unknown error loading conversation');
          setLoading(false);
        }
      }
    };

    loadConversationData();

    return () => {
      isMounted = false;
      clearTimeout(loadTimeout);
    };
  }, [conversationId, loading, setMessages, addConversation]);

  // Loading state UI
  if (loading && !isRecoveryMode) {
    return (
      <div className="flex flex-1 items-center justify-center p-4 min-h-[70vh]">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 max-w-md w-full">
          <div className="flex flex-col items-center">
            <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
            <h3 className="text-xl font-semibold mb-2">Loading conversation</h3>
            <p className="text-gray-500 dark:text-gray-400 text-center mb-6">
              Retrieving your conversation data...
            </p>
            
            {/* Animated shimmer loading effect */}
            <div className="w-full space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-start gap-3 animate-pulse">
                  <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-2"></div>
                    <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded mb-1"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state with recovery UI
  if (error) {
    return (
      <div className="flex flex-1 items-center justify-center p-4 min-h-[70vh]">
        <div className="bg-background rounded-lg shadow-lg p-8 max-w-md w-full">
          {isRecoveryMode ? (
            <div className="flex flex-col items-center text-center">
              {recoveryStatus === 'attempting' && (
                <>
                  <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Recovering conversation</h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-2">
                    Creating a new conversation with ID: {conversationId?.substring(0, 8)}...
                  </p>
                  <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full mt-4 overflow-hidden">
                    <div className="h-full bg-primary animate-pulse" style={{width: '100%'}}></div>
                  </div>
                </>
              )}
              
              {recoveryStatus === 'success' && (
                <>
                  <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
                    <svg className="h-8 w-8 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Recovery successful!</h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-6">
                    Your conversation has been recovered. Reloading...
                  </p>
                </>
              )}
              
              {recoveryStatus === 'failed' && (
                <>
                  <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4">
                    <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Recovery failed</h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-6">
                    We couldn't recover your conversation. Please try another option.
                  </p>
                  <div className="flex flex-col gap-3 w-full">
                    <Link
                      href="/"
                      className="inline-flex justify-center items-center gap-2 py-2.5 px-4 rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/90 transition-colors"
                    >
                      <Home className="h-4 w-4" />
                      <span>Return Home</span>
                    </Link>
                    <button
                      onClick={handleCreateNew}
                      className="inline-flex justify-center items-center gap-2 py-2.5 px-4 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                    >
                      <MessageSquare className="h-4 w-4" />
                      <span>Start New Conversation</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4">
                <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Conversation not found</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                {error}
              </p>
              <div className="flex flex-col gap-3 w-full">
                <button
                  onClick={recoverConversation}
                  className="inline-flex justify-center items-center gap-2 py-2.5 px-4 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  <RotateCw className="h-4 w-4" />
                  <span>Recover Conversation</span>
                </button>
                <button
                  onClick={handleCreateNew}
                  className="inline-flex justify-center items-center gap-2 py-2.5 px-4 rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/90 transition-colors"
                >
                  <MessageSquare className="h-4 w-4" />
                  <span>Start New Conversation</span>
                </button>
                <Link
                  href="/"
                  className="inline-flex justify-center items-center gap-2 py-2.5 px-4 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  <Home className="h-4 w-4" />
                  <span>Return Home</span>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className="flex flex-1 items-center justify-center p-4 min-h-[70vh]">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-8 w-8 text-amber-600 dark:text-amber-400" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Conversation not available</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            We couldn't find the conversation you're looking for. It may have been deleted or doesn't exist.
          </p>
          <div className="flex flex-col gap-3">
            <Link
              href="/"
              className="inline-flex justify-center items-center gap-2 py-2.5 px-4 rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/90 transition-colors"
            >
              <Home className="h-4 w-4" />
              <span>Return to Home</span>
            </Link>
            <button
              onClick={handleCreateNew}
              className="inline-flex justify-center items-center gap-2 py-2.5 px-4 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <MessageSquare className="h-4 w-4" />
              <span>Start New Conversation</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Successfully loaded conversation
  return (
    <div className="flex flex-1 flex-col   overflow-hidden">
      <div className="bg-background border-b border-gray-200 dark:border-gray-700 py-3 px-4 lg:px-6">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100 truncate">
              {conversation.title || 'Untitled Conversation'}
            </h1>
            {conversation.description && (
              <p className="text-sm text-gray-500 dark:text-gray-400 truncate mt-0.5">
                {conversation.description}
              </p>
            )}
          </div>
        </div>
      </div>
      
      <div className="flex-1 overflow-hidden flex flex-col">
        <MessageList conversationId={conversationId} />
        <InputBar conversationId={conversationId} />
      </div>
    </div>
  );
}