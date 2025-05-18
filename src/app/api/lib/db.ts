// Simple file-based persistence layer for development
import fs from 'fs';
import path from 'path';
import { Conversation } from '@/types/core';
import initialData from './initialData';

// Get the paths (in a Node.js compatible way)
const DB_PATH = path.join(process.cwd(), '.data');
const CONVERSATIONS_FILE = path.join(DB_PATH, 'conversations.json');

// Make sure the directory exists
try {
  if (!fs.existsSync(DB_PATH)) {
    fs.mkdirSync(DB_PATH, { recursive: true });
    console.log('Created data directory:', DB_PATH);
  }
} catch (err) {
  console.error('Error creating data directory:', err);
}

// Initialize the data file if it doesn't exist
function ensureDataFile(): void {
  try {
    if (!fs.existsSync(CONVERSATIONS_FILE)) {
      // Write initial data
      fs.writeFileSync(CONVERSATIONS_FILE, JSON.stringify(initialData, null, 2), 'utf8');
      console.log('Created conversations file with initial data');
    }
  } catch (err) {
    console.error('Error initializing data file:', err);
    // Create an empty file as fallback
    if (!fs.existsSync(CONVERSATIONS_FILE)) {
      fs.writeFileSync(CONVERSATIONS_FILE, JSON.stringify([]), 'utf8');
      console.log('Created empty conversations file');
    }
  }
}

// Read all conversations
export function getConversations(): Conversation[] {
  ensureDataFile();
  try {
    const data = fs.readFileSync(CONVERSATIONS_FILE, 'utf8');
    return JSON.parse(data) as Conversation[];
  } catch (err) {
    console.error('Error reading conversations:', err);
    return [];
  }
}

// Get a conversation by ID
export function getConversation(id: string): Conversation | undefined {
  const conversations = getConversations();
  return conversations.find(c => c.id === id);
}

// Add a new conversation
export function addConversation(conversation: Conversation): boolean {
  const conversations = getConversations();
  
  // Don't add if it already exists
  if (conversations.some(c => c.id === conversation.id)) {
    return false;
  }
  
  // Add to beginning of array
  conversations.unshift(conversation);
  
  // Save to file
  try {
    fs.writeFileSync(CONVERSATIONS_FILE, JSON.stringify(conversations, null, 2), 'utf8');
    console.log(`Added conversation ${conversation.id}`);
    return true;
  } catch (err) {
    console.error('Error saving conversation:', err);
    return false;
  }
}

// Update an existing conversation
export function updateConversation(id: string, updates: Partial<Conversation>): Conversation | null {
  const conversations = getConversations();
  const index = conversations.findIndex(c => c.id === id);
  
  if (index === -1) {
    return null;
  }
  
  const updatedConversation = { ...conversations[index], ...updates };
  conversations[index] = updatedConversation;
  
  try {
    fs.writeFileSync(CONVERSATIONS_FILE, JSON.stringify(conversations, null, 2), 'utf8');
    console.log(`Updated conversation ${id}`);
    return updatedConversation;
  } catch (err) {
    console.error('Error updating conversation:', err);
    return null;
  }
} 