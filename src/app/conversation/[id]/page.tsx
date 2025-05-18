'use client'
import { useParams } from 'next/navigation';
import dynamic from 'next/dynamic';

// Load ChatContainer only on the client
const ChatContainer = dynamic(
  () => import('@/components/chat/ChatContainer'),
  { ssr: false }
);

export default function ConversationPage() {
  // Use the hook instead of React.use to get params
  const params = useParams();
  const id = params?.id as string;
  
  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      {/* Now ChatContainer will only mount on the client */}
      <ChatContainer conversationId={id} />
    </div>
  );
}