'use client';
import { useState, useRef } from 'react';
import { ChevronLeft, ChevronRight, Search, Maximize2, MessageSquare, Bookmark } from 'lucide-react';

interface DocumentViewerProps {
  documentUrl?: string;
  documentTitle?: string;
  totalPages?: number;
  onHighlight?: (highlight: Highlight) => void;
  initialHighlights?: Highlight[];
}

interface Highlight {
  id: string;
  text: string;
  page: number;
  color: string;
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  comment?: string;
}

export default function DocumentViewer({
  documentTitle = 'Document',
  totalPages = 1,
  onHighlight,
  initialHighlights = []
}: DocumentViewerProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [zoom, setZoom] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [highlights, setHighlights] = useState<Highlight[]>(initialHighlights);
  const [selectedHighlight, setSelectedHighlight] = useState<string | null>(null);
  const [summaryOpen, setSummaryOpen] = useState(true);
  
  const documentRef = useRef<HTMLDivElement>(null);
  
  // Mock document summary for demo purposes
  const documentSummary = `This document covers key information about the subject matter.
  
Main points:
- First important topic covered in detail
- Second critical area with actionable insights
- Third section describing implementation approach
  
The document provides comprehensive analysis with supporting evidence and clear recommendations for moving forward.`;

  // Navigate to previous page
  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };
  
  // Navigate to next page
  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };
  
  // Increase zoom
  const zoomIn = () => {
    setZoom(Math.min(zoom + 0.25, 2));
  };
  
  // Decrease zoom
  const zoomOut = () => {
    setZoom(Math.max(zoom - 0.25, 0.5));
  };
  
  // Reset zoom
  const resetZoom = () => {
    setZoom(1);
  };
  
  // Handle text selection for highlighting
  const handleTextSelection = () => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed || !documentRef.current) return;
    
    const range = selection.getRangeAt(0);
    const text = selection.toString();
    
    if (!text || text.length < 3) return;
    
    // Get the position information relative to the document container
    const rect = range.getBoundingClientRect();
    const documentRect = documentRef.current.getBoundingClientRect();
    
    const position = {
      x: rect.left - documentRect.left,
      y: rect.top - documentRect.top,
      width: rect.width,
      height: rect.height
    };
    
    // Show highlight options
    // In a real app, you would display a popup with color options
    createHighlight(text, position, 'yellow');
  };
  
  // Create a new highlight
  const createHighlight = (text: string, position: {
    x: number;
    y: number;
    width: number;
    height: number;
  }, color: string) => {
    const newHighlight: Highlight = {
      id: `highlight-${Date.now()}`,
      text,
      page: currentPage,
      color,
      position,
      comment: ''
    };
    
    const updatedHighlights = [...highlights, newHighlight];
    setHighlights(updatedHighlights);
    setSelectedHighlight(newHighlight.id);
    
    if (onHighlight) {
      onHighlight(newHighlight);
    }
  };
  
  // Add a comment to a highlight
  const addCommentToHighlight = (id: string, comment: string) => {
    const updatedHighlights = highlights.map(h => {
      if (h.id === id) {
        return { ...h, comment };
      }
      return h;
    });
    
    setHighlights(updatedHighlights);
  };
  
  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you would search the actual document content
    console.log("Searching for:", searchQuery);
    // For demo purposes, we're using mock results
  };
  
  // Render page content (mock PDF page)
  const renderPageContent = () => {
    // In a real app, you would render the actual PDF page
    return (
      <div 
        className="relative bg-white border border-gray-200 shadow-sm"
        style={{ 
          width: '100%',
          height: '800px',
          transform: `scale(${zoom})`,
          transformOrigin: 'top left',
          transition: 'transform 0.2s'
        }}
      >
        <div className="p-8">
          <h2 className="text-2xl font-bold mb-4">{documentTitle} - Page {currentPage}</h2>
          <p className="mb-4">
            This is a mock document page for demonstration purposes. In a production version,
            this would display the actual content of a PDF or other document format.
          </p>
          <p className="mb-4">
            The document viewer provides page navigation, zoom controls, text highlighting,
            and annotation capabilities.
          </p>
          <p className="mb-4">
            You can select text to highlight it, add comments to highlights, and navigate between pages.
          </p>
          <p className="mb-4">
            The sidebar provides a document summary, search functionality, and quick navigation to
            bookmarked sections or highlights.
          </p>
        </div>
        
        {/* Render highlights for current page */}
        {highlights
          .filter(h => h.page === currentPage)
          .map(highlight => (
            <div
              key={highlight.id}
              className="absolute cursor-pointer"
              style={{
                left: `${highlight.position.x}px`,
                top: `${highlight.position.y}px`,
                width: `${highlight.position.width}px`,
                height: `${highlight.position.height}px`,
                backgroundColor: `${highlight.color}80`, // Add transparency
                pointerEvents: 'none' // Allow clicking through the highlight
              }}
              onClick={() => setSelectedHighlight(highlight.id)}
            />
          ))}
      </div>
    );
  };

  return (
    <div className="flex h-[800px] bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
      {/* Document sidebar */}
      <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
        {/* Sidebar tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <button 
            className={`flex-1 py-2 px-4 text-sm font-medium ${summaryOpen ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
            onClick={() => setSummaryOpen(true)}
          >
            Summary
          </button>
          <button 
            className={`flex-1 py-2 px-4 text-sm font-medium ${!summaryOpen ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
            onClick={() => setSummaryOpen(false)}
          >
            Highlights
          </button>
        </div>
        
        {/* Search */}
        <div className="p-3 border-b border-gray-200 dark:border-gray-700">
          <form onSubmit={handleSearch} className="flex">
            <input
              type="text"
              placeholder="Search document..."
              className="w-full px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-l-lg focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-200"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button 
              type="submit"
              className="px-2 bg-blue-500 text-white rounded-r-lg hover:bg-blue-600"
            >
              <Search size={16} />
            </button>
          </form>
        </div>
        
        {/* Sidebar content */}
        <div className="flex-grow overflow-y-auto p-3">
          {summaryOpen ? (
            <div>
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Document Summary</h3>
              <p className="text-xs text-gray-600 dark:text-gray-400 whitespace-pre-line">
                {documentSummary}
              </p>
            </div>
          ) : (
            <div>
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Highlights</h3>
              <div className="space-y-3">
                {highlights.length > 0 ? (
                  highlights.map(highlight => (
                    <div 
                      key={highlight.id}
                      className={`p-2 rounded text-xs border-l-4 ${
                        selectedHighlight === highlight.id
                          ? 'bg-yellow-50 dark:bg-yellow-900/30 border-yellow-400'
                          : 'bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600'
                      }`}
                      onClick={() => {
                        setCurrentPage(highlight.page);
                        setSelectedHighlight(highlight.id);
                      }}
                    >
                      <div className="font-medium flex items-center justify-between">
                        <span>Page {highlight.page}</span>
                        {highlight.comment && <MessageSquare size={12} className="text-blue-500" />}
                      </div>
                      <p className="mt-1 line-clamp-2">{highlight.text}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    No highlights yet. Select text in the document to highlight it.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Main document view */}
      <div className="flex-grow flex flex-col">
        {/* Document toolbar */}
        <div className="flex items-center justify-between bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-2">
          <div className="flex items-center space-x-2">
            <button
              onClick={zoomOut}
              className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
              title="Zoom out"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 8H12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>
            <span className="text-xs text-gray-600 dark:text-gray-300">{Math.round(zoom * 100)}%</span>
            <button
              onClick={zoomIn}
              className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
              title="Zoom in"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 4V12M4 8H12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>
            <button
              onClick={resetZoom}
              className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
              title="Reset zoom"
            >
              <Maximize2 size={16} />
            </button>
          </div>
          
          <div className="flex items-center">
            <button
              onClick={prevPage}
              disabled={currentPage === 1}
              className={`p-1 rounded ${
                currentPage === 1
                  ? 'text-gray-300 dark:text-gray-600'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
              title="Previous page"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-xs text-gray-600 dark:text-gray-300 mx-2">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={nextPage}
              disabled={currentPage === totalPages}
              className={`p-1 rounded ${
                currentPage === totalPages
                  ? 'text-gray-300 dark:text-gray-600'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
              title="Next page"
            >
              <ChevronRight size={16} />
            </button>
          </div>
          
          <div className="flex items-center space-x-1">
            <button
              className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
              title="Bookmark page"
            >
              <Bookmark size={16} />
            </button>
            <button
              className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
              title="Toggle full screen"
            >
              <Maximize2 size={16} />
            </button>
          </div>
        </div>
        
        {/* Document content */}
        <div 
          className="flex-grow overflow-auto p-6 bg-gray-100 dark:bg-gray-900"
          ref={documentRef}
          onMouseUp={handleTextSelection}
        >
          {renderPageContent()}
        </div>
        
        {/* Comment panel for selected highlight */}
        {selectedHighlight && (
          <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-3">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Comment</h3>
              <button 
                onClick={() => setSelectedHighlight(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
            
            {highlights.find(h => h.id === selectedHighlight) && (
              <textarea
                className="w-full p-2 text-sm border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-200"
                placeholder="Add a comment..."
                value={highlights.find(h => h.id === selectedHighlight)?.comment || ''}
                onChange={(e) => addCommentToHighlight(selectedHighlight, e.target.value)}
                rows={2}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
} 