import { useState } from 'react';
import { MessageContent } from './ChatContainer';
import { SendIcon, Image, Code, FileText, Mic, Table, BarChart3, Plus } from 'lucide-react';

interface InputAreaProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  inputType: MessageContent['type'];
  setInputType: (type: MessageContent['type']) => void;
}

export default function InputArea({ 
  value, 
  onChange, 
  onSend, 
  inputType, 
  setInputType 
}: InputAreaProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };
  
  const inputTypeIcons = {
    text: null,
    code: <Code size={18} />,
    image: <Image size={18} />,
    audio: <Mic size={18} />,
    document: <FileText size={18} />,
    spreadsheet: <Table size={18} />,
    chart: <BarChart3 size={18} />
  };
  
  const inputTypesOptions = [
    { type: 'text', label: 'Text', icon: null },
    { type: 'code', label: 'Code', icon: <Code size={18} /> },
    { type: 'image', label: 'Image', icon: <Image size={18} /> },
    { type: 'audio', label: 'Audio', icon: <Mic size={18} /> },
    { type: 'document', label: 'Document', icon: <FileText size={18} /> },
    { type: 'spreadsheet', label: 'Spreadsheet', icon: <Table size={18} /> },
    { type: 'chart', label: 'Chart', icon: <BarChart3 size={18} /> }
  ];
  
  return (
    <div className="relative">
      <div className="flex items-center gap-2 mb-2">
        <div 
          className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <Plus size={18} className="text-gray-500 dark:text-gray-400" />
        </div>
        
        {inputTypeIcons[inputType] && (
          <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
            {inputTypeIcons[inputType]}
            <span className="capitalize">{inputType}</span>
          </div>
        )}
      </div>
      
      {isExpanded && (
        <div className="absolute bottom-full mb-2 left-0 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-2 z-10">
          <div className="grid grid-cols-3 gap-2">
            {inputTypesOptions.map((option) => (
              <button
                key={option.type}
                className={`
                  flex items-center gap-1 p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700
                  ${inputType === option.type ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : ''}
                `}
                onClick={() => {
                  setInputType(option.type as MessageContent['type']);
                  setIsExpanded(false);
                }}
              >
                {option.icon}
                <span>{option.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
      
      <div className="flex items-end gap-2">
        <div className="relative flex-1">
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Type your ${inputType} message...`}
            className="w-full resize-none rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-3 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px]"
            rows={3}
          />
          
          <button
            onClick={onSend}
            disabled={!value.trim()}
            className="absolute bottom-3 right-3 p-1 rounded-full bg-blue-500 text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <SendIcon size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}