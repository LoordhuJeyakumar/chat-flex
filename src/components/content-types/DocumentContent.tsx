'use client';
import dynamic from 'next/dynamic';
import { useEffect, useRef } from 'react';

// Use dynamic import for PDF viewer or use iframe for general docs
export default function DocumentContent({ url }: { url: string }) {
  return (
    <iframe
      src={url}
      className="w-full h-96 border rounded"
      title="document"
    />
  );
}
