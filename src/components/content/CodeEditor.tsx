'use client';
import { useState, useRef, useEffect } from 'react';
import { Play, CheckCircle, XCircle, Info, Copy, Download } from 'lucide-react';

interface CodeEditorProps {
  initialCode: string;
  language?: string;
  readOnly?: boolean;
  onCodeChange?: (code: string) => void;
  showExplanation?: boolean;
  showExecute?: boolean;
}

export default function CodeEditor({
  initialCode = '',
  language = 'javascript',
  readOnly = false,
  onCodeChange,
  showExplanation = true,
  showExecute = true
}: CodeEditorProps) {
  const [code, setCode] = useState(initialCode);
  const [isExecuting, setIsExecuting] = useState(false);
  const [output, setOutput] = useState('');
  const [outputType, setOutputType] = useState<'success' | 'error' | 'info'>('info');
  const [showOutput, setShowOutput] = useState(false);
  const [isExplanationOpen, setIsExplanationOpen] = useState(showExplanation);
  const [lineNumbers, setLineNumbers] = useState<string[]>([]);
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const preRef = useRef<HTMLPreElement>(null);

  // Explanation mocks - in a real app this would come from AI
  const codeExplanation = `This code defines a function that performs the following operations:
  
1. It takes an input parameter and validates it
2. It processes the data through a series of transformations
3. It returns the processed result in the expected format

Key patterns used:
- Input validation with error handling
- Functional programming with map/filter operations
- Clean separation of concerns`;

  // Generate line numbers whenever code changes
  useEffect(() => {
    const lines = code.split('\n').length;
    setLineNumbers(Array.from({ length: lines }, (_, i) => (i + 1).toString()));
  }, [code]);

  // Detect dark mode
  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    setIsDarkMode(isDark);
    
    // Watch for theme changes
    const observer = new MutationObserver(() => {
      const isDark = document.documentElement.classList.contains('dark');
      setIsDarkMode(isDark);
    });
    
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });
    
    return () => observer.disconnect();
  }, []);

  // Sync scroll between the textarea and the highlighting layer
  useEffect(() => {
    const handleScroll = () => {
      if (editorRef.current && preRef.current) {
        preRef.current.scrollTop = editorRef.current.scrollTop;
        preRef.current.scrollLeft = editorRef.current.scrollLeft;
      }
    };
    
    const editor = editorRef.current;
    if (editor) {
      editor.addEventListener('scroll', handleScroll);
      return () => editor.removeEventListener('scroll', handleScroll);
    }
  }, []);

  // Handle changes to the code
  const handleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newCode = e.target.value;
    setCode(newCode);
    
    if (onCodeChange) {
      onCodeChange(newCode);
    }
  };

  // Execute the code
  const executeCode = () => {
    setIsExecuting(true);
    setShowOutput(true);
    
    try {
      // This is a simplified execution model for demo purposes
      // In a real app, you would use a safer evaluation method or a backend service
      setTimeout(() => {
        try {
          // For demo, we'll just show what would happen
          if (code.includes('error') || code.includes('throw')) {
            setOutput('Error: An exception occurred during execution');
            setOutputType('error');
          } else {
            setOutput('Code executed successfully. Result: { status: "ok", data: [1, 2, 3] }');
            setOutputType('success');
          }
        } catch (err) {
          setOutput(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
          setOutputType('error');
        }
        setIsExecuting(false);
      }, 1000);
    } catch (err) {
      setOutput(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setOutputType('error');
      setIsExecuting(false);
    }
  };

  // Copy code to clipboard
  const copyCode = () => {
    navigator.clipboard.writeText(code)
      .then(() => {
        // Show a temporary success message
        setOutput('Code copied to clipboard');
        setOutputType('success');
        setShowOutput(true);
        
        // Hide after 2 seconds
        setTimeout(() => {
          setShowOutput(false);
        }, 2000);
      })
      .catch(err => {
        setOutput(`Failed to copy: ${err}`);
        setOutputType('error');
        setShowOutput(true);
      });
  };

  // Download code
  const downloadCode = () => {
    const extension = language === 'javascript' ? 'js' : language;
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `code.${extension}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Simple syntax highlighting (for demo purposes)
  // In a real app, you would use a library like Prism.js or highlight.js
  const highlightSyntax = (code: string) => {
    // Basic highlighting for JavaScript
    return code
      .replace(/\b(const|let|var|function|return|if|else|for|while|class|import|export|from|async|await)\b/g, '<span class="text-purple-600 dark:text-purple-400">$1</span>')
      .replace(/\b(true|false|null|undefined|this)\b/g, '<span class="text-orange-600 dark:text-orange-400">$1</span>')
      .replace(/(".*?"|'.*?'|`.*?`)/g, '<span class="text-green-600 dark:text-green-400">$1</span>')
      .replace(/\b(\d+)\b/g, '<span class="text-blue-600 dark:text-blue-400">$1</span>')
      .replace(/(\/\/.*)/g, '<span class="text-gray-500 dark:text-gray-400">$1</span>');
  };

  return (
    <div className="rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
      {/* Editor toolbar */}
      <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-900 px-4 py-2 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2">
          <div className="text-xs font-medium text-gray-600 dark:text-gray-300">
            {language.toUpperCase()}
          </div>
          
          {showExecute && (
            <button 
              onClick={executeCode}
              disabled={isExecuting || !code.trim()}
              className={`px-3 py-1 rounded text-xs font-medium flex items-center space-x-1 
                ${isExecuting 
                  ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed' 
                  : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50'
                }`}
            >
              <Play size={12} />
              <span>{isExecuting ? 'Executing...' : 'Run'}</span>
            </button>
          )}
        </div>
        
        <div className="flex items-center space-x-1">
          {showExplanation && (
            <button 
              onClick={() => setIsExplanationOpen(!isExplanationOpen)}
              className={`p-1 rounded text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 ${
                isExplanationOpen ? 'text-blue-600 dark:text-blue-400' : ''
              }`}
              title="Show explanation"
            >
              <Info size={16} />
            </button>
          )}
          
          <button 
            onClick={copyCode}
            className="p-1 rounded text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
            title="Copy code"
          >
            <Copy size={16} />
          </button>
          
          <button 
            onClick={downloadCode}
            className="p-1 rounded text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
            title="Download code"
          >
            <Download size={16} />
          </button>
        </div>
      </div>
      
      {/* Editor main content */}
      <div className="flex">
        {/* Code editor area */}
        <div className={`flex-grow ${isExplanationOpen ? 'w-2/3' : 'w-full'}`}>
          <div className="relative font-mono text-sm overflow-hidden">
            {/* Line numbers */}
            <div 
              className="absolute top-0 bottom-0 left-0 w-10 px-2 py-3 text-right bg-gray-50 dark:bg-gray-900 text-gray-400 select-none"
              style={{ zIndex: 1 }}
            >
              {lineNumbers.map(num => (
                <div key={num} className="leading-5">{num}</div>
              ))}
            </div>
            
            {/* Code highlighting (underlays the textarea) */}
            <pre 
              ref={preRef}
              className="absolute top-0 right-0 bottom-0 left-0 m-0 pt-3 pr-3 pb-3 pl-12 overflow-auto" 
              style={{ zIndex: 1 }}
              aria-hidden="true"
            >
              <code 
                dangerouslySetInnerHTML={{ __html: highlightSyntax(code) }} 
                className="block whitespace-pre leading-5"
              />
            </pre>
            
            {/* Editable textarea (overlays the highlighting) */}
            <textarea
              ref={editorRef}
              value={code}
              onChange={handleCodeChange}
              disabled={readOnly}
              spellCheck={false}
              className={`
                absolute top-0 right-0 bottom-0 left-0 w-full h-full resize-none p-3 pl-12 
                font-mono text-sm leading-5 bg-transparent caret-black dark:caret-white 
                outline-none border-0 overflow-auto
                ${readOnly ? 'cursor-default' : ''}
              `}
              style={{ color: 'transparent', caretColor: isDarkMode ? 'white' : 'black', zIndex: 2, minHeight: '200px' }}
            />
          </div>
          
          {/* Output panel */}
          {showOutput && (
            <div className={`border-t border-gray-200 dark:border-gray-700 overflow-auto max-h-40
              ${outputType === 'success' ? 'bg-green-50 dark:bg-green-900/20' : ''}
              ${outputType === 'error' ? 'bg-red-50 dark:bg-red-900/20' : ''}
              ${outputType === 'info' ? 'bg-blue-50 dark:bg-blue-900/20' : ''}
            `}>
              <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-2">
                  <span className={`
                    ${outputType === 'success' ? 'text-green-600 dark:text-green-400' : ''}
                    ${outputType === 'error' ? 'text-red-600 dark:text-red-400' : ''}
                    ${outputType === 'info' ? 'text-blue-600 dark:text-blue-400' : ''}
                  `}>
                    {outputType === 'success' && <CheckCircle size={16} />}
                    {outputType === 'error' && <XCircle size={16} />}
                    {outputType === 'info' && <Info size={16} />}
                  </span>
                  <span className="text-sm font-medium">
                    {outputType === 'success' && 'Success'}
                    {outputType === 'error' && 'Error'}
                    {outputType === 'info' && 'Output'}
                  </span>
                </div>
                <button 
                  onClick={() => setShowOutput(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
              <div className="p-4">
                <pre className={`text-sm font-mono whitespace-pre-wrap
                  ${outputType === 'success' ? 'text-green-700 dark:text-green-300' : ''}
                  ${outputType === 'error' ? 'text-red-700 dark:text-red-300' : ''}
                  ${outputType === 'info' ? 'text-blue-700 dark:text-blue-300' : ''}
                `}>
                  {output || 'No output'}
                </pre>
              </div>
            </div>
          )}
        </div>
        
        {/* Code explanation panel */}
        {isExplanationOpen && (
          <div className="w-1/3 border-l border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 overflow-auto">
            <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Code Explanation</h3>
              <button 
                onClick={() => setIsExplanationOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
            <div className="p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-line">
                {codeExplanation}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 