'use client';

import { useState } from 'react';
import { useConversationSearch } from '@/hooks/useConversationSearch';
import { Search, Loader2 } from 'lucide-react';

interface SearchBoxProps {
  conversationId?: string;
}

export default function ConversationSearchBox({ conversationId }: SearchBoxProps) {
  const [query, setQuery] = useState('');
  const { results, answer, loading, error, search, getAnswer, getContextualAnswer } = useConversationSearch();
  const [searchMode, setSearchMode] = useState<'search' | 'answer' | 'contextual'>('answer');
  const [showResults, setShowResults] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setShowResults(true);
    
    if (query.trim() === '') return;
    
    if (searchMode === 'search') {
      await search(query);
    } else if (searchMode === 'contextual' && conversationId) {
      await getContextualAnswer(query, conversationId);
    } else {
      await getAnswer(query);
    }
  };

  const handleModeChange = (mode: 'search' | 'answer' | 'contextual') => {
    setSearchMode(mode);
    setShowResults(false);
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSearch} className="flex items-center gap-2 mb-4">
        <div className="relative flex-1">
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search conversations..."
            className="w-full p-2 pl-10 rounded-md border border-gray-300 dark:border-gray-700 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
        </div>
        <button
          type="submit"
          disabled={loading || query.trim() === ''}
          className="px-4 py-2 bg-blue-500 text-white rounded-md flex items-center gap-2 disabled:bg-blue-300 dark:disabled:bg-blue-800"
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : 'Search'}
        </button>
      </form>

      <div className="flex space-x-4 mb-4">
        <label className="flex items-center space-x-2">
          <input 
            type="radio" 
            checked={searchMode === 'answer'} 
            onChange={() => handleModeChange('answer')} 
            className="text-blue-500"
          />
          <span>Direct Answer</span>
        </label>
        
        <label className="flex items-center space-x-2">
          <input 
            type="radio" 
            checked={searchMode === 'contextual'} 
            onChange={() => handleModeChange('contextual')} 
            className="text-blue-500"
            disabled={!conversationId}
          />
          <span>Contextual Answer</span>
        </label>
        
        <label className="flex items-center space-x-2">
          <input 
            type="radio" 
            checked={searchMode === 'search'} 
            onChange={() => handleModeChange('search')} 
            className="text-blue-500"
          />
          <span>Search Results</span>
        </label>
      </div>

      {showResults && (
        <div className="mt-4">
          {error && <p className="text-red-500">{error}</p>}
          
          {!loading && !error && searchMode === 'search' && (
            <div className="space-y-4">
              <h3 className="font-medium">Search Results</h3>
              {results.length === 0 ? (
                <p className="text-gray-500">No results found</p>
              ) : (
                <ul className="space-y-4">
                  {results.map(result => (
                    <li key={result.messageId} className="p-4 border border-gray-200 dark:border-gray-700 rounded-md">
                      <div className="font-medium mb-2">Score: {result.relevanceScore}</div>
                      <div className="text-sm">
                        {result.messageContent.type === 'text' ? (
                          <p>{result.messageContent.data}</p>
                        ) : (
                          <p>Content type: {result.messageContent.type}</p>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
          
          {!loading && !error && (searchMode === 'answer' || searchMode === 'contextual') && (
            <div className="space-y-4">
              <h3 className="font-medium">{searchMode === 'contextual' ? 'Contextual Answer' : 'Answer'}</h3>
              {answer ? (
                <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-md">
                  <p>{answer}</p>
                </div>
              ) : (
                <p className="text-gray-500">No answer found</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
} 