// Improved ContentTypeSwitcher Component

'use client';
import { useState } from 'react';
import { Code,  Mic, FileText, Table, BarChart3, ImageIcon } from 'lucide-react';

// Type definitions
interface ContentTypeOption {
  id: ContentType;
  label: string;
  icon: React.ReactNode;
  description: string;
}

type ContentType = 'text' | 'code' | 'image' | 'audio' | 'document' | 'spreadsheet' | 'chart';
type PreviewData = { url?: string; name?: string; language?: string; content?: string };

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


  className = '',

}: ContentTypeSwitcherProps) {
  const [isExpanded, setIsExpanded] = useState(false);


  // Content type configuration
  const contentTypes: ContentTypeOption[] = [
    { id: 'text', label: 'Text', icon: <span>Aa</span>, description: 'Plain text' },
    { id: 'code', label: 'Code', icon: <Code />, description: 'Code snippets' },
    { id: 'image', label: 'Image', icon: <ImageIcon />, description: 'Images' },
    { id: 'audio', label: 'Audio', icon: <Mic />, description: 'Audio clips' },
    { id: 'document', label: 'Document', icon: <FileText />, description: 'Documents' },
    { id: 'spreadsheet', label: 'Spreadsheet', icon: <Table />, description: 'Tabular data' },
    { id: 'chart', label: 'Chart', icon: <BarChart3 />, description: 'Visualizations' }
  ];

  // Toggle expanded menu
  const toggleExpanded = () => setIsExpanded(!isExpanded);

  // Handle type selection
  const handleTypeSelect = (type: ContentType) => {
    onTypeChange(type);
    setIsExpanded(false);
  };

  return (
    <div className={`relative ${className}`}>
      <button className="p-2 rounded" onClick={toggleExpanded}>
        {contentTypes.find(type => type.id === currentType)?.label || 'Select'}
      </button>

      {isExpanded && (
        <div className="absolute mt-2 bg-white border rounded shadow-md">
          {contentTypes.map(type => (
            <button key={type.id} onClick={() => handleTypeSelect(type.id)}>
              {type.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
