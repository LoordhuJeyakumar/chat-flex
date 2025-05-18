export type Sender = 'user' | 'ai';

export type ContentType = 'text' | 'code' | 'image' | 'audio' | 'document' | 'spreadsheet' | 'chart';

export type ThinkingStep = {
  step: string;
  content: string;
};

export type ToolExecution = {
  name: string;
  execution: string;
  result: string;
};

export interface BaseContent {
  type: ContentType;
  data: any;
}

export interface TextContent extends BaseContent {
  type: 'text';
  data: string;
}

export interface CodeContent extends BaseContent {
  type: 'code';
  language: string;
  data: string;
}

export interface ImageContent extends BaseContent {
  type: 'image';
  data: string; // URL or base64
  caption?: string;
}

export interface AudioContent extends BaseContent {
  type: 'audio';
  data: string; // URL or base64
  duration?: number;
  transcript?: string;
}

export interface DocumentContent extends BaseContent {
  type: 'document';
  data: string; // URL or content
  metadata?: {
    title?: string;
    pageCount?: number;
    fileType?: string;
  };
}

export interface SpreadsheetContent extends BaseContent {
  type: 'spreadsheet';
  data: any[]; // Array of objects
  metadata?: {
    columns: string[];
    summary?: string;
  };
}

export interface ChartContent extends BaseContent {
  type: 'chart';
  chartType: 'bar' | 'line' | 'pie' | 'scatter';
  data: any;
  options?: any;
}

export type MessageContent = 
  | TextContent
  | CodeContent
  | ImageContent
  | AudioContent
  | DocumentContent
  | SpreadsheetContent
  | ChartContent;

export interface MessageContext {
  thread?: string;
  references?: string[]; // IDs of referenced messages
  confidence?: number;
}

export interface Message {
  id: string;
  sender: Sender;
  timestamp: Date;
  content: MessageContent;
  context?: MessageContext;
  thinking?: ThinkingStep[];
  tools?: ToolExecution[];
}