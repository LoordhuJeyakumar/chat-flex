import { useState } from 'react';
import { ChevronLeft, ChevronRight, Search, Download, Maximize2, Minimize2 } from 'lucide-react';

interface DocumentRendererProps {
  content: string;
  fileName?: string;
  fileType?: string;
  totalPages?: number;
  highlights?: Array<{
    text: string;
    page: number;
    color?: string;
  }>;
}

export default function DocumentRenderer({ 
  content, 
  fileName = 'document.pdf', 
  fileType = 'PDF',
  totalPages = 1,
  highlights = []
}: DocumentRendererProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  
  // Split content into pages (for demo purposes)
  // In a real app, you'd have actual page content
  const pages = content.length > 500 
    ? Array.from({ length: totalPages }, (_, i) => 
        content.slice(i * Math.floor(content.length / totalPages), 
                    (i + 1) * Math.floor(content.length / totalPages))
      )
    : [content];
  
  // Handle page navigation
  const goToPage = (page: number) => {
    const targetPage = Math.max(1, Math.min(page, pages.length));
    setCurrentPage(targetPage);
  };
  
  // Handle fullscreen toggle
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };
  
  // Get highlights for the current page
  const currentPageHighlights = highlights.filter(h => h.page === currentPage);
  
  // Handle search in current page
  const handleSearch = () => {
    if (!searchTerm.trim()) return;
    
    // In a real implementation, you would:
    // 1. Search the document for the search term
    // 2. Navigate to the page with the match
    // 3. Highlight the matched text
    
    // This is a simplified demo that just searches the current page
    const currentPageContent = pages[currentPage - 1].toLowerCase();
    const searchTermLower = searchTerm.toLowerCase();
    
    if (currentPageContent.includes(searchTermLower)) {
      alert(`Found "${searchTerm}" on page ${currentPage}`);
    } else {
      // Search in other pages and navigate to the first match
      const matchingPage = pages.findIndex(page => 
        page.toLowerCase().includes(searchTermLower)
      );
      
      if (matchingPage !== -1) {
        setCurrentPage(matchingPage + 1);
        alert(`Found "${searchTerm}" on page ${matchingPage + 1}`);
      } else {
        alert(`No matches found for "${searchTerm}"`);
      }
    }
  };
  
  // Handle download (in a real app, this would download the document)
  const handleDownload = () => {
    alert(`Downloading ${fileName}`);
    
    // In a real app, you would:
    // 1. Create a Blob from the document content
    // 2. Create a download link and click it
    // window.open(documentUrl, '_blank');
  };
  
  // Apply highlights to text
  const highlightText = (text: string, highlights: Array<{text: string, color?: string}>) => {
    if (!highlights.length) return text;
    
    let result = text;
    highlights.forEach(highlight => {
      const regex = new RegExp(`(${highlight.text})`, 'gi');
      result = result.replace(
        regex, 
        `<span class="bg-${highlight.color || 'yellow'}-200 dark:bg-${highlight.color || 'yellow'}-700/50">$1</span>`
      );
    });
    
    return result;
  };
  
  return (
    <div 
      className={`
        border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden
        ${isFullscreen ? 'fixed inset-0 z-50 bg-white dark:bg-gray-900 flex flex-col' : 'w-full'}
      `}
    >
      {/* Document header */}
      <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center">
          <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 mr-2">
            {fileType}
          </span>
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate max-w-[150px] sm:max-w-xs">
            {fileName}
          </h3>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Search toggle */}
          <button
            onClick={() => setShowSearch(!showSearch)}
            className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
            title="Search document"
          >
            <Search className="h-4 w-4" />
          </button>
          
          {/* Download */}
          <button
            onClick={handleDownload}
            className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
            title="Download document"
          >
            <Download className="h-4 w-4" />
          </button>
          
          {/* Fullscreen toggle */}
          <button
            onClick={toggleFullscreen}
            className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
            title={isFullscreen ? "Exit fullscreen" : "View fullscreen"}
          >
            {isFullscreen ? (
              <Minimize2 className="h-4 w-4" />
            ) : (
              <Maximize2 className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>
      
      {/* Search bar */}
      {showSearch && (
        <div className="p-2 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search document..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full p-2 pl-8 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
            <button
              onClick={handleSearch}
              className="ml-2 px-3 py-2 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
            >
              Find
            </button>
          </div>
        </div>
      )}
      
      {/* Document content */}
      <div 
        className={`
          bg-white dark:bg-gray-900 p-6 overflow-y-auto
          ${isFullscreen ? 'flex-1' : 'max-h-[500px]'}
        `}
      >
        <div className="max-w-2xl mx-auto bg-white dark:bg-gray-900 shadow-sm border border-gray-200 dark:border-gray-700 p-8 min-h-[400px]">
          <div 
            className="prose dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{
              __html: highlightText(
                pages[currentPage - 1],
                currentPageHighlights
              )
            }}
          />
        </div>
      </div>
      
      {/* Pagination */}
      <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={() => goToPage(currentPage - 1)}
          disabled={currentPage === 1}
          className={`
            flex items-center gap-1 p-1.5 rounded text-sm
            ${currentPage === 1 
              ? 'text-gray-400 cursor-not-allowed' 
              : 'text-blue-500 hover:bg-gray-200 dark:hover:bg-gray-700'}
          `}
        >
          <ChevronLeft className="h-4 w-4" />
          <span>Previous</span>
        </button>
        
        <span className="text-sm text-gray-600 dark:text-gray-300">
          Page {currentPage} of {pages.length}
        </span>
        
        <button
          onClick={() => goToPage(currentPage + 1)}
          disabled={currentPage === pages.length}
          className={`
            flex items-center gap-1 p-1.5 rounded text-sm
            ${currentPage === pages.length 
              ? 'text-gray-400 cursor-not-allowed' 
              : 'text-blue-500 hover:bg-gray-200 dark:hover:bg-gray-700'}
          `}
        >
          <span>Next</span>
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
} 