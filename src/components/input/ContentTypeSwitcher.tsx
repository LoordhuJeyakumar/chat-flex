'use client';
import { useState, useEffect } from 'react';
import { Code, Image, Mic, FileText, Table, BarChart3, X } from 'lucide-react';
import { ContentType, PreviewData } from '@/types/core';

interface ContentTypeOption {
  id: ContentType;
  label: string;
  icon: React.ReactNode;
  description: string;
}

interface ContentTypeSwitcherProps {
  currentType: ContentType;
  onTypeChange: (type: ContentType) => void;
  previewData?: PreviewData | string;
  onEditPreview?: (data: PreviewData | string | null) => void;
  className?: string;
  showLabels?: boolean;
}

export default function ContentTypeSwitcher({
  currentType,
  onTypeChange,
  previewData,
  onEditPreview,
  className = '',
  showLabels = true
}: ContentTypeSwitcherProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [previewMode, setPreviewMode] = useState(!!previewData);

  // Content type configuration
  const contentTypes: ContentTypeOption[] = [
    { 
      id: 'text', 
      label: 'Text', 
      icon: <span className="text-gray-600 dark:text-gray-300">Aa</span>,
      description: 'Plain text message' 
    },
    { 
      id: 'code', 
      label: 'Code', 
      icon: <Code size={16} className="text-blue-600 dark:text-blue-400" />,
      description: 'Code snippets with syntax highlighting' 
    },
    { 
      id: 'image', 
      label: 'Image', 
      icon: <Image size={16} className="text-emerald-600 dark:text-emerald-400" />,
      description: 'Upload or reference images' 
    },
    { 
      id: 'audio', 
      label: 'Audio', 
      icon: <Mic size={16} className="text-yellow-600 dark:text-yellow-400" />,
      description: 'Audio clips and recordings' 
    },
    { 
      id: 'document', 
      label: 'Document', 
      icon: <FileText size={16} className="text-orange-600 dark:text-orange-400" />,
      description: 'PDF and document files' 
    },
    { 
      id: 'spreadsheet', 
      label: 'Spreadsheet', 
      icon: <Table size={16} className="text-green-600 dark:text-green-400" />,
      description: 'Tabular data and spreadsheets' 
    },
    { 
      id: 'chart', 
      label: 'Chart', 
      icon: <BarChart3 size={16} className="text-purple-600 dark:text-purple-400" />,
      description: 'Data visualizations' 
    }
  ];

  // Update preview mode when previewData changes
  useEffect(() => {
    setPreviewMode(!!previewData);
  }, [previewData]);

  // Get current content type info
  const getCurrentType = () => {
    return contentTypes.find(type => type.id === currentType) || contentTypes[0];
  };

  // Toggle expanded menu
  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  // Close the expanded menu
  const closeExpanded = () => {
    setIsExpanded(false);
  };

  // Handle type selection
  const handleTypeSelect = (type: ContentType) => {
    onTypeChange(type);
    setIsExpanded(false);
  };

  // Render preview content based on type
  const renderPreview = () => {
    if (!previewData) return null;

    switch (currentType) {
      case 'image':
        return (
          <div className="relative">
            <img 
              src={typeof previewData === 'string' ? previewData : previewData.url || '/placeholder.jpg'} 
              alt="Preview" 
              className="max-h-32 rounded border border-gray-200 dark:border-gray-700" 
            />
            <button 
              className="absolute top-1 right-1 bg-gray-800 bg-opacity-70 rounded-full p-1 text-white"
              onClick={() => {
                if (onEditPreview) onEditPreview(null);
                setPreviewMode(false);
              }}
            >
              <X size={12} />
            </button>
          </div>
        );
      
      case 'audio':
        return (
          <div className="flex items-center gap-2 p-2 bg-gray-100 dark:bg-gray-800 rounded">
            <Mic size={16} className="text-yellow-600" />
            <span className="text-xs">
              {typeof previewData === 'string' ? 'Audio file' : previewData.name || 'Audio file'}
            </span>
            <button 
              className="ml-auto text-gray-400 hover:text-gray-600"
              onClick={() => {
                if (onEditPreview) onEditPreview(null);
                setPreviewMode(false);
              }}
            >
              <X size={12} />
            </button>
          </div>
        );
      
      case 'document':
        return (
          <div className="flex items-center gap-2 p-2 bg-gray-100 dark:bg-gray-800 rounded">
            <FileText size={16} className="text-orange-600" />
            <span className="text-xs">
              {typeof previewData === 'string' ? 'Document' : previewData.name || 'Document'}
            </span>
            <button 
              className="ml-auto text-gray-400 hover:text-gray-600"
              onClick={() => {
                if (onEditPreview) onEditPreview(null);
                setPreviewMode(false);
              }}
            >
              <X size={12} />
            </button>
          </div>
        );
      
      case 'code':
        return (
          <div className="font-mono text-xs bg-gray-900 text-gray-100 p-2 rounded overflow-hidden">
            <div className="flex items-center justify-between mb-1">
              <span className="text-blue-400">
                {typeof previewData === 'string' ? 'code' : previewData.language || 'code'}
              </span>
              <button 
                className="text-gray-400 hover:text-gray-200"
                onClick={() => {
                  if (onEditPreview) onEditPreview(null);
                  setPreviewMode(false);
                }}
              >
                <X size={12} />
              </button>
            </div>
            <div className="line-clamp-3">
              {typeof previewData === 'string' ? previewData : previewData.content || '// Code preview'}
            </div>
          </div>
        );

      default:
        return (
          <div className="text-sm text-gray-500">
            {previewData.toString()}
            <button 
              className="ml-2 text-gray-400 hover:text-gray-600"
              onClick={() => {
                if (onEditPreview) onEditPreview(null);
                setPreviewMode(false);
              }}
            >
              <X size={12} />
            </button>
          </div>
        );
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Current type button */}
      <button
        className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
        onClick={toggleExpanded}
      >
        <div className="w-6 h-6 flex items-center justify-center">
          {getCurrentType().icon}
        </div>
        {showLabels && (
          <span className="text-sm text-gray-700 dark:text-gray-300">
            {getCurrentType().label}
          </span>
        )}
      </button>

      {/* Preview area */}
      {previewMode && (
        <div className="mt-2 mb-3 px-2">
          {renderPreview()}
        </div>
      )}

      {/* Expanded menu */}
      {isExpanded && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={closeExpanded}
          />
          <div className="absolute z-20 left-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-2 border-b border-gray-200 dark:border-gray-700">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Select content type
              </h4>
            </div>
            <div className="p-2 max-h-64 overflow-y-auto">
              {contentTypes.map(type => (
                <button
                  key={type.id}
                  className={`flex items-start gap-3 w-full p-2 rounded-md text-left ${
                    currentType === type.id 
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600' 
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                  onClick={() => handleTypeSelect(type.id)}
                >
                  <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center mt-0.5">
                    {type.icon}
                  </div>
                  <div>
                    <div className="text-sm font-medium">{type.label}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {type.description}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
} 