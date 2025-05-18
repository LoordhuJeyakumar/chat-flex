// app/api/mock/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { Conversation } from '@/types/core'

// Use relative imports instead of absolute paths
import mockStore from '../../../data/mockStore'
import { getConversations, addConversation } from '../lib/db'

// Debug logging
console.log('Loading main mock API route handler');

// Debug - print the initial conversations to ensure they're loaded
console.log(`Store has ${mockStore.conversations.length} initial conversations`);

export async function GET() {
  try {
    // Try to get from file-system first
    const conversations = getConversations();
    console.log(`GET: Retrieved ${conversations.length} conversations from DB`);
    return NextResponse.json(conversations);
  } catch (err) {
    // Fall back to in-memory store on error
    console.error('Error accessing filesystem DB, falling back to memory store:', err);
    return NextResponse.json(mockStore.getConversations());
  }
}

export async function POST(req: NextRequest) {
  try {
    const newConv = (await req.json()) as Conversation
    
    // Basic validation
    if (!newConv.id) {
      return NextResponse.json({ error: 'Missing id' }, { status: 400 })
    }
    
    // Try to add to file-system DB
    console.log(`Creating new conversation with ID: ${newConv.id}`)
    const success = addConversation(newConv);
    
    if (success) {
      console.log(`Successfully added conversation to DB: ${newConv.id}`);
    } else {
      console.log(`Failed to add to DB, adding to memory store: ${newConv.id}`);
      // Fall back to in-memory store
      mockStore.addConversation(newConv);
    }
    
    return NextResponse.json(newConv, { status: 201 })
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error'
    console.error('POST error:', errorMessage)
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
