import { useEffect, useRef, useState } from 'react';
import { Download, RefreshCw } from 'lucide-react';
import Chart from 'chart.js/auto';

// Define Chart.js chart types
type ChartType = 'bar' | 'line' | 'pie' | 'scatter' | 'bubble' | 'doughnut' | 'radar' | 'polarArea';

interface ChartData {
  labels?: string[];
  datasets: {
    label: string;
    data: { x: number; y: number; r: number; }[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    fill?: boolean;
    tension?: number;
    borderWidth?: number;
    radius?: number;
  }[];
}

interface ChartRendererProps {
  chartData: {
    type: string;
    chartType: ChartType;
    data: ChartData;
    options?: Record<string, unknown>;
  };
}

export default function ChartRenderer({ chartData }: ChartRendererProps) {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart<ChartType, { x: number; y: number; r: number; }[], string> | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  
  // Check if dark mode is enabled
  useEffect(() => {
    const isDarkMode = document.documentElement.classList.contains('dark');
    setTheme(isDarkMode ? 'dark' : 'light');
    
    // Listen for theme changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          const isDarkMode = document.documentElement.classList.contains('dark');
          setTheme(isDarkMode ? 'dark' : 'light');
        }
      });
    });
    
    observer.observe(document.documentElement, { attributes: true });
    
    return () => {
      observer.disconnect();
    };
  }, []);
  
  // Create the chart
  useEffect(() => {
    if (!chartRef.current) return;
    
    // Color schemes based on theme
    const colorSchemes = {
      light: {
        backgroundColor: [
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 99, 132, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(153, 102, 255, 0.6)',
          'rgba(255, 159, 64, 0.6)',
        ],
        borderColor: [
          'rgba(54, 162, 235, 1)',
          'rgba(255, 99, 132, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)',
        ],
      },
      dark: {
        backgroundColor: [
          'rgba(54, 162, 235, 0.8)',
          'rgba(255, 99, 132, 0.8)',
          'rgba(255, 206, 86, 0.8)',
          'rgba(75, 192, 192, 0.8)',
          'rgba(153, 102, 255, 0.8)',
          'rgba(255, 159, 64, 0.8)',
        ],
        borderColor: [
          'rgba(54, 162, 235, 1)',
          'rgba(255, 99, 132, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)',
        ],
      },
    };
    
    // Apply color scheme if not specified in data
    const datasets = chartData.data.datasets.map((dataset, index) => {
      return {
        ...dataset,
        backgroundColor: dataset.backgroundColor || 
          (Array.isArray(dataset.data) 
            ? dataset.data.map((_, i) => colorSchemes[theme].backgroundColor[i % colorSchemes[theme].backgroundColor.length]) 
            : colorSchemes[theme].backgroundColor[index % colorSchemes[theme].backgroundColor.length]),
        borderColor: dataset.borderColor || 
          (Array.isArray(dataset.data) 
            ? dataset.data.map((_, i) => colorSchemes[theme].borderColor[i % colorSchemes[theme].borderColor.length]) 
            : colorSchemes[theme].borderColor[index % colorSchemes[theme].borderColor.length]),
      };
    });
    
    // Default options based on theme
    const defaultOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top' as const,
          labels: {
            color: theme === 'dark' ? '#e5e7eb' : '#374151',
            font: {
              family: 'system-ui, sans-serif',
            },
          },
        },
        tooltip: {
          backgroundColor: theme === 'dark' ? 'rgba(17, 24, 39, 0.8)' : 'rgba(255, 255, 255, 0.8)',
          titleColor: theme === 'dark' ? '#e5e7eb' : '#111827',
          bodyColor: theme === 'dark' ? '#e5e7eb' : '#111827',
          borderColor: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
          borderWidth: 1,
        },
      },
      scales: chartData.chartType !== 'pie' && chartData.chartType !== 'doughnut'
        ? {
            x: {
              grid: {
                color: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
              },
              ticks: {
                color: theme === 'dark' ? '#e5e7eb' : '#374151',
              },
            },
            y: {
              grid: {
                color: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
              },
              ticks: {
                color: theme === 'dark' ? '#e5e7eb' : '#374151',
              },
            },
          }
        : undefined,
    };
    
    // Merge default options with provided options
    const options = {
      ...defaultOptions,
      ...chartData.options,
    };
    
    // Destroy previous chart if it exists
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }
    
    // Create new chart
    chartInstance.current = new Chart(chartRef.current, {
      type: chartData.chartType,
      data: {
        ...chartData.data,
        datasets,
      },
      options,
    });
    
    // Cleanup on unmount
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [chartData, theme]);
  
  // Download chart as image
  const downloadChart = () => {
    if (!chartRef.current) return;
    
    const link = document.createElement('a');
    link.download = 'chart.png';
    link.href = chartRef.current.toDataURL('image/png');
    link.click();
  };
  
  return (
    <div className="w-full rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <h3 className="font-medium text-gray-700 dark:text-gray-300">
          {chartData.chartType.charAt(0).toUpperCase() + chartData.chartType.slice(1)} Chart
        </h3>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => {
              if (chartInstance.current) {
                chartInstance.current.destroy();
                chartInstance.current = null;
              }
              
              // Force re-render of the chart
              if (chartRef.current) {
                const ctx = chartRef.current.getContext('2d');
                if (ctx) ctx.clearRect(0, 0, chartRef.current.width, chartRef.current.height);
              }
              
              // Use setTimeout to ensure DOM update before recreating chart
              setTimeout(() => {
                if (chartRef.current) {
                  chartInstance.current = new Chart(chartRef.current, {
                    type: chartData.chartType,
                    data: chartData.data,
                    options: chartData.options,
                  });
                }
              }, 0);
            }}
            className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
            title="Refresh chart"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
          <button 
            onClick={downloadChart}
            className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
            title="Download as PNG"
          >
            <Download className="h-4 w-4" />
          </button>
        </div>
      </div>
      
      <div className="p-4 bg-white dark:bg-gray-900 h-64">
        <canvas ref={chartRef} />
      </div>
      
      {/* Legend */}
      <div className="p-3 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        <div className="flex flex-wrap gap-4 justify-center">
          {chartData.data.datasets.map((dataset, index) => (
            <div key={index} className="flex items-center">
              <span 
                className="w-3 h-3 rounded-full mr-1"
                style={{ 
                  backgroundColor: 
                    Array.isArray(dataset.backgroundColor) 
                      ? dataset.backgroundColor[0] 
                      : dataset.backgroundColor
                }}
              />
              <span className="text-sm text-gray-600 dark:text-gray-300">
                {dataset.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 