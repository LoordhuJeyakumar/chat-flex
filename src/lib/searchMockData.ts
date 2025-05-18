import { mockConversations } from './mock-data';
import { Message, Content } from '@/types/core';

// Types for search results
interface SearchResult {
  conversationId: string;
  messageId: string;
  messageContent: Content;
  relevanceScore: number;
  context: {
    previousMessage?: Message;
    nextMessage?: Message;
  };
}

/**
 * Extract text content from any content type
 */
function extractTextFromContent(content: Content): string {
  switch (content.type) {
    case 'text':
      return content.data;
    case 'code':
      return content.data;
    case 'image':
      return content.caption || '';
    case 'audio':
      return content.transcription || '';
    case 'spreadsheet':
      return content.metadata?.summary || JSON.stringify(content.data);
    case 'chart':
      return JSON.stringify(content.data);
    case 'document':
      return content.data;
    case 'drawing':
      return content.caption || '';
    case 'diagram':
      return content.data;
    default:
      return '';
  }
}

/**
 * Calculate relevance score based on keyword matches
 */
function calculateRelevanceScore(text: string, query: string): number {
  const queryTerms = query.toLowerCase().split(/\s+/).filter(term => term.length > 3);
  let score = 0;
  
  for (const term of queryTerms) {
    const regex = new RegExp(term, 'gi');
    const matches = text.match(regex);
    if (matches) {
      score += matches.length;
    }
  }
  
  return score;
}

/**
 * Search through conversations for relevant answers to a query
 */
export function searchConversations(query: string, topK: number = 3): SearchResult[] {
  const results: SearchResult[] = [];
  
  // Search through all conversations
  for (const conversation of mockConversations) {
    // Skip empty conversations
    if (!conversation.messages || conversation.messages.length === 0) {
      continue;
    }
    
    // Search through all messages
    for (let i = 0; i < conversation.messages.length; i++) {
      const message = conversation.messages[i];
      
      // Only consider AI messages as potential answers
      if (message.sender !== 'ai') {
        continue;
      }
      
      // Extract text from content
      const textContent = extractTextFromContent(message.content);
      
      // Calculate relevance score
      const score = calculateRelevanceScore(textContent, query);
      
      // If there's some relevance, add to results
      if (score > 0) {
        results.push({
          conversationId: conversation.id,
          messageId: message.id,
          messageContent: message.content,
          relevanceScore: score,
          context: {
            previousMessage: i > 0 ? conversation.messages[i - 1] : undefined,
            nextMessage: i < conversation.messages.length - 1 ? conversation.messages[i + 1] : undefined,
          }
        });
      }
    }
  }
  
  // Sort by relevance score (descending)
  results.sort((a, b) => b.relevanceScore - a.relevanceScore);
  
  // Return top K results
  return results.slice(0, topK);
}

/**
 * Get the most relevant answer for a query
 */
export function getRelevantAnswer(query: string): string | null {
  const results = searchConversations(query, 1);
  
  if (results.length === 0) {
    return null;
  }
  
  const topResult = results[0];
  const content = topResult.messageContent;
  
  return extractTextFromContent(content);
}

/**
 * Get conversation-aware answer for a query
 * This checks the context of the conversation to provide more relevant answers
 */
export function getConversationAwareAnswer(query: string, conversationId: string): string | null {
  // Get the conversation
  const conversation = mockConversations.find(conv => conv.id === conversationId);
  if (!conversation) {
    return getRelevantAnswer(query);
  }
  
  // Get relevant answers across all data
  const results = searchConversations(query, 3);
  
  // Boost scores for results from the same conversation
  const boostedResults = results.map(result => {
    if (result.conversationId === conversationId) {
      return {
        ...result,
        relevanceScore: result.relevanceScore * 1.5 // 50% boost for same conversation
      };
    }
    return result;
  });
  
  // Re-sort after boosting
  boostedResults.sort((a, b) => b.relevanceScore - a.relevanceScore);
  
  if (boostedResults.length === 0) {
    return null;
  }
  
  const topResult = boostedResults[0];
  const content = topResult.messageContent;
  
  return extractTextFromContent(content);
} 