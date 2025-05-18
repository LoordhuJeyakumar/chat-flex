'use client';
import { useEffect, useRef, useState } from 'react';
import { Code, FileText, Image, Mic, Table, BarChart3 } from 'lucide-react';

export default function ContextAwareInput({
  type,
  value,
  placeholder,
  onChange,
  disabled = false,
}: {
  type: string;
  value: string;
  placeholder?: string;
  onChange: (v: string) => void;
  disabled?: boolean;
}) {
  const ref = useRef<HTMLInputElement|HTMLTextAreaElement|HTMLDivElement>(null);
  const [isCodeEditorFocused, setIsCodeEditorFocused] = useState(false);

  useEffect(() => {
    if (ref.current && !disabled) {
      // Only focus on text inputs and textareas
      if (ref.current instanceof HTMLInputElement || ref.current instanceof HTMLTextAreaElement) {
        ref.current.focus();
      }
    }
  }, [type, disabled]);

  // Display the appropriate icon for content type
  const renderTypeIcon = () => {
    switch (type) {
      case 'code': return <Code size={16} className="text-blue-600" />;
      case 'image': return <Image size={16} className="text-emerald-600" />;
      case 'audio': return <Mic size={16} className="text-yellow-600" />;
      case 'document': return <FileText size={16} className="text-orange-600" />;
      case 'spreadsheet': return <Table size={16} className="text-green-600" />;
      case 'chart': return <BarChart3 size={16} className="text-purple-600" />;
      default: return null;
    }
  };

  // Returns common CSS class string for all inputs
  const getBaseClasses = () => {
    return `w-full py-2 px-3 outline-none bg-transparent placeholder:text-gray-400
      ${disabled ? 'opacity-60 cursor-not-allowed' : 'opacity-100'}`;
  };

  // For text and general content
  if (type === 'text') {
    return (
      <textarea
        ref={ref as React.RefObject<HTMLTextAreaElement>}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder || "Type a message..."}
        disabled={disabled}
        className={`${getBaseClasses()} resize-none h-[60px] min-h-[60px] max-h-[120px]`}
        rows={2}
      />
    );
  }

  // For code input with syntax highlighting
  if (type === 'code') {
    return (
      <div className="relative w-full">
        <div className="flex items-center mb-1 bg-gray-800 text-white text-xs px-3 py-1 rounded-t-md">
          <Code size={14} className="mr-2" />
          <span>Code Editor</span>
        </div>
        <textarea
          ref={ref as React.RefObject<HTMLTextAreaElement>}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder || "// Enter your code here..."}
          disabled={disabled}
          className={`${getBaseClasses()} resize-none h-[120px] font-mono text-sm p-3 bg-gray-900 text-gray-100 rounded-b-md`}
          onFocus={() => setIsCodeEditorFocused(true)}
          onBlur={() => setIsCodeEditorFocused(false)}
          spellCheck={false}
        />
        {isCodeEditorFocused && (
          <div className="absolute right-2 bottom-2 text-xs bg-gray-800 text-gray-300 px-2 py-1 rounded">
            {value.split('\n').length} lines
          </div>
        )}
      </div>
    );
  }

  // For image or audio URL inputs
  if (type === 'image' || type === 'audio') {
    return (
      <div className="flex flex-col w-full">
        <div className="flex items-center gap-2">
          {renderTypeIcon()}
          <input
            ref={ref as React.RefObject<HTMLInputElement>}
            type="url"
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder={placeholder || `Enter ${type} URL...`}
            disabled={disabled}
            className={`${getBaseClasses()} rounded`}
          />
        </div>
        {type === 'image' && value && value.startsWith('http') && (
          <div className="mt-2 p-2 bg-gray-100 rounded">
            <p className="text-xs text-gray-500 mb-1">Preview:</p>
            <img 
              src={value} 
              alt="Preview" 
              className="max-h-[100px] rounded border border-gray-200" 
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>
        )}
      </div>
    );
  }

  // For document uploads
  if (type === 'document') {
    return (
      <div className="flex flex-col w-full">
        <div className="flex items-center">
          <FileText size={16} className="text-orange-600 mr-2" />
          <input
            ref={ref as React.RefObject<HTMLInputElement>}
            type="url"
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder={placeholder || "Enter document URL or description..."}
            disabled={disabled}
            className={`${getBaseClasses()} rounded`}
          />
        </div>
        <div className="mt-2 text-xs text-gray-500">
          <p>You can enter a URL to a document or describe the document you want to share.</p>
        </div>
      </div>
    );
  }

  // For spreadsheets and charts with specialized inputs
  if (type === 'spreadsheet' || type === 'chart') {
    const icon = type === 'spreadsheet' ? 
      <Table size={16} className="text-green-600 mr-2" /> :
      <BarChart3 size={16} className="text-purple-600 mr-2" />;
      
    return (
      <div className="flex flex-col w-full">
        <div className="flex items-center">
          {icon}
          <textarea
            ref={ref as React.RefObject<HTMLTextAreaElement>}
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder={placeholder || `Enter ${type} data or description...`}
            disabled={disabled}
            className={`${getBaseClasses()} resize-none h-[80px] font-mono text-sm rounded`}
          />
        </div>
        <div className="mt-2 text-xs text-gray-500">
          <p>For {type === 'spreadsheet' ? 'spreadsheets' : 'charts'}, you can enter JSON data or describe what you want to create.</p>
        </div>
      </div>
    );
  }

  // Fallback for any other types
  return (
    <textarea
      ref={ref as React.RefObject<HTMLTextAreaElement>}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder || `Type ${type} content...`}
      disabled={disabled}
      className={`${getBaseClasses()} resize-none h-[60px]`}
    />
  );
}