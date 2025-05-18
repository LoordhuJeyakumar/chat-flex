'use client';
import { useRouter } from "next/navigation";
import { useConversationStore } from '@/store/conversationStore';
import { useConversationActions } from "@/hooks/useConversationActions";
import { useEffect, useState } from "react";

// Debug function to check localStorage
function debugLocalStorage() {
  if (typeof window === 'undefined') return;
  
  try {
    const key = 'chat-flex-conversations';
    const saved = localStorage.getItem(key);
    if (saved) {
      const data = JSON.parse(saved);
      console.log(`[NEW_PAGE] Found ${data.length} conversations in localStorage`);
      if (data.length > 0) {
        console.log(`[NEW_PAGE] First conversation ID: ${data[0].id}`);
        console.table(data.map(c => ({ id: c.id, title: c.title, msgCount: c.messages?.length || 0 })));
      }
    } else {
      console.log('[NEW_PAGE] No conversations found in localStorage');
    }
  } catch (err) {
    console.error('[NEW_PAGE] Error checking localStorage:', err);
  }
}

export default function NewConversationPage() {
  const { createConversation } = useConversationActions();
  const conversations = useConversationStore(s => s.conversations);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Debug conversations in the store
  useEffect(() => {
    console.log(`[NEW_PAGE] Store has ${conversations.length} conversations`);
    if (conversations.length > 0) {
      console.log(`[NEW_PAGE] First conversation ID: ${conversations[0].id}`);
    }
    
    // Debug localStorage too
    debugLocalStorage();
  }, [conversations]);

  useEffect(() => {
    let isMounted = true;
    console.log('[NEW_PAGE] Starting new conversation creation');

    const createNewConversation = async () => {
      try {
        console.log('[NEW_PAGE] Calling createConversation()');
        const result = await createConversation();
        
        if (!isMounted) {
          console.log('[NEW_PAGE] Component unmounted, aborting');
          return;
        }
        
        if (result.error) {
          console.error(`[NEW_PAGE] Error creating conversation: ${result.error}`);
          setError(result.error);
          setTimeout(() => {
            if (isMounted) router.push("/");
          }, 3000);
        } else if (result.id) {
          console.log(`[NEW_PAGE] Success! Created conversation: ${result.id}`);
          
          // Double-check the store
          setTimeout(() => {
            const storeConvs = useConversationStore.getState().conversations;
            console.log(`[NEW_PAGE] Store check: ${storeConvs.length} conversations`);
            const found = storeConvs.find(c => c.id === result.id);
            console.log(`[NEW_PAGE] Conversation in store: ${found ? 'YES' : 'NO'}`);
            
            // Also check localStorage
            debugLocalStorage();
            
            if (isMounted) {
              router.replace(`/conversation/${result.id}`);
            }
          }, 500);
        }
      } catch (err: any) {
        if (isMounted) {
          console.error('[NEW_PAGE] Uncaught error:', err);
          setError(err.message || "An unexpected error occurred");
          setTimeout(() => {
            if (isMounted) router.push("/");
          }, 3000);
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    createNewConversation();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-screen gap-4">
      {isLoading ? (
        <>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          <p className="text-lg">Starting a new conversation…</p>
          <p className="text-sm text-gray-500">Please wait while we set everything up...</p>
        </>
      ) : error ? (
        <>
          <div className="text-red-500 text-lg">
            Error: {error}
          </div>
          <p className="text-sm text-gray-500">Redirecting to home page...</p>
        </>
      ) : (
        <p className="text-lg">Redirecting to your new conversation...</p>
      )}
    </div>
  );
}