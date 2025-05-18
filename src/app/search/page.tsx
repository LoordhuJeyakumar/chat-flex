'use client';

import { useState } from 'react';
import ConversationSearchBox from '@/components/search/ConversationSearchBox';

export default function SearchPage() {
  const [conversationId, setConversationId] = useState<string>('conv-1');
  
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Conversation Search</h1>
      
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">
          Select a conversation for contextual search:
        </label>
        <select 
          value={conversationId} 
          onChange={(e) => setConversationId(e.target.value)}
          className="w-full md:w-64 p-2 border border-gray-300 rounded-md dark:border-gray-700 dark:bg-gray-800"
        >
          <option value="conv-1">Code Collaboration Session</option>
          <option value="conv-2">Data Analysis Session</option>
          <option value="conv-3">Document Review Session</option>
          <option value="conv-4">Voice Interaction Design Session</option>
          <option value="conv-5">Image Analysis and Enhancement</option>
          <option value="conv-6">Recipe Recommendation</option>
          <option value="conv-7">Photo Enhancement</option>
          <option value="conv-8">Travel Itinerary Generation</option>
        </select>
      </div>
      
      <div className="bg-white dark:bg-gray-900 shadow-md rounded-lg p-6">
        <ConversationSearchBox conversationId={conversationId} />
      </div>
      
      <div className="mt-8 bg-white dark:bg-gray-900 shadow-md rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4">Example Queries to Try</h2>
        
        <div className="space-y-4">
          <div>
            <h3 className="font-medium">For Code Collaboration:</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>{'How does memoization work?'}</li>
              <li>{'What optimizations can I make to a React component?'}</li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-medium">For Data Analysis:</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>{'How to visualize growth rate vs profit margin?'}</li>
              <li>{'Where should I focus marketing efforts next quarter?'}</li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-medium">For Document Review:</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>{'What monetization approaches work for health tracking apps?'}</li>
              <li>{'How should I design a health app dashboard?'}</li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-medium">For Voice Interaction:</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>{'How does conversational voice command handling work?'}</li>
              <li>{'How to recognize user preferences in voice interactions?'}</li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
} 