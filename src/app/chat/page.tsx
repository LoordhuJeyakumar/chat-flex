'use client';

import React,{ useState, useEffect } from 'react';
import { Menu, X, Plus, Trash2 } from 'lucide-react';
import AdaptiveMultiModalChat from '@/components/chat/AdaptiveMultiModalChat';
import { getConversationById, emptyConversation } from '@/data/mockData';
import { Conversation, Message } from '@/types/core';

export default function ChatPage() {
  const [activeConversationId, setActiveConversationId] = useState('conv-1');
  const [conversations, setConversations] = useState<Record<string, Conversation>>({
    'conv-1': getConversationById('conv-1') || {...emptyConversation, id: 'conv-1', title: 'Code Collaboration'},
    'conv-2': getConversationById('conv-2') || {...emptyConversation, id: 'conv-2', title: 'Data Analysis'},
    'conv-3': getConversationById('conv-3') || {...emptyConversation, id: 'conv-3', title: 'Document Review'}
  });
  const [currentMessages, setCurrentMessages] = useState<Message[]>(
    conversations[activeConversationId]?.messages || []
  );
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSmallScreen, setIsSmallScreen] = useState(false);

  // Update current messages when active conversation changes
  useEffect(() => {
    setCurrentMessages(conversations[activeConversationId]?.messages || []);
  }, [activeConversationId, conversations]);

  // Handle window resize for responsive layout
  useEffect(() => {
    const checkScreenSize = () => {
      setIsSmallScreen(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false);
      }
    };
    
    // Initial check
    checkScreenSize();
    
    // Add event listener
    window.addEventListener('resize', checkScreenSize);
    
    // Cleanup
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const handleSelectConversation = (id: string) => {
    setActiveConversationId(id);
    if (isSmallScreen) {
      setIsSidebarOpen(false);
    }
  };

  const handleCreateNewConversation = () => {
    // Generate a unique ID for the new conversation
    const newId = `conv-${Date.now()}`;
    
    // Create a new empty conversation
    const newConversation: Conversation = {
      ...emptyConversation,
      id: newId,
      title: `New Conversation ${Object.keys(conversations).length}`,
      messages: []
    };
    
    // Add the new conversation to the state
    setConversations(prev => ({
      ...prev,
      [newId]: newConversation
    }));
    
    // Set it as the active conversation
    setActiveConversationId(newId);
    
    // Explicitly reset current messages
    setCurrentMessages([]);
    
    // Close sidebar on mobile
    if (isSmallScreen) {
      setIsSidebarOpen(false);
    }
  };

  const handleDeleteConversation = (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the parent button click

    // Don't delete if it's the last conversation
    if (Object.keys(conversations).length <= 1) {
      return;
    }

    // Remove the conversation
    setConversations(prev => {
      const updated = {...prev};
      delete updated[id];
      return updated;
    });

    // If the active conversation is being deleted, switch to another one
    if (activeConversationId === id) {
      const remainingIds = Object.keys(conversations).filter(convId => convId !== id);
      if (remainingIds.length > 0) {
        setActiveConversationId(remainingIds[0]);
      }
    }
  };

  // Update message list when user sends new messages
  const handleMessagesUpdate = (messages: Message[]) => {
    setCurrentMessages(messages);
    
    // Also update the conversation in state
    setConversations(prev => ({
      ...prev,
      [activeConversationId]: {
        ...prev[activeConversationId],
        messages
      }
    }));
  };

  

  return (
  
    
    <div className="flex flex-col md:flex-row h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
      {/* Mobile sidebar toggle */}
      {isSmallScreen && (
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="fixed top-4 left-4 z-40 p-2 bg-white dark:bg-gray-800 rounded-md shadow-md"
          aria-label={isSidebarOpen ? 'Close sidebar' : 'Open sidebar'}
        >
          {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      )}

      {/* Sidebar */}
      <div 
        className={`${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } ${
          isSmallScreen ? 'fixed inset-y-0 left-0 z-30 w-72' : 'w-64'
        } transform transition-transform duration-200 ease-in-out border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 overflow-y-auto`}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Conversations</h2>
          <button 
            onClick={handleCreateNewConversation}
            className="p-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
            aria-label="New conversation"
          >
            <Plus size={18} />
          </button>
        </div>
        
        <div className="space-y-1">
          {Object.entries(conversations).map(([id, conversation]) => (
            <div key={id} className='flex w-48'>
            

            <button
        
        onClick={() => handleSelectConversation(id)}
        className={`w-full text-left p-2 rounded-lg flex items-center justify-between flex-2 ${
          activeConversationId === id 
          ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200' 
          : 'hover:bg-gray-100 text-gray-700 dark:hover:bg-gray-800 dark:text-gray-300'
          }`}
          >
              <div className="truncate flex-1">
                <div className="text-sm font-medium truncate">
                  {conversation.title}
                </div>
                {conversation.description && (
                  <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {conversation.description}
                  </div>
                )}
              </div>
              
              
            </button>
            {/* Delete button */}
              <button
                onClick={(e) => handleDeleteConversation(id, e)}
                className="ml-2 p-1 text-gray-400 hover:text-red-500 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 flex-1"
                aria-label="Delete conversation"
                >
                <Trash2 size={14} />
              </button>
                </div>
         
          ))}
        </div>
        
        <button 
          onClick={handleCreateNewConversation}
          className="w-full mt-4 p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium flex items-center justify-center"
        >
          <Plus size={16} className="mr-1" />
          New Conversation
        </button>
      </div>
    
      {/* Main content area */}
      <div className={`flex-1 flex flex-col ${isSmallScreen && isSidebarOpen ? 'opacity-50' : ''}`}>
        {/* Conversation header */}
        <div className="border-b border-gray-200 dark:border-gray-800 p-4 flex items-center">
          {isSmallScreen && (
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="mr-3 p-1.5 text-gray-500 hover:text-gray-700 rounded"
            >
              <Menu size={20} />
            </button>
          )}
          <div className="flex-1">
            <h1 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
              {conversations[activeConversationId]?.title || 'New Conversation'}
            </h1>
            {conversations[activeConversationId]?.description && (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {conversations[activeConversationId]?.description}
              </p>
            )}
          </div>
        </div>
        
        {/* Chat component */}
        <div className="flex-1 overflow-hidden">
          <AdaptiveMultiModalChat 
            conversationId={activeConversationId}
            initialMessages={currentMessages}
            onMessagesUpdate={handleMessagesUpdate}
          />
        </div>
      </div>
    </div>

  );
} 