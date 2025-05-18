// Base types
export type Timestamp = Date;

export interface Position {
  section?: string;
  offset?: number;
  length?: number;
  x?: number;
  y?: number;
}

export interface Annotation {
  type?: "highlight" | "comment";
  position: Position;
  comment?: string;
  text?: string;
}

export interface FileMetadata {  fileName: string;  fileType: string;  totalPages: number;}

// Content Types
export interface TextContent {
  type: "text";
  data: string;
}

export interface CodeContent {
  type: "code";
  language: string;
  data: string;
}

export interface ImageContent {
  type: "image";
  data: string;
  caption: string;
}

export interface AudioContent {
  type: "audio";
  data: string;
  duration: number;
  transcription: string;
}

export interface SpreadsheetContent {
  type: "spreadsheet";
  data: Record<string, string | number | boolean | null | undefined>[];
  metadata: {
    columns: string[];
    summary?: string;
  };
}

export interface ChartData {
  labels?: string[];
  datasets: {
    label: string;
    data: { x: number; y: number; r: number; }[];
    backgroundColor?: string;
    borderColor?: string;
    fill?: boolean;
    r?: number;
  }[];
}

export interface ChartContent {
  type: "chart";
  chartType: "bar" | "line" | "pie" | "scatter" | "bubble" | "doughnut" | "radar" | "polarArea";
  data: {
    labels?: string[];
    datasets: {
      label: string;
      data: { x: number; y: number; r: number; }[];
      backgroundColor?: string | string[];
      borderColor?: string | string[];
      fill?: boolean;
      tension?: number;
      borderWidth?: number;
      radius?: number;
    }[];
  };
  options?: Record<string, unknown>;
}

export interface DocumentContent {
  type: "document";
  data: string;
  fileName?: string;
  fileType?: string;
  totalPages?: number;
  highlights?: Array<{
    text: string;
    page: number;
    color?: string;
  }>;
  annotations?: Annotation[];
  changes?: Array<{
    type: "addition" | "modification";
    section: string;
    content: string;
  }>;
  pages?: number;
}

export interface DrawingContent {
  type: "drawing";
  data: string;
  caption: string;
  strokes: Array<{
    points: Array<[number, number]>;
    color: string;
    width: number;
  }>;
  annotations?: Annotation[];
}

// Message-related types
export interface ThinkingStep {
  step: string;
  content: string;
}

export interface ToolUsage {
  name: string;
  execution: string;
  result: string;
}

export interface Message {
  id: string;
  sender: "user" | "ai";
  timestamp: Timestamp;
  content: Content;
  thinking?: ThinkingStep[];
  tools?: ToolUsage[];
  annotations?: Annotation[];
}

// Conversation type
export interface Conversation {
  id: string;
  title: string;
  description: string;
  messages: Message[];
}

// Diagram Types
export interface DiagramContent {
  type: "diagram";
  diagramType: "flowchart" | "sequence" | "state" | "erd" | "wireframe";
  data: string; // Always string (Mermaid/Graphviz syntax or JSON string)
  caption?: string;
  annotations?: Annotation[];
  renderingOptions?: {
    direction?: "TB" | "LR" | "BT" | "RL";
    theme?: "light" | "dark" | "neutral";
    layoutEngine?: "dagre" | "elk" | "manual";
  };
}

// If you need structured data, add a separate optional field
export interface FlowchartData {
  nodes: Array<{
    id: string;
    label: string;
    type: "start" | "end" | "operation" | "decision" | "input";
  }>;
  edges: Array<{
    source: string;
    target: string;
    label?: string;
  }>;
}

export interface DiagramContentWithStructuredData extends DiagramContent {
  structuredData?: FlowchartData; // Optional structured representation
  diagramType: "flowchart"; // Narrow type for flowchart
}

// Update the Content union type
export type Content = 
  | TextContent
  | CodeContent
  | ImageContent
  | AudioContent
  | SpreadsheetContent
  | ChartContent
  | DocumentContent
  | DrawingContent
  | DiagramContent
  | DiagramContentWithStructuredData;