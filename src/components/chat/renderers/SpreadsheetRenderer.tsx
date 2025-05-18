import { useState } from 'react';
import { Download, Search, ArrowUpDown } from 'lucide-react';

interface SpreadsheetMetadata {
  columns: string[];
  summary?: string;
}

// Define a more specific type for cell data
type CellValue = string | number | boolean | null | undefined;

interface SpreadsheetRendererProps {
  data: Record<string, CellValue>[];
  metadata?: SpreadsheetMetadata;
}

export default function SpreadsheetRenderer({ data, metadata }: SpreadsheetRendererProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5;
  
  // Extract columns from data if not provided in metadata
  const columns = metadata?.columns || 
    (data.length > 0 ? Object.keys(data[0]) : []);
  
  // Filter data based on search term
  const filteredData = data.filter(row => 
    Object.values(row).some(value => 
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );
  
  // Sort data
  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortColumn) return 0;
    
    const aValue = a[sortColumn];
    const bValue = b[sortColumn];
    
    // Handle different value types
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
    }
    
    const aString = String(aValue).toLowerCase();
    const bString = String(bValue).toLowerCase();
    
    return sortDirection === 'asc' 
      ? aString.localeCompare(bString)
      : bString.localeCompare(aString);
  });
  
  // Paginate data
  const totalPages = Math.ceil(sortedData.length / rowsPerPage);
  const paginatedData = sortedData.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );
  
  // Handle sort toggle
  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };
  
  // Download as CSV
  const downloadCSV = () => {
    // Create CSV content
    const csvContent = [
      columns.join(','),
      ...data.map(row => 
        columns.map(col => {
          // Handle values with commas by wrapping in quotes
          const value = String(row[col] ?? '');
          return value.includes(',') ? `"${value}"` : value;
        }).join(',')
      )
    ].join('\n');
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'data.csv';
    a.click();
    
    // Clean up
    URL.revokeObjectURL(url);
  };
  
  return (
    <div className="w-full rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
      {/* Header with search and download */}
      <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 p-3 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center bg-white dark:bg-gray-700 rounded-md px-2 py-1 w-48">
          <Search className="h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="ml-2 flex-1 bg-transparent border-none outline-none text-sm"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {filteredData.length} rows
          </span>
          <button 
            onClick={downloadCSV}
            className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
            title="Download as CSV"
          >
            <Download className="h-4 w-4" />
          </button>
        </div>
      </div>
      
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-800">
              {columns.map(column => (
                <th 
                  key={column}
                  className="px-4 py-2 text-left font-medium text-gray-600 dark:text-gray-300 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={() => handleSort(column)}
                >
                  <div className="flex items-center">
                    <span>{column}</span>
                    {sortColumn === column && (
                      <ArrowUpDown className={`ml-1 h-3 w-3 transition-transform ${
                        sortDirection === 'desc' ? 'transform rotate-180' : ''
                      }`} />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData.length > 0 ? (
              paginatedData.map((row, index) => (
                <tr 
                  key={index} 
                  className={`
                    ${index % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-800/50'} 
                    hover:bg-gray-100 dark:hover:bg-gray-700/50
                  `}
                >
                  {columns.map(column => (
                    <td key={column} className="px-4 py-2 border-t border-gray-200 dark:border-gray-700">
                      {String(row[column] ?? '')}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td 
                  colSpan={columns.length} 
                  className="px-4 py-4 text-center text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700"
                >
                  No data found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 px-4 py-3 border-t border-gray-200 dark:border-gray-700">
          <button 
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className={`
              px-2 py-1 rounded text-sm
              ${currentPage === 1 
                ? 'text-gray-400 cursor-not-allowed' 
                : 'text-blue-500 hover:bg-gray-200 dark:hover:bg-gray-700'}
            `}
          >
            Previous
          </button>
          
          <span className="text-sm text-gray-600 dark:text-gray-300">
            Page {currentPage} of {totalPages}
          </span>
          
          <button 
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className={`
              px-2 py-1 rounded text-sm
              ${currentPage === totalPages 
                ? 'text-gray-400 cursor-not-allowed' 
                : 'text-blue-500 hover:bg-gray-200 dark:hover:bg-gray-700'}
            `}
          >
            Next
          </button>
        </div>
      )}
      
      {/* Summary if available */}
      {metadata?.summary && (
        <div className="p-3 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 text-sm text-gray-600 dark:text-gray-300">
          <strong>Summary:</strong> {metadata.summary}
        </div>
      )}
    </div>
  );
} 