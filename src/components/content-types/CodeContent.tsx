import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/cjs/styles/prism';

export function CodeContent({ code, language }: { code: string; language?: string }) {
  return <SyntaxHighlighter language={language} style={tomorrow}>{code}</SyntaxHighlighter>;
}