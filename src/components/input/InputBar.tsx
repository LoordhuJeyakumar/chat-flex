'use client';
import { useChatActions } from '@/hooks/useChatActions';
import { useState } from 'react';
import ContentTypePicker from './ContentTypePicker';
import ContextAwareInput from './ContextAwareInput';

export default function InputBar({ conversationId }: { conversationId: string }) {
  const [type, setType] = useState<'text'|'image'|'audio'|'code'>('text');
  const [value, setValue] = useState<string>('');
  const sendMessage = useChatActions(conversationId);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!value.trim()) return;
    
    // Send the message using the format expected by useChatActions
    sendMessage({ 
      type: type, 
      content: value 
    });
    
    setValue('');
  }
  
  // Create a handler that matches ContentTypePicker's expected type
  const handleTypeChange = (newType: string) => {
    // Cast to our expected type since we know ContentTypePicker only returns valid types
    setType(newType as 'text'|'image'|'audio'|'code');
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center border-t bg-white p-2">
      <ContentTypePicker selected={type} onSelect={handleTypeChange} />
      <ContextAwareInput
        type={type}
        value={value}
        onChange={setValue}
        placeholder="Type a message or select media..."
      />
      <button 
        type="submit" 
        className="ml-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
        disabled={!value.trim()}
      >
        Send
      </button>
    </form>
  );
}
