// import { Message } from './ChatContainer';
// import MessageItem from './MessageItem';

// interface MessageListProps {
//   messages: Message[];
// }

// export default function MessageList({ messages }: MessageListProps) {
//   return (
//     <div className="space-y-6">
//       {messages.map((message) => (
//         <MessageItem key={message.id} message={message} />
//       ))}
//     </div>
//   );
// }

'use client';
import { Message as Msg } from '@/types/core';
import { useChat } from '@/hooks/useChat';

export default function MessageList({ conversationId }: { conversationId: string }) {
  const { messages } = useChat(conversationId);
  
  return (
    <div className="flex-1 overflow-auto p-4 space-y-4">
      {messages?.length > 0 ? (
        messages.map(m => (
          <Message key={m.id} message={m} />
        ))
      ) : (
        <div className="text-center text-gray-500 py-6">
          No messages yet. Start a conversation!
        </div>
      )}
    </div>
  );
}

// Simple Message component (assume this was imported before)
function Message({ message }: { message: Msg }) {
  // Ensure content.data is rendered as a string
  const messageContent = typeof message.content.data === 'string' 
    ? message.content.data 
    : JSON.stringify(message.content.data);
    
  return (
    <div className={`p-4 rounded-lg ${message.sender === 'user' ? 'bg-blue-100 ml-12' : 'bg-gray-100 mr-12'}`}>
      <div className="font-semibold mb-1">{message.sender === 'user' ? 'You' : 'AI'}</div>
      <div>{messageContent}</div>
    </div>
  );
}