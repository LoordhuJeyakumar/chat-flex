"use client";

import { useState, useEffect, useRef } from "react";
import { useConversationSearch } from "@/hooks/useConversationSearch";
import {
  Send,
  Paperclip,
  X,
  Code,
  Mic,
  FileText,
  Table,
  BarChart3,
  ImageIcon,
  PenLine,
  ExternalLink,
  ClipboardCheck,
  MessageSquare,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import {
  Message,
  TextContent,
  Content,
  ChartContent,
  DocumentContent,
  ImageContent,
  AudioContent,
  DiagramContent,
  SpreadsheetContent,
  CodeContent,
} from "@/types/core";
import { ContentSuggestion } from "@/components/context/ContextAnalyzer";
import Image from "next/image";
import { ScrollArea } from "../ui/scroll-area";

// Types for state
type ContentType =
  | "text"
  | "code"
  | "image"
  | "audio"
  | "document"
  | "spreadsheet"
  | "chart"
  | "diagram";
type ViewMode = "standard" | "focused" | "presentation";

interface PreviewData {
  url?: string;
  name?: string;
  language?: string;
  content?: string;
  type?: string;
}

// Define a proper annotation type
interface MessageAnnotation {
  id: string;
  comment: string;
  timestamp: Date;
}

interface AdaptiveMultiModalChatProps {
  conversationId: string;
  initialMessages?: Message[];
  viewMode?: ViewMode;
  onMessagesUpdate?: (messages: Message[]) => void;
}

export default function AdaptiveMultiModalChat({
  conversationId,
  initialMessages = [],
  viewMode = "standard",
  onMessagesUpdate,
}: AdaptiveMultiModalChatProps) {
  // State
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputType, setInputType] = useState<ContentType>("text");
  const [inputValue, setInputValue] = useState("");
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);
  const [isAttachmentMenuOpen, setIsAttachmentMenuOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [contentSuggestion, setContentSuggestion] =
    useState<ContentSuggestion | null>(null);
  const [isAnnotating, setIsAnnotating] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<string | null>(null);
  const [annotations, setAnnotations] = useState<
    Record<string, MessageAnnotation[]>
  >({});
  const [currentViewMode, setCurrentViewMode] = useState<ViewMode>(viewMode);
  const [showThinking, setShowThinking] = useState(false);

  // Refs
  const endOfMessagesRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Search functionality
  const { getContextualAnswer } = useConversationSearch();

  // Add this function to toggle view mode
  const toggleViewMode = () => {
    setCurrentViewMode((prev) =>
      prev === "standard"
        ? "focused"
        : prev === "focused"
        ? "presentation"
        : "standard"
    );
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    if (endOfMessagesRef.current) {
      setTimeout(() => {
        endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100); // Small delay to ensure content is rendered
    }
  }, [messages]);

  // Reset messages when conversation changes
  useEffect(() => {
    setMessages(initialMessages);
  }, [conversationId, initialMessages]);

  // Handle message send
  const handleSendMessage = async () => {
    if (isSending || !inputValue.trim()) return;
    setIsSending(true);

    // Create user message
    const userMessageId = `msg-${Date.now()}`;
    const userMessage: Message = {
      id: userMessageId,
      sender: "user",
      timestamp: new Date(),
      content: createContent(inputType, inputValue, previewData),
    };

    // Add to messages
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    onMessagesUpdate?.(updatedMessages);

    // Reset input
    setInputValue("");
    setPreviewData(null);
    setIsAttachmentMenuOpen(false);

    // Get AI response
    try {
      const query = inputValue.trim();
      const contextualAnswer = await getContextualAnswer(query, conversationId);

      // Create AI response
      const aiMessage: Message = {
        id: `msg-${Date.now() + 1}`,
        sender: "ai",
        timestamp: new Date(),
        content: {
          type: "text",
          data:
            contextualAnswer ||
            "I don't have a specific answer for that. Is there something else you'd like to know?",
        },
      };

      // Add to messages after a small delay to simulate thinking
      setTimeout(() => {
        const messagesWithAiResponse = [...updatedMessages, aiMessage];
        setMessages(messagesWithAiResponse);
        onMessagesUpdate?.(messagesWithAiResponse);
        setIsSending(false);

        // Analyze the response to suggest next content type
        analyzeResponseForSuggestions(aiMessage);
      }, 1000);
    } catch (error) {
      console.error("Error getting response:", error);
      setIsSending(false);
    }
  };

  // Create content based on type
  const createContent = (
    type: ContentType,
    value: string,
    preview: PreviewData | null
  ): Content => {
    switch (type) {
      case "text":
        return { type, data: value } as TextContent;
      case "code":
        return {
          type,
          language: preview?.language || "javascript",
          data: value,
        } as CodeContent;
      case "image":
        return {
          type,
          data: preview?.url || "/api/placeholder/image",
          caption: value || "Image caption",
        } as ImageContent;
      case "audio":
        return {
          type,
          data: preview?.url || "/api/placeholder/audio",
          duration: 30,
          transcription: value || "Audio transcription",
        } as AudioContent;
      case "document":
        return {
          type,
          data: value || "Document content",
          fileName: preview?.name || "document.txt",
          fileType: "text/plain",
          totalPages: 1,
        } as DocumentContent;
      case "spreadsheet":
        return {
          type,
          data: tryParseJSON(value) || [],
          metadata: {
            columns: ["Column1", "Column2"],
            summary: "Spreadsheet data",
          },
        } as SpreadsheetContent;
      case "chart":
        return {
          type,
          chartType: "bar",
          data: tryParseJSON(value) || {
            datasets: [
              {
                label: "Sample Data",
                data: [
                  { x: 0, y: 10, r: 1 },
                  { x: 1, y: 20, r: 1 },
                  { x: 2, y: 15, r: 1 },
                ],
              },
            ],
          },
        } as ChartContent;
      case "diagram":
        return {
          type,
          diagramType: "flowchart",
          data: value || "graph TD\\nA-->B",
        } as DiagramContent;
      default:
        return { type: "text", data: value } as TextContent;
    }
  };

  // Helper to try parsing JSON
  const tryParseJSON = (value: string) => {
    try {
      return JSON.parse(value);
    } catch {
      return null;
    }
  };

  // Analyze response to suggest next content type
  const analyzeResponseForSuggestions = (message: Message) => {
    if (message.sender !== "ai") return;

    const content =
      typeof message.content === "string"
        ? message.content
        : message.content.type === "text"
        ? message.content.data
        : "";

    // Simple keyword-based suggestion
    if (
      content.includes("code") ||
      content.includes("function") ||
      content.includes("syntax")
    ) {
      setContentSuggestion({ type: "code", confidence: 0.8 });
    } else if (
      content.includes("image") ||
      content.includes("picture") ||
      content.includes("photo")
    ) {
      setContentSuggestion({ type: "image", confidence: 0.8 });
    } else if (
      content.includes("audio") ||
      content.includes("sound") ||
      content.includes("voice")
    ) {
      setContentSuggestion({ type: "audio", confidence: 0.8 });
    } else if (
      content.includes("document") ||
      content.includes("pdf") ||
      content.includes("file")
    ) {
      setContentSuggestion({ type: "document", confidence: 0.8 });
    } else if (
      content.includes("data") ||
      content.includes("spreadsheet") ||
      content.includes("table")
    ) {
      setContentSuggestion({ type: "spreadsheet", confidence: 0.8 });
    } else if (
      content.includes("chart") ||
      content.includes("graph") ||
      content.includes("visualization")
    ) {
      setContentSuggestion({ type: "chart", confidence: 0.8 });
    } else if (
      content.includes("diagram") ||
      content.includes("flow") ||
      content.includes("sequence")
    ) {
      setContentSuggestion({ type: "diagram", confidence: 0.8 });
    } else {
      setContentSuggestion(null);
    }
  };

  // Handle file selection
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Determine file type and set appropriate content type
    if (file.type.startsWith("image/")) {
      setInputType("image");
      setPreviewData({
        url: URL.createObjectURL(file),
        name: file.name,
      });
    } else if (file.type.startsWith("audio/")) {
      setInputType("audio");
      setPreviewData({
        url: URL.createObjectURL(file),
        name: file.name,
      });
    } else if (file.type.includes("pdf") || file.type.includes("document")) {
      setInputType("document");
      setPreviewData({
        name: file.name,
      });
    } else if (file.type.includes("csv") || file.type.includes("excel")) {
      setInputType("spreadsheet");
      setPreviewData({
        name: file.name,
      });
    } else if (
      file.name.endsWith(".js") ||
      file.name.endsWith(".ts") ||
      file.name.endsWith(".jsx") ||
      file.name.endsWith(".tsx")
    ) {
      setInputType("code");
      setPreviewData({
        name: file.name,
        language: file.name.split(".").pop() || "javascript",
      });
    }

    // Close attachment menu
    setIsAttachmentMenuOpen(false);
  };

  // Handle annotation
  const handleAnnotate = (messageId: string) => {
    if (messageId === selectedMessage) {
      setIsAnnotating(false);
      setSelectedMessage(null);
    } else {
      setIsAnnotating(true);
      setSelectedMessage(messageId);
    }
  };

  // Add annotation
  const handleAddAnnotation = (messageId: string, comment: string) => {
    const newAnnotation: MessageAnnotation = {
      id: `annotation-${Date.now()}`,
      comment,
      timestamp: new Date(),
    };

    setAnnotations((prev) => ({
      ...prev,
      [messageId]: [...(prev[messageId] || []), newAnnotation],
    }));

    setIsAnnotating(false);
    setSelectedMessage(null);
  };

  // Content type configuration
  const contentTypes = [
    {
      id: "text",
      label: "Text",
      icon: <span className="text-gray-600">Aa</span>,
    },
    {
      id: "code",
      label: "Code",
      icon: <Code size={16} className="text-blue-600" />,
    },
    {
      id: "image",
      label: "Image",
      icon: <ImageIcon size={16} className="text-emerald-600" />,
    },
    {
      id: "audio",
      label: "Audio",
      icon: <Mic size={16} className="text-yellow-600" />,
    },
    {
      id: "document",
      label: "Document",
      icon: <FileText size={16} className="text-orange-600" />,
    },
    {
      id: "spreadsheet",
      label: "Spreadsheet",
      icon: <Table size={16} className="text-green-600" />,
    },
    {
      id: "chart",
      label: "Chart",
      icon: <BarChart3 size={16} className="text-purple-600" />,
    },
  ];

  // Add an extra class based on viewMode
  const containerClasses = {
    standard: "",
    focused: "max-w-3xl mx-auto",
    presentation: "max-w-4xl mx-auto text-lg",
  };

  return (
    <div
      className={`flex flex-col h-full ${containerClasses[currentViewMode]}`}
    >
      {/* Add header */}
      <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <h2 className="font-medium text-lg truncate">Chat</h2>

        <div className="flex items-center space-x-2">
          {/* View mode toggle */}
          <button
            onClick={toggleViewMode}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            title={`Switch to ${
              currentViewMode === "standard"
                ? "focused"
                : currentViewMode === "focused"
                ? "presentation"
                : "standard"
            } view`}
          >
            {currentViewMode === "standard" ? (
              <ExternalLink size={18} />
            ) : currentViewMode === "focused" ? (
              <ClipboardCheck size={18} />
            ) : (
              <MessageSquare size={18} />
            )}
          </button>

          {/* Annotation tool */}
          <button
            onClick={() => setIsAnnotating(!isAnnotating)}
            className={`p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 ${
              isAnnotating
                ? "text-blue-600 bg-blue-50 dark:bg-blue-900/20"
                : "text-gray-500 dark:text-gray-400"
            }`}
            title="Toggle annotations"
          >
            <PenLine size={18} />
          </button>
        </div>
      </div>

      {/* Messages container */}
      <div
        ref={containerRef}
        className="flex-1 overflow-hidden py-4 px-4 md:px-6"
      >
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-4">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-4">
              <Send size={24} className="text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="text-xl font-medium mb-2">Start a conversation</h2>
            <p className="text-gray-500 dark:text-gray-400 max-w-md">
              Send a message to start chatting. You can use different content
              types including text, code, images, audio, and more.
            </p>
          </div>
        ) : (
          <ScrollArea className="h-[calc(100vh-180px)] md:h-[calc(100vh-210px)] w-full">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`mb-4 ${
                  message.sender === "user" ? "ml-8 md:ml-16" : "mr-8 md:mr-16"
                }`}
                onClick={
                  isAnnotating && selectedMessage !== message.id
                    ? () => handleAnnotate(message.id)
                    : undefined
                }
              >
                <div
                  className={`p-4 rounded-lg ${
                    message.sender === "user"
                      ? "bg-blue-50 dark:bg-blue-900/20 ml-auto rounded-tr-none"
                      : "bg-white dark:bg-gray-800 rounded-tl-none border border-gray-200 dark:border-gray-700"
                  } ${
                    message.id === selectedMessage ? "ring-2 ring-blue-500" : ""
                  } ${isAnnotating ? "cursor-pointer" : ""}`}
                >
                  <div className="flex items-center mb-2">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 ${
                        message.sender === "user"
                          ? "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400"
                          : "bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-400"
                      }`}
                    >
                      {message.sender === "user" ? "U" : "AI"}
                    </div>
                    <div className="font-medium">
                      {message.sender === "user" ? "You" : "Assistant"}
                    </div>
                    <div className="text-xs text-gray-500 ml-auto">
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </div>
                  </div>

                  {/* Render content based on type */}
                  <RenderContent content={message.content} />

                  {/* Annotations */}
                  {annotations[message.id] &&
                    annotations[message.id].length > 0 && (
                      <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex items-center mb-1">
                          <PenLine size={14} className="mr-1 text-blue-500" />
                          <span className="text-xs font-medium text-gray-500">
                            Annotations
                          </span>
                        </div>
                        {annotations[message.id].map((annotation) => (
                          <div
                            key={annotation.id}
                            className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded text-sm my-1"
                          >
                            {annotation.comment}
                          </div>
                        ))}
                      </div>
                    )}

                  {/* Thinking process */}
                  {message.sender === "ai" && message.thinking && message.thinking.length > 0 && (
                    <div className="mt-3 border-t border-gray-200 dark:border-gray-700 pt-2">
                      <button 
                        className="flex items-center text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                        onClick={() => setShowThinking(!showThinking)}
                      >
                        {showThinking ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        <span className="ml-1">Thinking Process</span>
                      </button>
                      
                      {showThinking && (
                        <div className="mt-2 text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-900 p-3 rounded">
                          {message.thinking.map((step, index) => (
                            <div key={index} className="mb-2">
                              <div className="font-medium">{step.step}</div>
                              <div className="text-gray-500 dark:text-gray-400">{step.content}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={endOfMessagesRef} className="h-4" />
          </ScrollArea>
        )}
      </div>

      {/* Annotation mode indicator */}
      {isAnnotating && (
        <div className="bg-blue-50 dark:bg-blue-900/30 p-3 border-t border-blue-100 dark:border-blue-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <PenLine
                size={16}
                className="mr-2 text-blue-600 dark:text-blue-400"
              />
              <span className="text-sm text-blue-700 dark:text-blue-300">
                Select a message to annotate or add a comment
              </span>
            </div>
            <button
              onClick={() => setIsAnnotating(false)}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Cancel
            </button>
          </div>
          {selectedMessage && (
            <div className="mt-2">
              <textarea
                className="w-full p-2 border border-blue-300 dark:border-blue-600 rounded-md"
                placeholder="Add your annotation..."
                rows={2}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    const target = e.target as HTMLTextAreaElement;
                    if (target.value.trim() && selectedMessage) {
                      handleAddAnnotation(selectedMessage, target.value);
                      target.value = "";
                    }
                  }
                }}
              />
              <div className="text-xs text-gray-500 mt-1">
                Press Enter to save. Shift+Enter for new line.
              </div>
            </div>
          )}
        </div>
      )}

      {/* Content suggestion */}
      {contentSuggestion && !isAnnotating && (
        <div className="bg-gray-50 dark:bg-gray-800/50 p-2 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div className="flex items-center">
            <span className="text-sm text-gray-600 dark:text-gray-400 mr-2">
              Suggested content type:
            </span>
            <button
              onClick={() =>
                setInputType(contentSuggestion.type as ContentType)
              }
              className="px-3 py-1 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/50 dark:hover:bg-blue-900/70 text-blue-700 dark:text-blue-300 rounded-full text-sm flex items-center"
            >
              {contentSuggestion.type === "code" && (
                <Code size={14} className="mr-1" />
              )}
              {contentSuggestion.type === "image" && (
                <ImageIcon size={14} className="mr-1" />
              )}
              {contentSuggestion.type === "audio" && (
                <Mic size={14} className="mr-1" />
              )}
              {contentSuggestion.type === "document" && (
                <FileText size={14} className="mr-1" />
              )}
              {contentSuggestion.type === "spreadsheet" && (
                <Table size={14} className="mr-1" />
              )}
              {contentSuggestion.type === "chart" && (
                <BarChart3 size={14} className="mr-1" />
              )}
              {contentSuggestion.type}
            </button>
          </div>
          <button
            onClick={() => setContentSuggestion(null)}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Input area */}
      <div className="border-t border-gray-200 dark:border-gray-800 p-4">
        {/* Attachment type selector */}
        {isAttachmentMenuOpen && (
          <div className="mb-3 flex flex-wrap gap-2">
            {contentTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => {
                  setInputType(type.id as ContentType);
                  setIsAttachmentMenuOpen(false);
                }}
                className={`px-3 py-1.5 rounded-full text-sm flex items-center gap-1 ${
                  inputType === type.id
                    ? "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                }`}
              >
                {type.icon}
                {type.label}
              </button>
            ))}
          </div>
        )}

        {/* Input form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="relative"
        >
          <div className="flex bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
            {/* Attachment button */}
            <button
              type="button"
              className="p-3 text-gray-500 hover:text-gray-700"
              onClick={() => setIsAttachmentMenuOpen(!isAttachmentMenuOpen)}
            >
              {isAttachmentMenuOpen ? <X size={20} /> : <Paperclip size={20} />}
            </button>

            {/* Input field based on content type */}
            <div className="flex-grow">
              {inputType === "text" && (
                <textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder={isSending ? "Sending..." : "Type a message..."}
                  className="w-full h-full resize-none border-none p-3 focus:outline-none dark:bg-gray-800 dark:text-gray-200"
                  disabled={isSending}
                  rows={1}
                  style={{ minHeight: "44px" }}
                />
              )}

              {inputType === "code" && (
                <textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Enter code here..."
                  className="w-full h-full resize-none border-none p-3 focus:outline-none font-mono text-sm dark:bg-gray-800 dark:text-gray-200"
                  disabled={isSending}
                  rows={3}
                />
              )}

              {inputType === "image" && (
                <div className="p-3 w-full">
                  {previewData?.url ? (
                    <div className="mb-2">
                      <Image
                        src={previewData.url}
                        alt="Preview"
                        className="max-h-32 rounded"
                      />
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="mb-2 p-2 border border-dashed border-gray-300 dark:border-gray-700 rounded text-sm text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      Click to upload an image
                    </button>
                  )}
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Add a caption..."
                    className="w-full border-none p-1 focus:outline-none dark:bg-gray-800 dark:text-gray-200"
                  />
                </div>
              )}

              {(inputType === "audio" ||
                inputType === "document" ||
                inputType === "spreadsheet" ||
                inputType === "chart") && (
                <div className="p-3 w-full">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="mb-2 p-2 border border-dashed border-gray-300 dark:border-gray-700 rounded text-sm text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    Upload {inputType} file
                  </button>
                  <textarea
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder={`Enter ${inputType} description...`}
                    className="w-full border-none p-1 focus:outline-none dark:bg-gray-800 dark:text-gray-200"
                    rows={2}
                  />
                </div>
              )}

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileSelect}
                className="hidden"
                accept={
                  inputType === "image"
                    ? "image/*"
                    : inputType === "audio"
                    ? "audio/*"
                    : inputType === "document"
                    ? ".pdf,.doc,.docx,.txt"
                    : inputType === "spreadsheet"
                    ? ".csv,.xlsx"
                    : inputType === "code"
                    ? ".js,.ts,.jsx,.tsx,.py,.java"
                    : "*"
                }
              />
            </div>

            {/* Send button */}
            <button
              type="submit"
              disabled={(!inputValue.trim() && !previewData) || isSending}
              className={`p-3 ${
                (inputValue.trim() || previewData) && !isSending
                  ? "text-blue-600 hover:text-blue-800"
                  : "text-gray-300 cursor-not-allowed"
              }`}
            >
              <Send size={20} />
            </button>
          </div>

          {/* Content type indicator */}
          <div className="absolute -top-5 left-3 bg-white dark:bg-gray-800 px-2 text-xs text-gray-500 dark:text-gray-400">
            {inputType}
          </div>
        </form>
      </div>
    </div>
  );
}

// Component to render content based on type
function RenderContent({ content }: { content: Content }) {
  switch (content.type) {
    case "text":
      return <p className="whitespace-pre-wrap">{content.data}</p>;

    case "code":
      return (
        <div className="bg-gray-100 dark:bg-gray-900 p-3 rounded font-mono text-sm overflow-x-auto">
          <pre>{content.data}</pre>
        </div>
      );

    case "image":
      return (
        <div>
          <Image
            src={content.data}
            alt={content.caption || "Image"}
            className="max-h-64 max-w-full rounded"
            width={512}
            height={512}
          />
          {content.caption && (
            <p className="text-sm text-gray-500 mt-1">{content.caption}</p>
          )}
        </div>
      );

    case "audio":
      return (
        <div className="bg-gray-100 dark:bg-gray-900 p-3 rounded">
          <audio src={content.data} controls className="w-full" />
          {content.transcription && (
            <p className="text-sm mt-2">
              <span className="font-medium">Transcription:</span>{" "}
              {content.transcription}
            </p>
          )}
        </div>
      );

    case "document":
      return (
        <div className="bg-gray-100 dark:bg-gray-900 p-3 rounded">
          <div className="flex items-center mb-2">
            <FileText size={18} className="mr-2 text-orange-500" />
            <span className="font-medium">
              {content.fileName || "Document"}
            </span>
          </div>
          <p className="text-sm whitespace-pre-line">{content.data}</p>
        </div>
      );

    case "spreadsheet":
      return (
        <div className="bg-gray-100 dark:bg-gray-900 p-3 rounded overflow-x-auto">
          <div className="flex items-center mb-2">
            <Table size={18} className="mr-2 text-green-500" />
            <span className="font-medium">Spreadsheet Data</span>
          </div>
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead>
              <tr>
                {content.metadata?.columns?.map((col, i) => (
                  <th
                    key={i}
                    className="px-3 py-2 bg-gray-50 dark:bg-gray-800 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
              {Array.isArray(content.data) &&
                content.data.map((row, i) => (
                  <tr key={i}>
                    {Object.values(row).map((cell, j) => (
                      <td
                        key={j}
                        className="px-3 py-2 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200"
                      >
                        {String(cell)}
                      </td>
                    ))}
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      );

    case "chart":
      return (
        <div className="bg-gray-100 dark:bg-gray-900 p-3 rounded">
          <div className="flex items-center mb-2">
            <BarChart3 size={18} className="mr-2 text-purple-500" />
            <span className="font-medium">Chart: {content.chartType}</span>
          </div>
          <div className="h-48 w-full bg-white dark:bg-gray-800 rounded p-2 flex items-center justify-center">
            [Chart visualization would render here]
          </div>
        </div>
      );

    case "diagram":
      return (
        <div className="bg-gray-100 dark:bg-gray-900 p-3 rounded">
          <div className="flex items-center mb-2">
            <Code size={18} className="mr-2 text-blue-500" />
            <span className="font-medium">Diagram: {content.diagramType}</span>
          </div>
          <div className="h-48 w-full bg-white dark:bg-gray-800 rounded p-2 flex items-center justify-center">
            [Diagram visualization would render here]
          </div>
        </div>
      );

    default:
      return <p>Unsupported content type: {content.type}</p>;
  }
}
