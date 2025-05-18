'use client';
import { useEffect, useRef } from 'react';

export default function ContextAwareInput({
  type,
  value,
  placeholder,
  onChange,
}: {
  type: string;
  value: string;
  placeholder?: string;
  onChange: (v: string) => void;
}) {
  const ref = useRef<HTMLInputElement|HTMLTextAreaElement>(null);

  useEffect(() => {
    if (ref.current) ref.current.focus();
  }, [type]);

  if (type === 'text' || type === 'code') {
    return (
      <textarea
        ref={ref as React.RefObject<HTMLTextAreaElement>}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="flex-1 border rounded p-2 h-20 resize-none"
      />
    );
  }

  if (type === 'image' || type === 'audio') {
    return (
      <input
        ref={ref as React.RefObject<HTMLInputElement>}
        type="url"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={`Enter ${type} URL...`}
        className="flex-1 border rounded p-2"
      />
    );
  }

  return null;
}