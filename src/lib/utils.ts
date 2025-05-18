import { Content } from "@/types/core";
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  
  // If less than a minute ago
  if (diff < 60000) {
    return 'Just now';
  }
  
  // If less than an hour ago
  if (diff < 3600000) {
    const minutes = Math.floor(diff / 60000);
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  }
  
  // If today
  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  
  // If yesterday
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) {
    return `Yesterday at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  }
  
  // Otherwise show full date
  return date.toLocaleDateString([], { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// Truncates text to a certain length and adds ellipsis
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
}

// Get message content preview text based on content type
export function getMessagePreview(content: Content): string {
  if (!content) return "";
  
  switch (content.type) {
    case "text":
      return truncateText(content.data, 50);
    case "code":
      return `[Code: ${content.language}]`;
    case "image":
      return content.caption ? `[Image: ${truncateText(content.caption, 30)}]` : "[Image]";
    case "audio":
      return content.transcription 
        ? `[Audio: ${truncateText(content.transcription, 30)}]` 
        : "[Audio]";
    case "spreadsheet":
      return `[Spreadsheet: ${content.metadata?.summary || "Data"}]`;
    case "chart":
      return `[Chart: ${content.chartType}]`;
    case "document":
      return `[Document: ${content.fileName || "Document"}]`;
    case "diagram":
      return `[Diagram: ${content.diagramType}]`;
    case "drawing":
      return content.caption 
        ? `[Drawing: ${truncateText(content.caption, 30)}]` 
        : "[Drawing]";
    default:
      return "[Content]";
  }
}

// Generate random ID (for demo/mock purposes)
export function generateId(prefix: string = ''): string { 
  return `${prefix}${Math.random().toString(36).substring(2, 9)}`;
}


import { formatRelative, formatDistance } from 'date-fns';

/**
 * Get relative time from a given date.
 * @param {Date | string} inputDate - The date to compare against the current time.
 * @returns {string} - The relative time string.
 */
export const getRelativeTime = (inputDate: Date | string) => {
  if (!inputDate) {
    return "Invalid date input";
  }

  const date = new Date(inputDate);
  if (isNaN(date.getTime())) {
    return "Invalid date format";
  }

  const now = new Date();
  return Math.abs((date.getTime()) - (now.getTime())) < 7 * 24 * 60 * 60 * 1000
    ? formatRelative(date, now)
    : formatDistance(date, now, { addSuffix: true });
};



