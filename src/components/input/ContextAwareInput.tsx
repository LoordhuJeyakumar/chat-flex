'use client';
import { useEffect, useRef } from 'react';

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
  const ref = useRef<HTMLInputElement|HTMLTextAreaElement>(null);

  useEffect(() => {
    if (ref.current && !disabled) ref.current.focus();
  }, [type, disabled]);

  if (type === 'text' || type === 'code') {
    return (
      <textarea
        ref={ref as React.RefObject<HTMLTextAreaElement>}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
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
        disabled={disabled}
        className="flex-1 border rounded p-2"
      />
    );
  }

  return null;
}