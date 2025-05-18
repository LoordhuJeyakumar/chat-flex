import { useState } from 'react';
import { Message } from './ChatContainer';
import TextRenderer from './renderers/TextRenderer';
import CodeRenderer from './renderers/CodeRenderer';
import ImageRenderer from './renderers/ImageRenderer';
import AudioRenderer from './renderers/AudioRenderer';
import SpreadsheetRenderer from './renderers/SpreadsheetRenderer';
import ChartRenderer from './renderers/ChartRenderer';
import DocumentRenderer from './renderers/DocumentRenderer';
import { ChevronDown, ChevronUp, Bot, User } from 'lucide-react';

interface MessageItemProps {
  message: Message;
}

export default function MessageItem({ message }: MessageItemProps) {
  const [showThinking, setShowThinking] = useState(false);
  const [showTools, setShowTools] = useState(false);
  
  const renderContent = () => {
    switch (message.content.type) {
      case 'text':
        return <TextRenderer content={message.content.data} />;
      case 'code':
        return <CodeRenderer code={message.content.data} language={message.content.language || 'javascript'} />;
      case 'image':
        return <ImageRenderer src={message.content.data} caption={message.content.caption} />;
      case 'audio':
        return <AudioRenderer src={message.content.data} />;
      case 'spreadsheet':
        return <SpreadsheetRenderer data={message.content.data} metadata={message.content.metadata} />;
      case 'chart':
        return <ChartRenderer chartData={message.content} />;
      case 'document':
        return <DocumentRenderer content={message.content.data} />;
      default:
        return <TextRenderer content="Unsupported content type" />;
    }
  };
  
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  return (
    <div 
      className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
    >
      <div 
        className={`
          rounded-lg p-4 max-w-[80%] shadow-sm
          ${message.sender === 'user' 
            ? 'bg-blue-500 text-white' 
            : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700'}
        `}
      >
        <div className="flex items-center gap-2 mb-2">
          {message.sender === 'ai' ? 
            <Bot size={16} className="text-blue-500" /> : 
            <User size={16} className="text-white" />
          }
          <span className="font-medium">
            {message.sender === 'ai' ? 'AI Assistant' : 'You'}
          </span>
          <span className="text-xs opacity-70">
            {formatTime(new Date(message.timestamp))}
          </span>
        </div>
        
        <div className="message-content my-2">
          {renderContent()}
        </div>
        
        {message.sender === 'ai' && message.thinking && message.thinking.length > 0 && (
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
        
        {message.sender === 'ai' && message.tools && message.tools.length > 0 && (
          <div className="mt-3 border-t border-gray-200 dark:border-gray-700 pt-2">
            <button 
              className="flex items-center text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              onClick={() => setShowTools(!showTools)}
            >
              {showTools ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              <span className="ml-1">Tools Used</span>
            </button>
            
            {showTools && (
              <div className="mt-2 text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-900 p-3 rounded">
                {message.tools.map((tool, index) => (
                  <div key={index} className="mb-2">
                    <div className="font-medium">{tool.name}</div>
                    <div className="text-gray-500 dark:text-gray-400">{tool.execution}</div>
                    <div className="text-gray-600 dark:text-gray-300 mt-1">Result: {tool.result}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}