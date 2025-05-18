'use client';
import {  Code, Music, PhoneOutgoingIcon, TextCursorInput } from 'lucide-react';

const options = [
  { type: 'text', icon: <TextCursorInput  /> },
  { type: 'image', icon: <PhoneOutgoingIcon /> },
  { type: 'audio', icon: <Music /> },
  { type: 'code', icon: <Code /> },
];

export default function ContentTypePicker({
  selected,
  onSelect,
}: {
  selected: string;
  onSelect: (type: string) => void;
}) {
  return (
    <div className="flex space-x-2">
      {options.map(o => (
        <button
          key={o.type}
          type="button"
          onClick={() => onSelect(o.type)}
          className={`p-2 rounded ${selected===o.type ? 'bg-blue-100' : 'hover:bg-gray-200'}`}
        >
          {o.icon}
        </button>
      ))}
    </div>
  );
}
