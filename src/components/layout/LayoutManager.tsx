'use client';
import { useState, useEffect } from 'react';
import { Message } from '@/types/core';

export type LayoutMode = 'compact' | 'expanded' | 'split' | 'focused';

interface LayoutConfig {
  mode: LayoutMode;
  focusedContentId?: string;
  sidebarVisible: boolean;
  mediaExpanded: boolean;
}

interface LayoutManagerProps {
  messages: Message[];
  currentContentType?: string;
  children: React.ReactNode;
  onLayoutChange?: (layout: LayoutConfig) => void;
}

export default function LayoutManager({
  messages,
  currentContentType,
  children,
  onLayoutChange
}: LayoutManagerProps) {
  const [layout, setLayout] = useState<LayoutConfig>({
    mode: 'compact',
    sidebarVisible: true,
    mediaExpanded: false
  });
  
  // Determine optimal layout based on content and screen size
  useEffect(() => {
    // Default to compact layout
    let newLayout: LayoutConfig = {
      mode: 'compact',
      sidebarVisible: true,
      mediaExpanded: false
    };
    
    // Check if we have messages
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      
      // Determine if we should expand media content
      const isMediaContent = currentContentType && 
        ['image', 'audio', 'document', 'spreadsheet', 'chart'].includes(currentContentType);
      
      // Determine if we should use split view for code
      const isCodeContent = currentContentType === 'code';
      
      // Check for consecutive media messages of the same type
      const hasConsecutiveMediaMessages = messages.length >= 2 && 
        messages.slice(-2).every(m => m.contentType === currentContentType);
      
      // Adjust layout based on content type
      if (isMediaContent) {
        if (hasConsecutiveMediaMessages || window.innerWidth >= 1024) {
          // Use expanded layout for media on large screens or when multiple media messages
          newLayout = {
            mode: 'expanded',
            sidebarVisible: window.innerWidth >= 1280,
            mediaExpanded: true
          };
        } else {
          // Use focused layout for single media on smaller screens
          newLayout = {
            mode: 'focused',
            focusedContentId: lastMessage.id,
            sidebarVisible: false,
            mediaExpanded: true
          };
        }
      } else if (isCodeContent) {
        // Use split view for code content
        newLayout = {
          mode: 'split',
          sidebarVisible: window.innerWidth >= 1280,
          mediaExpanded: false
        };
      }
    }
    
    // Only update if layout changed
    if (
      layout.mode !== newLayout.mode || 
      layout.sidebarVisible !== newLayout.sidebarVisible ||
      layout.mediaExpanded !== newLayout.mediaExpanded
    ) {
      setLayout(newLayout);
      if (onLayoutChange) {
        onLayoutChange(newLayout);
      }
    }
  }, [messages, currentContentType, layout, onLayoutChange]);
  
  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      // Update sidebar visibility based on screen size
      setLayout(prev => {
        const newLayout = { 
          ...prev,
          sidebarVisible: window.innerWidth >= 1024
        };
        
        if (onLayoutChange) {
          onLayoutChange(newLayout);
        }
        
        return newLayout;
      });
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [onLayoutChange]);
  
  return (
    <div className={`layout-manager layout-${layout.mode}`}>
      {children}
    </div>
  );
} 