// app/api/mock/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { Conversation } from '@/types/core'

// Use relative imports instead of absolute paths
import mockStore from '../../../../data/mockStore'
import * as db from '../../lib/db'

// Debug logging
console.log('Loading ID-specific mock API route handler');

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  // Await params for dynamic segments (Next.js 15)
  const { id } = await context.params;
  console.log(`GET /${id}: Looking up conversation`);

  try {
    // Try filesystem DB first
    const conv = db.getConversation(id);
    
    if (conv) {
      console.log(`Found conversation ${id} in DB with ${conv.messages?.length || 0} messages`);
      return NextResponse.json(conv);
    }
    
    // Try in-memory store as fallback
    console.log(`Conversation ${id} not found in DB, trying memory store`);
    const memoryConv = mockStore.getConversation(id);
    
    if (!memoryConv) {
      console.log(`Conversation not found in memory store either: ${id}`);
      
      // Debug - list all available IDs in both stores
      console.log('File DB conversation IDs:', 
        db.getConversations().map((c: Conversation) => c.id).join(', '));
      console.log('Memory store conversation IDs:', 
        mockStore.conversations.map((c: Conversation) => c.id).join(', '));
        
      return NextResponse.json({ error: 'Not Found' }, { status: 404 });
    }
    
    console.log(`Found conversation ${id} in memory store with ${memoryConv.messages?.length || 0} messages`);
    return NextResponse.json(memoryConv);
    
  } catch (err) {
    // If filesystem fails, try memory store
    console.error(`Error accessing file DB for ${id}:`, err);
    
    const memoryConv = mockStore.getConversation(id);
    if (!memoryConv) {
      console.log(`Conversation not found in memory store fallback: ${id}`);
      return NextResponse.json({ error: 'Not Found' }, { status: 404 });
    }
    
    console.log(`Found conversation ${id} in memory store fallback with ${memoryConv.messages?.length || 0} messages`);
    return NextResponse.json(memoryConv);
  }
}