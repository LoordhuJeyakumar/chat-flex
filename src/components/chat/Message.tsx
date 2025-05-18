'use client';
 
import type { Message } from '@/types/core';
import { TextContent } from '../content-types/TextContent';
import { CodeContent } from '../content-types/CodeContent';
import { ImageContent } from '../content-types/ImageContent';
import { AudioContent } from '../content-types/AudioContent';
import { SpreadsheetContent } from '../content-types/SpreadsheetContent';
import { ChartContent } from '../content-types/ChartContent';
import DocumentContent from '../content-types/DocumentContent';
import DiagramContent from '../content-types/DiagramContent';

export default function Message({ message }: { message: Message }) {
  const { sender, content }  = message;

  function renderContent() {
    switch (content.type) {
      case 'text':
        return <TextContent content={content.data} />;
      case 'code':
        return <CodeContent code={content.data} language={content.language} />;
      case 'image':
        return <ImageContent url={content.data} alt={content.caption} />;
      case 'audio':
        return <AudioContent url={content.data} />;
      case 'spreadsheet':
        return <SpreadsheetContent data={content.data} />;
      case 'chart':
        return <ChartContent chart={content.data} />;
      case 'document':
        return <DocumentContent url={content.data} />;
      case 'diagram':
        return <DiagramContent diagram={content.data} />;
      default:
        return null;
    }
  }

  return (
    <div className="mb-4">
      <div className="text-sm text-gray-500">{sender}</div>
      <div className="mt-1 bg-white p-3 rounded shadow-sm">{renderContent()}</div>
    </div>
  );
}
