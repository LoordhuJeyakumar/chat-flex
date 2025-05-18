import { Fragment } from 'react';

interface TextRendererProps {
  content: string;
}

export default function TextRenderer({ content }: TextRendererProps) {
  // Split text by newlines and preserve them in rendering
  const paragraphs = content.split('\n');
  
  return (
    <div className="prose dark:prose-invert max-w-none">
      {paragraphs.map((paragraph, i) => (
        <Fragment key={i}>
          {paragraph.trim() ? (
            <p className="my-1">{paragraph}</p>
          ) : (
            <br />
          )}
        </Fragment>
      ))}
    </div>
  );
}