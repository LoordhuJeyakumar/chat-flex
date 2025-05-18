'use client';
import { useRouter } from "next/navigation";
import { useConversationStore } from '@/store/conversationStore';
import { useConversationActions } from "@/hooks/useConversationActions";
import { useEffect, useState } from "react";
import { Loader2, AlertCircle, ArrowRight } from "lucide-react";

export default function NewConversationPage() {
  const { createConversation } = useConversationActions();
  const conversations = useConversationStore(s => s.conversations);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryAttempts, setRetryAttempts] = useState(0);
  const maxRetries = 3;

  useEffect(() => {
    let isMounted = true;
    let timeoutId: NodeJS.Timeout;
    
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
          
          // If we haven't reached max retries yet, try again automatically
          if (retryAttempts < maxRetries) {
            setRetryAttempts(prev => prev + 1);
            setError(`Attempt ${retryAttempts + 1}/${maxRetries}: ${result.error}. Retrying...`);
            
            timeoutId = setTimeout(() => {
              if (isMounted) createNewConversation();
            }, 1500);
            return;
          }
          
          setError(result.error);
        } else if (result.id) {
          console.log(`[NEW_PAGE] Success! Created conversation: ${result.id}`);
          
          // Verify the conversation exists in the store before navigating
          const storeConvs = useConversationStore.getState().conversations;
          const found = storeConvs.find(c => c.id === result.id);
          
          if (found) {
            router.replace(`/conversation/${result.id}`);
          } else {
            // If it's not in the store yet, wait a moment and check again
            timeoutId = setTimeout(() => {
              if (isMounted) {
                const updatedStoreConvs = useConversationStore.getState().conversations;
                const nowFound = updatedStoreConvs.find(c => c.id === result.id);
                
                if (nowFound || retryAttempts >= maxRetries) {
                  router.replace(`/conversation/${result.id}`);
                } else {
                  setRetryAttempts(prev => prev + 1);
                  createNewConversation();
                }
              }
            }, 800);
          }
        }
      } catch (err: any) {
        if (isMounted) {
          console.error('[NEW_PAGE] Uncaught error:', err);
          setError(err.message || "An unexpected error occurred");
          
          // Retry automatically on unexpected errors as well
          if (retryAttempts < maxRetries) {
            setRetryAttempts(prev => prev + 1);
            timeoutId = setTimeout(() => {
              if (isMounted) createNewConversation();
            }, 1500);
          } else {
            // After max retries, show redirect countdown
            timeoutId = setTimeout(() => {
              if (isMounted) router.push("/");
            }, 5000);
          }
        }
      } finally {
        if (isMounted && (error || retryAttempts >= maxRetries)) {
          setIsLoading(false);
        }
      }
    };

    createNewConversation();

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [retryAttempts]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden transition-all duration-300 transform">
        {isLoading ? (
          <div className="p-8 flex flex-col items-center">
            <div className="relative mb-4">
              <Loader2 className={`h-12 w-12 animate-spin text-primary ${
                retryAttempts > 0 ? 'text-amber-500' : ''
              }`} />
              {retryAttempts > 0 && (
                <span className="absolute top-0 right-0 flex h-4 w-4 items-center justify-center">
                  <span className="text-xs font-medium">{retryAttempts}</span>
                </span>
              )}
            </div>
            <h3 className="text-xl font-semibold mb-2 text-center">
              {retryAttempts > 0 ? 'Retrying...' : 'Creating your conversation'}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 text-center text-sm">
              {retryAttempts > 0 
                ? `Attempt ${retryAttempts}/${maxRetries}. Please wait...` 
                : "Setting up a new adaptive multi-modal conversation..."
              }
            </p>
            
            {/* Progress bar animation */}
            <div className="w-full h-1 bg-gray-200 dark:bg-gray-700 rounded-full mt-6 overflow-hidden">
              <div className="h-full bg-primary animate-pulse" style={{width: '100%'}}></div>
            </div>
          </div>
        ) : error ? (
          <div className="p-8">
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
              </div>
            </div>
            <h3 className="text-xl font-semibold mb-3 text-center">Something went wrong</h3>
            <p className="text-gray-500 dark:text-gray-400 text-center text-sm mb-6">
              {error}
            </p>
            <div className="flex flex-col gap-3">
              <button 
                onClick={() => {
                  setError(null);
                  setIsLoading(true);
                  setRetryAttempts(0);
                }}
                className="w-full py-2.5 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
              >
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Try Again</span>
              </button>
              <button
                onClick={() => router.push("/")}
                className="w-full py-2.5 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90 transition-colors flex items-center justify-center gap-2"
              >
                <ArrowRight className="h-4 w-4" />
                <span>Return Home</span>
              </button>
            </div>
            <p className="text-xs text-center text-gray-400 dark:text-gray-500 mt-6">
              Redirecting to home in 5 seconds...
            </p>
          </div> 
        ) : (
          <div className="p-8 flex flex-col items-center">
            <p className="text-lg">Redirecting to your new conversation...</p>
          </div>
        )}
      </div>
    </div>
  );
}