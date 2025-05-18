'use client';


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
