import { NextRequest, NextResponse } from 'next/server';
import { searchConversations, getRelevantAnswer, getConversationAwareAnswer } from '@/lib/searchMockData';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, conversationId, type = 'search' } = body;
    
    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }
    
    // Different search types
    switch (type) {
      case 'search':
        const results = searchConversations(query);
        return NextResponse.json({ results });
        
      case 'answer':
        const answer = getRelevantAnswer(query);
        return NextResponse.json({ answer });
        
      case 'conversationAware':
        if (!conversationId) {
          return NextResponse.json({ error: 'Conversation ID is required for conversationAware search' }, { status: 400 });
        }
        const contextualAnswer = getConversationAwareAnswer(query, conversationId);
        return NextResponse.json({ answer: contextualAnswer });
        
      default:
        return NextResponse.json({ error: 'Invalid search type' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error in search API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 