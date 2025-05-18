import { useState } from 'react';
import { CopyIcon, CheckIcon } from 'lucide-react';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { atomOneDark, atomOneLight } from 'react-syntax-highlighter/dist/cjs/styles/hljs';

interface CodeRendererProps {
  code: string;
  language: string;
}

export default function CodeRenderer({ code, language }: CodeRendererProps) {
  const [copied, setCopied] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  return (
    <div className="relative rounded-md overflow-hidden">
      <div className="flex items-center justify-between p-2 bg-gray-800 text-gray-200">
        <div className="text-sm font-mono">{language}</div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-1 rounded hover:bg-gray-700"
          >
            {isDarkMode ? '☀️' : '🌙'}
          </button>
          <button 
            onClick={copyToClipboard}
            className="p-1 rounded hover:bg-gray-700"
          >
            {copied ? <CheckIcon size={16} /> : <CopyIcon size={16} />}
          </button>
        </div>
      </div>
      
      <SyntaxHighlighter 
        language={language} 
        style={isDarkMode ? atomOneDark : atomOneLight}
        customStyle={{
          margin: 0,
          borderRadius: '0',
          padding: '1rem'
        }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}