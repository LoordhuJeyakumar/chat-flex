import { Conversation } from "@/types/core";
interface CustomTooltipItem {
  datasetIndex: number;
  xLabel: number;
  yLabel: number;
}

interface CustomChartData {
  datasets: Array<{
    label: string;
    data: Array<{ x: number; y: number; r?: number }>;
    backgroundColor?: string;
  }>;
}

export const mockConversations: Conversation[] = [
  {
    id: "conv-1",
    title: "Code Collaboration Session",
    description: "A conversation focused on code review and collaboration",
    messages: [
      {
        id: "msg-1",
        sender: "user",
        timestamp: new Date("2025-05-17T12:00:00"),
        content: {
          type: "text",
          data: "I'm working on a React component that displays user analytics. Could you help me optimize it?",
        },
      },
      {
        id: "msg-2",
        sender: "ai",
        timestamp: new Date("2025-05-17T12:00:05"),
        thinking: [
          {
            step: "Understanding request",
            content: "User needs help with React component optimization",
          },
          {
            step: "Requesting code",
            content: "Need to see the component code to provide specific help",
          },
        ],
        content: {
          type: "text",
          data: "I'd be happy to help optimize your React component. Could you share the code you're working with?",
        },
      },
      {
        id: "msg-3",
        sender: "user",
        timestamp: new Date("2025-05-17T12:01:30"),
        content: {
          type: "code",
          language: "jsx",
          data: `function UserAnalytics({ userData }) {
  const [activeTab, setActiveTab] = useState('daily');
  const [chartData, setChartData] = useState([]);
  
  useEffect(() => {
    // This recalculates on every render
    const processedData = userData.map(item => {
      return {
        date: new Date(item.timestamp),
        value: item.value,
        category: item.category
      };
    });
    
    const filteredData = processedData.filter(item => {
      if (activeTab === 'daily') return true;
      if (activeTab === 'weekly') return item.date.getDay() === 1; // Mondays
      if (activeTab === 'monthly') return item.date.getDate() === 1; // First of month
      return true;
    });
    
    setChartData(filteredData);
  }, [userData, activeTab]);
  
  return (
    <div className="user-analytics-container">
      <div className="tabs">
        <button 
          className={activeTab === 'daily' ? 'active' : ''} 
          onClick={() => setActiveTab('daily')}
        >
          Daily
        </button>
        <button 
          className={activeTab === 'weekly' ? 'active' : ''} 
          onClick={() => setActiveTab('weekly')}
        >
          Weekly
        </button>
        <button 
          className={activeTab === 'monthly' ? 'active' : ''} 
          onClick={() => setActiveTab('monthly')}
        >
          Monthly
        </button>
      </div>
      
      <div className="chart-container">
        {chartData.length > 0 ? (
          <LineChart width={600} height={400} data={chartData}>
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="value" stroke="#8884d8" />
          </LineChart>
        ) : (
          <p>No data available</p>
        )}
      </div>
      
      <div className="stats-summary">
        {Object.keys(userData).length > 0 && (
          <>
            <div className="stat-card">
              <h3>Total Views</h3>
              <p>{userData.reduce((sum, item) => sum + item.views, 0)}</p>
            </div>
            <div className="stat-card">
              <h3>Average Engagement</h3>
              <p>
                {(
                  userData.reduce((sum, item) => sum + item.engagement, 0) / 
                  userData.length
                ).toFixed(2)}%
              </p>
            </div>
            <div className="stat-card">
              <h3>Peak Time</h3>
              <p>{findPeakTime(userData)}</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// This helper function is defined outside the component but is used inside
function findPeakTime(data) {
  // Expensive calculation to find peak time
  // ...complex logic here
  return "2:00 PM";
}`,
        },
      },
      {
        id: "msg-4",
        sender: "ai",
        timestamp: new Date("2025-05-17T12:02:30"),
        thinking: [
          {
            step: "Analyzing code",
            content: "Identifying performance issues in the React component",
          },
          {
            step: "Finding optimization opportunities",
            content:
              "Several areas for improvement: useMemo for data processing, memoization of expensive calculations, optimizing renders",
          },
          {
            step: "Preparing code recommendations",
            content:
              "Creating optimized version with useMemo, useCallback and component restructuring",
          },
        ],
        tools: [
          {
            name: "code-analyzer",
            execution:
              "Analyzing React component structure and performance bottlenecks",
            result:
              "Identified 3 optimization opportunities: data processing, filter calculations, and unnecessary re-renders",
          },
        ],
        content: {
          type: "code",
          language: "jsx",
          data: `function UserAnalytics({ userData }) {
  const [activeTab, setActiveTab] = useState('daily');
  
  // Process data once when userData changes
  const processedData = useMemo(() => {
    return userData.map(item => ({
      date: new Date(item.timestamp),
      value: item.value,
      category: item.category
    }));
  }, [userData]);
  
  // Filter data when processed data or activeTab changes
  const chartData = useMemo(() => {
    return processedData.filter(item => {
      if (activeTab === 'daily') return true;
      if (activeTab === 'weekly') return item.date.getDay() === 1; // Mondays
      if (activeTab === 'monthly') return item.date.getDate() === 1; // First of month
      return true;
    });
  }, [processedData, activeTab]);
  
  // Memoize tab click handlers
  const handleTabClick = useCallback((tab) => {
    setActiveTab(tab);
  }, []);
  
  // Calculate stats once when userData changes
  const stats = useMemo(() => {
    if (!userData.length) return null;
    
    return {
      totalViews: userData.reduce((sum, item) => sum + item.views, 0),
      avgEngagement: (
        userData.reduce((sum, item) => sum + item.engagement, 0) / 
        userData.length
      ).toFixed(2),
      peakTime: findPeakTime(userData)
    };
  }, [userData]);
  
  return (
    <div className="user-analytics-container">
      <TabSelector 
        activeTab={activeTab} 
        onTabChange={handleTabClick} 
      />
      
      <ChartDisplay data={chartData} />
      
      {stats && <StatsSummary stats={stats} />}
    </div>
  );
}

// Extracted components
const TabSelector = React.memo(({ activeTab, onTabChange }) => (
  <div className="tabs">
    <button 
      className={activeTab === 'daily' ? 'active' : ''} 
      onClick={() => onTabChange('daily')}
    >
      Daily
    </button>
    <button 
      className={activeTab === 'weekly' ? 'active' : ''} 
      onClick={() => onTabChange('weekly')}
    >
      Weekly
    </button>
    <button 
      className={activeTab === 'monthly' ? 'active' : ''} 
      onClick={() => onTabChange('monthly')}
    >
      Monthly
    </button>
  </div>
));

const ChartDisplay = React.memo(({ data }) => (
  <div className="chart-container">
    {data.length > 0 ? (
      <LineChart width={600} height={400} data={data}>
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="value" stroke="#8884d8" />
      </LineChart>
    ) : (
      <p>No data available</p>
    )}
  </div>
));

const StatsSummary = React.memo(({ stats }) => (
  <div className="stats-summary">
    <div className="stat-card">
      <h3>Total Views</h3>
      <p>{stats.totalViews}</p>
    </div>
    <div className="stat-card">
      <h3>Average Engagement</h3>
      <p>{stats.avgEngagement}%</p>
    </div>
    <div className="stat-card">
      <h3>Peak Time</h3>
      <p>{stats.peakTime}</p>
    </div>
  </div>
));

// Moved outside and memoized
const findPeakTime = memoize((data) => {
  // Expensive calculation to find peak time
  // ...complex logic here
  return "2:00 PM";
});`,
        },
      },
      {
        id: "msg-5",
        sender: "ai",
        timestamp: new Date("2025-05-17T12:02:35"),
        content: {
          type: "text",
          data: "I've optimized your React component with several performance improvements:\n\n1. **Used useMemo for data processing** to avoid recalculating on every render\n2. **Extracted smaller components** and wrapped them with React.memo to prevent unnecessary re-renders\n3. **Memoized event handlers** with useCallback\n4. **Calculated stats once** when userData changes\n5. **Moved the expensive findPeakTime function** outside and memoized it\n\nThese changes should significantly improve performance, especially with large datasets. Would you like me to explain any part in more detail?",
        },
      },
      {
        id: "msg-6",
        sender: "user",
        timestamp: new Date("2025-05-17T12:03:45"),
        content: {
          type: "text",
          data: "This looks great! But I'm not familiar with the memoization technique you used for the findPeakTime function. Can you explain how that works?",
        },
      },
      {
        id: "msg-7",
        sender: "ai",
        timestamp: new Date("2025-05-17T12:04:30"),
        thinking: [
          {
            step: "Planning explanation",
            content: "Need to explain memoization concept and implementation",
          },
          {
            step: "Creating code example",
            content: "Will provide a simple implementation of memoize function",
          },
        ],
        content: {
          type: "text",
          data: "Memoization is a technique that stores the results of expensive function calls and returns the cached result when the same inputs occur again. It's particularly useful for pure functions like your findPeakTime that may be computing the same result repeatedly.\n\nHere's how a simple memoize function works:",
        },
      },
      {
        id: "msg-8",
        sender: "ai",
        timestamp: new Date("2025-05-17T12:04:35"),
        content: {
          type: "code",
          language: "javascript",
          data: `// A simple memoization function
function memoize(fn) {
  const cache = new Map();
  
  return function(...args) {
    // Create a key from the arguments
    const key = JSON.stringify(args);
    
    // If we've seen these exact arguments before, return the cached result
    if (cache.has(key)) {
      return cache.get(key);
    }
    
    // Otherwise, call the original function
    const result = fn(...args);
    
    // Cache the result for future calls
    cache.set(key, result);
    
    return result;
  };
}

// Using it with your function
const findPeakTime = memoize((data) => {
  console.log('Computing peak time...'); // This will only log when the function is actually computed
  // Expensive calculation
  // ...
  return "2:00 PM";
});

// First call - computes the result
const result1 = findPeakTime(userData); // logs "Computing peak time..."

// Second call with same data - returns cached result without computing
const result2 = findPeakTime(userData); // no log, returns cached result immediately`,
        },
      },
      {
        id: "msg-9",
        sender: "user",
        timestamp: new Date("2025-05-17T12:06:00"),
        content: {
          type: "image",
          data: "/api/placeholder/800/600",
          caption:
            "Screenshot of my app's performance metrics before optimization",
        },
      },
      {
        id: "msg-10",
        sender: "ai",
        timestamp: new Date("2025-05-17T12:06:45"),
        thinking: [
          {
            step: "Analyzing image",
            content: "Examining performance metrics screenshot",
          },
          {
            step: "Identifying patterns",
            content:
              "Looking for render times, component updates, and bottlenecks",
          },
        ],
        tools: [
          {
            name: "image-analyzer",
            execution: "Analyzing performance metrics screenshot",
            result:
              "Detected high render counts and long render duration for UserAnalytics component",
          },
        ],
        content: {
          type: "text",
          data: "Based on your performance metrics screenshot, I can see there were frequent re-renders of the UserAnalytics component (rendering 36 times during the session). The optimizations I suggested should help reduce this significantly.\n\nAfter implementing the changes, I'd expect to see:\n\n1. Fewer component renders overall\n2. Lower render duration for each update\n3. Less CPU usage during tab changes\n\nWould you like me to suggest a way to measure the improvement after implementing these changes?",
        },
      },
    ],
  },

  {
    id: "conv-2",
    title: "Data Analysis Session",
    description: "Analyzing spreadsheet data and creating visualizations",
    messages: [
      {
        id: "msg-1",
        sender: "user",
        timestamp: new Date("2025-05-17T14:00:00"),
        content: {
          type: "text",
          data: "I have some sales data I need to analyze. Can you help me understand the trends?",
        },
      },
      {
        id: "msg-2",
        sender: "ai",
        timestamp: new Date("2025-05-17T14:00:10"),
        content: {
          type: "text",
          data: "I'd be happy to help analyze your sales data and identify trends. Could you please share the data with me?",
        },
      },
      {
        id: "msg-3",
        sender: "user",
        timestamp: new Date("2025-05-17T14:01:00"),
        content: {
          type: "spreadsheet",
          data: [
            {
              date: "2025-01-01",
              region: "North",
              product: "Widget A",
              sales: 1200,
              profit: 240,
            },
            {
              date: "2025-01-01",
              region: "South",
              product: "Widget A",
              sales: 900,
              profit: 180,
            },
            {
              date: "2025-01-01",
              region: "East",
              product: "Widget A",
              sales: 1100,
              profit: 220,
            },
            {
              date: "2025-01-01",
              region: "West",
              product: "Widget A",
              sales: 1000,
              profit: 200,
            },
            {
              date: "2025-01-01",
              region: "North",
              product: "Widget B",
              sales: 500,
              profit: 150,
            },
            {
              date: "2025-01-01",
              region: "South",
              product: "Widget B",
              sales: 600,
              profit: 180,
            },
            {
              date: "2025-01-01",
              region: "East",
              product: "Widget B",
              sales: 450,
              profit: 135,
            },
            {
              date: "2025-01-01",
              region: "West",
              product: "Widget B",
              sales: 550,
              profit: 165,
            },
            {
              date: "2025-02-01",
              region: "North",
              product: "Widget A",
              sales: 1250,
              profit: 250,
            },
            {
              date: "2025-02-01",
              region: "South",
              product: "Widget A",
              sales: 950,
              profit: 190,
            },
            {
              date: "2025-02-01",
              region: "East",
              product: "Widget A",
              sales: 1150,
              profit: 230,
            },
            {
              date: "2025-02-01",
              region: "West",
              product: "Widget A",
              sales: 1050,
              profit: 210,
            },
            {
              date: "2025-02-01",
              region: "North",
              product: "Widget B",
              sales: 550,
              profit: 165,
            },
            {
              date: "2025-02-01",
              region: "South",
              product: "Widget B",
              sales: 650,
              profit: 195,
            },
            {
              date: "2025-02-01",
              region: "East",
              product: "Widget B",
              sales: 500,
              profit: 150,
            },
            {
              date: "2025-02-01",
              region: "West",
              product: "Widget B",
              sales: 600,
              profit: 180,
            },
            {
              date: "2025-03-01",
              region: "North",
              product: "Widget A",
              sales: 1400,
              profit: 280,
            },
            {
              date: "2025-03-01",
              region: "South",
              product: "Widget A",
              sales: 1000,
              profit: 200,
            },
            {
              date: "2025-03-01",
              region: "East",
              product: "Widget A",
              sales: 1300,
              profit: 260,
            },
            {
              date: "2025-03-01",
              region: "West",
              product: "Widget A",
              sales: 1200,
              profit: 240,
            },
            {
              date: "2025-03-01",
              region: "North",
              product: "Widget B",
              sales: 600,
              profit: 180,
            },
            {
              date: "2025-03-01",
              region: "South",
              product: "Widget B",
              sales: 700,
              profit: 210,
            },
            {
              date: "2025-03-01",
              region: "East",
              product: "Widget B",
              sales: 550,
              profit: 165,
            },
            {
              date: "2025-03-01",
              region: "West",
              product: "Widget B",
              sales: 650,
              profit: 195,
            },
            {
              date: "2025-04-01",
              region: "North",
              product: "Widget A",
              sales: 1500,
              profit: 300,
            },
            {
              date: "2025-04-01",
              region: "South",
              product: "Widget A",
              sales: 1100,
              profit: 220,
            },
            {
              date: "2025-04-01",
              region: "East",
              product: "Widget A",
              sales: 1400,
              profit: 280,
            },
            {
              date: "2025-04-01",
              region: "West",
              product: "Widget A",
              sales: 1300,
              profit: 260,
            },
            {
              date: "2025-04-01",
              region: "North",
              product: "Widget B",
              sales: 650,
              profit: 195,
            },
            {
              date: "2025-04-01",
              region: "South",
              product: "Widget B",
              sales: 750,
              profit: 225,
            },
            {
              date: "2025-04-01",
              region: "East",
              product: "Widget B",
              sales: 600,
              profit: 180,
            },
            {
              date: "2025-04-01",
              region: "West",
              product: "Widget B",
              sales: 700,
              profit: 210,
            },
          ],
          metadata: {
            columns: ["date", "region", "product", "sales", "profit"],
            summary: "Sales data by region, product, and date for Q1 2025",
          },
        },
      },
      {
        id: "msg-4",
        sender: "ai",
        timestamp: new Date("2025-05-17T14:02:30"),
        thinking: [
          {
            step: "Analyzing data",
            content: "Reviewing sales data structure and contents",
          },
          {
            step: "Identifying trends",
            content:
              "Looking for patterns across regions, products, and time periods",
          },
          {
            step: "Preparing visualizations",
            content: "Creating appropriate charts to illustrate key findings",
          },
        ],
        tools: [
          {
            name: "data-processor",
            execution: "Aggregating sales data by region, product, and date",
            result: "Created summary statistics and identified growth trends",
          },
          {
            name: "chart-generator",
            execution: "Creating visualization of sales trends",
            result: "Generated bar chart, line chart, and region comparison",
          },
        ],
        content: {
          type: "text",
          data: "I've analyzed your sales data for Q1 2025 and found several interesting trends:\n\n1. **Overall Growth**: Both Widget A and Widget B show consistent month-over-month growth across all regions.\n\n2. **Regional Performance**: The North region consistently outperforms other regions for Widget A, while the South region leads in Widget B sales.\n\n3. **Product Comparison**: Widget A has significantly higher sales volume than Widget B (approximately 2:1 ratio), but Widget B has a better profit margin percentage.\n\n4. **Growth Rate**: The North region shows the fastest growth rate for both products.\n\nLet me show you some visualizations to illustrate these trends:",
        },
      },
      {
        id: "msg-5",
        sender: "ai",
        timestamp: new Date("2025-05-17T14:02:45"),
        content: {
          type: "chart",
          chartType: "bar",
          data: {
            labels: ["January", "February", "March", "April"],
            datasets: [
              {
                label: "Widget A Sales",
                data: [4200, 4400, 4900, 5300],
                backgroundColor: "rgba(75, 192, 192, 0.6)",
              },
              {
                label: "Widget B Sales",
                data: [2100, 2300, 2500, 2700],
                backgroundColor: "rgba(153, 102, 255, 0.6)",
              },
            ],
          },
          options: {
            title: {
              display: true,
              text: "Monthly Sales by Product",
            },
            scales: {
              yAxes: [
                {
                  ticks: {
                    beginAtZero: true,
                  },
                },
              ],
            },
          },
        },
      },
      {
        id: "msg-6",
        sender: "ai",
        timestamp: new Date("2025-05-17T14:03:00"),
        content: {
          type: "chart",
          chartType: "line",
          data: {
            labels: ["January", "February", "March", "April"],
            datasets: [
              {
                label: "North",
                data: [1700, 1800, 2000, 2150],
                borderColor: "rgba(255, 99, 132, 1)",
                fill: false,
              },
              {
                label: "South",
                data: [1500, 1600, 1700, 1850],
                borderColor: "rgba(54, 162, 235, 1)",
                fill: false,
              },
              {
                label: "East",
                data: [1550, 1650, 1850, 2000],
                borderColor: "rgba(255, 206, 86, 1)",
                fill: false,
              },
              {
                label: "West",
                data: [1550, 1650, 1850, 2000],
                borderColor: "rgba(75, 192, 192, 1)",
                fill: false,
              },
            ],
          },
          options: {
            title: {
              display: true,
              text: "Sales Trends by Region (All Products)",
            },
          },
        },
      },
      {
        id: "msg-7",
        sender: "user",
        timestamp: new Date("2025-05-17T14:03:45"),
        content: {
          type: "text",
          data: "These charts are helpful. Can you break down the profit margins by region and product? I'm trying to decide where to focus our marketing efforts next quarter.",
        },
      },
      {
        id: "msg-8",
        sender: "ai",
        timestamp: new Date("2025-05-17T14:04:30"),
        thinking: [
          {
            step: "Calculating profit margins",
            content:
              "Computing profit margins (profit/sales) for each region and product",
          },
          {
            step: "Comparing performance",
            content: "Identifying highest profit margin combinations",
          },
          {
            step: "Making recommendations",
            content:
              "Formulating marketing strategy recommendations based on data",
          },
        ],
        tools: [
          {
            name: "data-processor",
            execution:
              "Calculating profit margins and regional performance metrics",
            result: "Generated profit margin analysis by region and product",
          },
        ],
        content: {
          type: "spreadsheet",
          data: [
            {
              region: "North",
              product: "Widget A",
              salesVolume: 5350,
              profitMargin: "20.0%",
              growthRate: "5.8%",
            },
            {
              region: "South",
              product: "Widget A",
              salesVolume: 3950,
              profitMargin: "20.0%",
              growthRate: "5.1%",
            },
            {
              region: "East",
              product: "Widget A",
              salesVolume: 4950,
              profitMargin: "20.0%",
              growthRate: "6.2%",
            },
            {
              region: "West",
              product: "Widget A",
              salesVolume: 4550,
              profitMargin: "20.0%",
              growthRate: "6.8%",
            },
            {
              region: "North",
              product: "Widget B",
              salesVolume: 2300,
              profitMargin: "30.0%",
              growthRate: "9.2%",
            },
            {
              region: "South",
              product: "Widget B",
              salesVolume: 2700,
              profitMargin: "30.0%",
              growthRate: "7.7%",
            },
            {
              region: "East",
              product: "Widget B",
              salesVolume: 2100,
              profitMargin: "30.0%",
              growthRate: "10.0%",
            },
            {
              region: "West",
              product: "Widget B",
              salesVolume: 2500,
              profitMargin: "30.0%",
              growthRate: "8.3%",
            },
          ],
          metadata: {
            columns: [
              "region",
              "product",
              "salesVolume",
              "profitMargin",
              "growthRate",
            ],
            summary: "Profit margin and growth analysis by region and product",
          },
        },
      },
      {
        id: "msg-9",
        sender: "ai",
        timestamp: new Date("2025-05-17T14:04:45"),
        content: {
          type: "text",
          data: "Based on the profit margin analysis and growth rates, here are my recommendations for your marketing focus next quarter:\n\n1. **Highest Growth Potential**: The East region for Widget B shows the highest growth rate at 10.0%. This suggests an emerging market that's responding well to the product.\n\n2. **Highest Profit Opportunity**: Widget B has a significantly higher profit margin (30%) compared to Widget A (20%) across all regions.\n\n3. **Strategic Recommendations**:\n   - **Primary Focus**: Increase Widget B marketing in the East region to capitalize on both high growth and high profit margins.\n   - **Secondary Focus**: The North region for Widget B also shows strong growth (9.2%) and the same high profit margin.\n   - **Consider Bundle Strategy**: In the West region, both products show strong growth, so a bundling strategy might work well there.\n\nWould you like me to create a more detailed marketing allocation plan based on these insights?",
        },
      },
      {
        id: "msg-10",
        sender: "user",
        timestamp: new Date("2025-05-17T14:05:30"),
        content: {
          type: "audio",
          data: "/api/placeholder/audio",
          duration: 35,
          transcription:
            "This is really helpful analysis. Can you create a visual that shows the relationship between growth rate and profit margin for each region-product combination? That would help me present this to the executive team next week.",
        },
      },
      {
        id: "msg-11",
        sender: "ai",
        timestamp: new Date("2025-05-17T14:06:15"),
        thinking: [
          {
            step: "Planning visualization",
            content:
              "Determining best chart type for comparing growth rate and profit margin",
          },
          {
            step: "Preparing data",
            content: "Structuring data for scatter plot visualization",
          },
        ],
        tools: [
          {
            name: "chart-generator",
            execution: "Creating scatter plot of growth rate vs profit margin",
            result: "Generated bubble chart with size indicating sales volume",
          },
        ],
        content: {
          type: "chart",
          chartType: "bubble",
          data: {
            datasets: [
              {
                label: "North - Widget A",
                data: [{ x: 5.8, y: 20.0, r: 15 }],
                backgroundColor: "rgba(255, 99, 132, 0.6)",
              },
              {
                label: "South - Widget A",
                data: [{ x: 5.1, y: 20.0, r: 12 }],
                backgroundColor: "rgba(54, 162, 235, 0.6)",
              },
              {
                label: "East - Widget A",
                data: [{ x: 6.2, y: 20.0, r: 14 }],
                backgroundColor: "rgba(255, 206, 86, 0.6)",
              },
              {
                label: "West - Widget A",
                data: [{ x: 6.8, y: 20.0, r: 13 }],
                backgroundColor: "rgba(75, 192, 192, 0.6)",
              },
              {
                label: "North - Widget B",
                data: [{ x: 9.2, y: 30.0, r: 8 }],
                backgroundColor: "rgba(153, 102, 255, 0.6)",
              },
              {
                label: "South - Widget B",
                data: [{ x: 7.7, y: 30.0, r: 9 }],
                backgroundColor: "rgba(255, 159, 64, 0.6)",
              },
              {
                label: "East - Widget B",
                data: [{ x: 10.0, y: 30.0, r: 7 }],
                backgroundColor: "rgba(199, 199, 199, 0.6)",
              },
              {
                label: "West - Widget B",
                data: [{ x: 8.3, y: 30.0, r: 8 }],
                backgroundColor: "rgba(83, 102, 255, 0.6)",
              },
            ],
          },
          options: {
            title: {
              display: true,
              text: "Growth Rate vs. Profit Margin by Region and Product",
            },
            scales: {
              xAxes: [
                {
                  scaleLabel: {
                    display: true,
                    labelString: "Growth Rate (%)",
                  },
                },
              ],
              yAxes: [
                {
                  scaleLabel: {
                    display: true,
                    labelString: "Profit Margin (%)",
                  },
                },
              ],
            },
            tooltips: {
              callbacks: {
                label: function (
                  tooltipItem: CustomTooltipItem,
                  data: CustomChartData
                ) {
                  return (
                    data.datasets[tooltipItem.datasetIndex].label +
                    ": Growth " +
                    tooltipItem.xLabel +
                    "%, Margin " +
                    tooltipItem.yLabel +
                    "%"
                  );
                },
              },
            },
          },
        },
      },
      {
        id: "msg-12",
        sender: "ai",
        timestamp: new Date("2025-05-17T14:06:30"),
        content: {
          type: "text",
          data: "I've created a bubble chart showing the relationship between growth rate and profit margin for each region-product combination. The chart highlights several key insights that would be valuable for your executive presentation:\n\n1. **Widget B Clusters**: All Widget B combinations appear in the upper region of the chart, showing consistently higher profit margins (30%) compared to Widget A (20%).\n\n2. **East-Widget B Sweet Spot**: The East-Widget B combination shows the highest growth rate (10%) while maintaining the high profit margin, making it the clear opportunity leader.\n\n3. **Bubble Size**: The bubble sizes represent relative sales volume, showing that while Widget A has larger volume, Widget B offers better growth and margin opportunities.\n\nThis visualization clearly demonstrates why focusing marketing efforts on Widget B in the East region would be the optimal strategy for maximizing both growth and profitability.",
        },
      },
    ],
  },

  {
    id: "conv-3",
    title: "Document Review Session",
    description: "Reviewing and commenting on a product specification document",
    messages: [
      {
        id: "msg-1",
        sender: "user",
        timestamp: new Date("2025-05-17T16:00:00"),
        content: {
          type: "text",
          data: "I need help reviewing this product specification document for our new mobile app. Can you help me identify any gaps or areas that need clarification?",
        },
      },
      {
        id: "msg-2",
        sender: "ai",
        timestamp: new Date("2025-05-17T16:00:15"),
        content: {
          type: "text",
          data: "I'd be happy to review your product specification document and help identify any gaps or areas needing clarification. Please share the document when you're ready.",
        },
      },
      {
        id: "msg-3",
        sender: "user",
        timestamp: new Date("2025-05-17T16:01:00"),
        content: {
          type: "document",
          data: "Product Specification: HealthTrack Mobile App\n\nVersion: 1.0\nDate: May 15, 2025\n\n1. Product Overview\nHealthTrack is a mobile application designed to help users monitor and improve their health by tracking various metrics, providing personalized recommendations, and connecting with healthcare providers.\n\n2. Target Audience\n- Health-conscious individuals aged 25-55\n- People managing chronic conditions\n- Fitness enthusiasts\n- Healthcare providers\n\n3. Key Features\n\n3.1 Health Metrics Tracking\n- Step counting\n- Heart rate monitoring\n- Sleep tracking\n- Nutrition logging\n- Medication reminders\n\n3.2 User Dashboard\n- Daily, weekly, and monthly views\n- Progress towards goals\n- Health insights and trends\n\n3.3 Social Features\n- Connect with friends\n- Join health challenges\n- Share achievements\n\n3.4 Healthcare Provider Integration\n- Share data with doctors\n- Telemedicine appointment scheduling\n- Secure messaging with healthcare team\n\n4. Technical Requirements\n\n4.1 Platforms\n- iOS (iPhone 12 and newer)\n- Android (version 10.0 and above)\n\n4.2 Integrations\n- Apple Health\n- Google Fit\n- Major fitness trackers (Fitbit, Garmin, etc.)\n- Electronic Health Record (EHR) systems\n\n4.3 Data Security\n- HIPAA compliance\n- End-to-end encryption\n- User authentication\n\n5. User Flow\n\n5.1 Onboarding\n- Account creation\n- Health profile setup\n- Connection to devices and services\n- Initial goal setting\n\n5.2 Daily Use\n- Dashboard review\n- Metrics logging\n- Recommendation review\n\n6. Design Guidelines\n\n6.1 Visual Style\n- Clean, medical aesthetic\n- Accessible color palette\n- Clear data visualizations\n\n6.2 Accessibility\n- Support for screen readers\n- Adjustable text sizes\n- Voice commands\n\n7. Development Timeline\n\nPhase 1 (June 2025)\n- Core tracking features\n- Basic dashboard\n- User accounts and profiles\n\nPhase 2 (August 2025)\n- Social features\n- Enhanced analytics\n- Initial healthcare provider features\n\nPhase 3 (October 2025)\n- Full healthcare integration\n- Advanced recommendations\n- Premium subscription features\n\n8. Success Metrics\n\n- User acquisition: 100,000 users in first 3 months\n- Retention: 60% 30-day retention rate\n- Engagement: 5 app opens per week per user\n- Health outcomes: Improvement in user-reported health metrics, subscription features\n\n8. Success Metrics\n\n- User acquisition: 100,000 users in first 3 months\n- Retention: 60% 30-day retention rate\n- Engagement: 5 app opens per week per user\n- Health outcomes: Improvement in user-reported health metrics",
          filename: "HealthTrack_Product_Spec_v1.0.txt",
          fileType: "text/plain",
          pages: 1,
        },
      },
      {
        id: "msg-4",
        sender: "ai",
        timestamp: new Date("2025-05-17T16:02:30"),
        thinking: [
          {
            step: "Analyzing document",
            content: "Reviewing product specification structure and content",
          },
          {
            step: "Identifying gaps",
            content: "Looking for missing or unclear information",
          },
          {
            step: "Evaluating scope",
            content: "Assessing if all key areas are addressed adequately",
          },
        ],
        tools: [
          {
            name: "document-analyzer",
            execution: "Analyzing product specification document",
            result:
              "Identified 7 potential gaps or areas needing clarification",
          },
        ],
        content: {
          type: "document",
          data: "# Document Review: HealthTrack Mobile App Specification\n\n## Overview\nI've reviewed the HealthTrack Mobile App product specification document (version 1.0) and identified several areas that would benefit from additional clarification or detail.\n\n## Key Gaps & Recommendations\n\n### 1. Data Handling & Privacy Policy\n**Gap**: Missing details about data retention, user data deletion options, and compliance with international privacy regulations (GDPR, CCPA).\n**Recommendation**: Add a dedicated section covering data handling practices, privacy policy integration, and compliance with global regulations.\n\n### 2. Monetization Strategy\n**Gap**: No clear information about the business model (freemium, subscription, one-time purchase).\n**Recommendation**: Define the monetization approach, pricing tiers if applicable, and what features will be free vs. premium.\n\n### 3. Offline Functionality\n**Gap**: No mention of how the app functions without internet connectivity.\n**Recommendation**: Specify which features work offline and how data synchronization occurs when connectivity is restored.\n\n### 4. User Support\n**Gap**: Missing details about customer support channels, help documentation, and training resources.\n**Recommendation**: Add a section detailing the support strategy, including in-app help, knowledge base, and support contact methods.\n\n### 5. Performance Requirements\n**Gap**: No specific performance benchmarks or requirements (load times, battery usage, etc.).\n**Recommendation**: Define key performance indicators and acceptable thresholds for resource usage.\n\n### 6. Testing Strategy\n**Gap**: No information about testing methodologies, beta testing plans, or quality assurance processes.\n**Recommendation**: Outline the testing approach, including user acceptance testing, beta program details, and QA procedures.\n\n### 7. Localization\n**Gap**: No mention of language support or regional adaptations.\n**Recommendation**: Specify initial language offerings and any region-specific adaptations needed for international markets.\n\n## Additional Considerations\n\n### Feature Priorities\nConsider adding priority levels to features to guide development if timeline constraints emerge.\n\n### Competitive Analysis\nA brief overview of competitive landscape and key differentiators would strengthen the document.\n\n### User Research Validation\nMention any user research that validates the proposed features and approach.\n\n## Conclusion\nOverall, the specification provides a solid foundation but would benefit from addressing the gaps identified above. The timeline seems ambitious, particularly for healthcare integration in Phase 3, so additional detail around technical implementation would be valuable.",
          annotations: [
            {
              type: "highlight",
              position: {
                section: "4. Technical Requirements",
                offset: 0,
                length: 25,
              },
              comment:
                "This section needs more specific performance requirements and compatibility details.",
            },
            {
              type: "highlight",
              position: { section: "4.2 Integrations", offset: 0, length: 21 },
              comment:
                "Need to specify which specific EHR systems will be supported initially.",
            },
            {
              type: "highlight",
              position: {
                section: "7. Development Timeline",
                offset: 0,
                length: 23,
              },
              comment:
                "Timeline seems aggressive for healthcare integrations - consider more detailed phasing.",
            },
          ],
          filename: "HealthTrack_Spec_Review.md",
          fileType: "text/markdown",
          pages: 1,
        },
      },
      {
        id: "msg-5",
        sender: "user",
        timestamp: new Date("2025-05-17T16:04:00"),
        content: {
          type: "text",
          data: "This review is very helpful! I completely missed including monetization details. Can you suggest a few potential monetization approaches that would work well for a health tracking app like this?",
        },
      },
      {
        id: "msg-6",
        sender: "ai",
        timestamp: new Date("2025-05-17T16:05:15"),
        thinking: [
          {
            step: "Researching options",
            content:
              "Identifying viable monetization strategies for health apps",
          },
          {
            step: "Evaluating fit",
            content:
              "Assessing which approaches align with HealthTrack's features and audience",
          },
          {
            step: "Considering ethics",
            content:
              "Balancing business needs with ethical health data considerations",
          },
        ],
        content: {
          type: "text",
          data: "I'm glad the review was helpful! Here are several monetization approaches that would work well for HealthTrack, along with their pros and cons:\n\n## Freemium Model with Premium Subscription\n\n**Basic Tier (Free):**\n- Basic health tracking (steps, heart rate, sleep)\n- Limited history (e.g., 30 days)\n- Basic insights and recommendations\n- Ad-supported experience\n\n**Premium Tier ($5.99-9.99/month):**\n- Advanced analytics and insights\n- Unlimited history and data export\n- Advanced recommendations with AI health coach\n- Priority healthcare provider connectivity\n- Ad-free experience\n\n**Pros:** Allows users to try core functionality before committing; recurring revenue stream; aligns with user expectations in health app market.\n\n**Cons:** Requires careful balance of free/paid features to drive conversions without limiting adoption.\n\n## Family Plan Option\n\nAdd a family plan ($14.99-19.99/month) that allows up to 5-6 family members to connect accounts, share relevant data, and coordinate care.\n\n**Pros:** Appeals to family decision-makers; increases stickiness through family connections; higher revenue per account.\n\n**Cons:** Requires additional privacy controls and family management features.\n\n## Healthcare Provider Partnerships\n\n**Provider Subscription Model:**\n- Free or basic tier for patients\n- Healthcare providers pay subscription for patient monitoring dashboard and integration capabilities\n- Potential for reimbursement through insurance for remote monitoring\n\n**Pros:** Aligns with healthcare trends toward remote monitoring; potential for larger B2B contracts; less price sensitivity from professional users.\n\n**Cons:** Longer sales cycles; may require regulatory certifications; integration complexity.\n\n## Data Insights (Ethical Approach)\n\nOffer anonymized, aggregated insights to research institutions or healthcare organizations while maintaining strict user privacy.\n\n**Pros:** Additional revenue stream without compromising user experience; contributes to healthcare research.\n\n**Cons:** Requires extremely careful implementation and transparent opt-in to maintain trust; regulatory considerations.\n\n## Recommendation for HealthTrack\n\nI would recommend a combined approach:\n\n1. **Primary: Freemium with subscription** - This provides a sustainable core revenue stream while allowing broad adoption\n\n2. **Secondary: Healthcare provider partnerships** - Align with Phase 3 healthcare integration to create B2B revenue opportunities\n\nThis dual approach enables both consumer adoption and professional integration while maintaining ethical standards around health data.",
        },
      },
      {
        id: "msg-7",
        sender: "user",
        timestamp: new Date("2025-05-17T16:06:30"),
        content: {
          type: "drawing",
          data: "/api/placeholder/600/400",
          caption: "Rough wireframe sketch of the HealthTrack dashboard",
          strokes: [
            // Simulated drawing strokes data
            {
              points: [
                [10, 10],
                [100, 10],
                [100, 100],
                [10, 100],
                [10, 10],
              ],
              color: "#000000",
              width: 2,
            },
            {
              points: [
                [25, 25],
                [85, 25],
                [85, 85],
                [25, 85],
                [25, 25],
              ],
              color: "#000000",
              width: 2,
            },
          ],
        },
      },
      {
        id: "msg-8",
        sender: "ai",
        timestamp: new Date("2025-05-17T16:07:45"),
        thinking: [
          {
            step: "Analyzing wireframe",
            content: "Examining dashboard layout and elements",
          },
          {
            step: "Identifying improvements",
            content: "Looking for UX enhancements and missing elements",
          },
        ],
        tools: [
          {
            name: "image-analyzer",
            execution: "Analyzing dashboard wireframe sketch",
            result:
              "Identified basic layout with potential for improved data visualization and user flow",
          },
        ],
        content: {
          type: "drawing",
          data: "/api/placeholder/800/600",
          caption: "Enhanced HealthTrack dashboard wireframe with annotations",
          annotations: [
            {
              position: { x: 120, y: 80 },
              text: "Consider adding a prominently placed daily goal progress indicator here",
            },
            {
              position: { x: 400, y: 150 },
              text: "Recommend data visualization showing weekly trends",
            },
            {
              position: { x: 650, y: 200 },
              text: "Quick access to logging tools (food, exercise, symptoms)",
            },
            {
              position: { x: 300, y: 350 },
              text: "Healthcare provider notifications and upcoming appointments",
            },
            {
              position: { x: 500, y: 450 },
              text: "Social connections and challenges (could be premium feature)",
            },
          ],
          strokes: [
            // Enhanced wireframe with more detailed elements
            {
              points: [
                [10, 10],
                [790, 10],
                [790, 590],
                [10, 590],
                [10, 10],
              ],
              color: "#000000",
              width: 2,
            },
            {
              points: [
                [10, 70],
                [790, 70],
              ],
              color: "#000000",
              width: 2,
            },
            {
              points: [
                [200, 70],
                [200, 590],
              ],
              color: "#000000",
              width: 2,
            },
            {
              points: [
                [30, 100],
                [180, 100],
              ],
              color: "#000000",
              width: 1.5,
            },
            {
              points: [
                [30, 130],
                [180, 130],
              ],
              color: "#000000",
              width: 1.5,
            },
            {
              points: [
                [30, 160],
                [180, 160],
              ],
              color: "#000000",
              width: 1.5,
            },
            {
              points: [
                [30, 190],
                [180, 190],
              ],
              color: "#000000",
              width: 1.5,
            },
            {
              points: [
                [30, 220],
                [180, 220],
              ],
              color: "#000000",
              width: 1.5,
            },
            {
              points: [
                [220, 90],
                [770, 90],
              ],
              color: "#000000",
              width: 1.5,
            },
            {
              points: [
                [220, 240],
                [770, 240],
              ],
              color: "#000000",
              width: 2,
            },
            {
              points: [
                [220, 270],
                [770, 270],
              ],
              color: "#000000",
              width: 1.5,
            },
            {
              points: [
                [220, 300],
                [770, 300],
              ],
              color: "#000000",
              width: 1.5,
            },
            {
              points: [
                [220, 330],
                [770, 330],
              ],
              color: "#000000",
              width: 1.5,
            },
            {
              points: [
                [220, 400],
                [770, 400],
              ],
              color: "#000000",
              width: 2,
            },
            {
              points: [
                [495, 400],
                [495, 590],
              ],
              color: "#000000",
              width: 2,
            },
          ],
        },
      },
      {
        id: "msg-9",
        sender: "ai",
        timestamp: new Date("2025-05-17T16:08:00"),
        content: {
          type: "text",
          data: "I've enhanced your wireframe sketch with a more detailed layout and suggestions for the HealthTrack dashboard. Here are the key improvements I've incorporated:\n\n1. **Information Architecture**\n   - Left sidebar for main navigation and quick access\n   - Main content area divided into logical sections\n   - Clear hierarchy of information with primary stats prominent\n\n2. **Key Components Added**\n   - Goal progress visualization (top center)\n   - Health metrics summary with trend indicators\n   - Weekly visualization chart for key metrics\n   - Quick-action logging tools for daily use\n   - Social and community section (bottom right)\n   - Healthcare provider communication area (bottom left)\n\n3. **Monetization Integration**\n   - Strategic placement of premium feature indicators\n   - Subtle premium upgrade prompts in relevant contexts\n   - Clear value demonstration for subscription features\n\n4. **UX Considerations**\n   - Progressive disclosure of complex data\n   - One-tap access to frequent actions\n   - Contextual insights placed near relevant metrics\n\nThis layout supports both your product requirements and the freemium monetization model we discussed. The dashboard balances providing immediate value to free users while showcasing the benefits of premium features.\n\nWould you like me to elaborate on any specific area of the wireframe?",
        },
      },
      {
        id: "msg-10",
        sender: "user",
        timestamp: new Date("2025-05-17T16:09:30"),
        content: {
          type: "text",
          data: "This is fantastic! I think we're making great progress. Could you update the product specification document to include the monetization strategy we discussed and any other improvements you've suggested?",
        },
      },
      {
        id: "msg-11",
        sender: "ai",
        timestamp: new Date("2025-05-17T16:11:00"),
        thinking: [
          {
            step: "Updating document",
            content:
              "Incorporating monetization strategy and other enhancements",
          },
          {
            step: "Maintaining consistency",
            content:
              "Ensuring additions align with existing document style and structure",
          },
          {
            step: "Improving clarity",
            content: "Addressing previously identified gaps",
          },
        ],
        content: {
          type: "document",
          data: "Product Specification: HealthTrack Mobile App\n\nVersion: 1.1\nDate: May 17, 2025\n\n1. Product Overview\nHealthTrack is a mobile application designed to help users monitor and improve their health by tracking various metrics, providing personalized recommendations, and connecting with healthcare providers.\n\n2. Target Audience\n- Health-conscious individuals aged 25-55\n- People managing chronic conditions\n- Fitness enthusiasts\n- Healthcare providers\n- Family health coordinators\n\n3. Key Features\n\n3.1 Health Metrics Tracking\n- Step counting\n- Heart rate monitoring\n- Sleep tracking\n- Nutrition logging\n- Medication reminders\n- Symptom tracking\n- Custom metric creation (Premium)\n\n3.2 User Dashboard\n- Daily, weekly, and monthly views\n- Progress towards goals\n- Health insights and trends\n- Priority health alerts\n- Advanced analytics and predictions (Premium)\n\n3.3 Social Features\n- Connect with friends\n- Join health challenges\n- Share achievements\n- Family account connections (Premium)\n- Community health forums (Premium)\n\n3.4 Healthcare Provider Integration\n- Share data with doctors\n- Telemedicine appointment scheduling\n- Secure messaging with healthcare team\n- Provider dashboard for patient monitoring (Provider Subscription)\n- Integration with clinical workflows (Provider Subscription)\n\n4. Technical Requirements\n\n4.1 Platforms\n- iOS (iPhone 12 and newer)\n- Android (version 10.0 and above)\n\n4.2 Integrations\n- Apple Health\n- Google Fit\n- Major fitness trackers (Fitbit, Garmin, etc.)\n- Electronic Health Record (EHR) systems\n  - Initial support: Epic, Cerner, Allscripts\n  - Phase 2: NextGen, Meditech, eClinicalWorks\n\n4.3 Data Security\n- HIPAA compliance\n- End-to-end encryption\n- User authentication\n- SOC 2 compliance\n- GDPR and CCPA compliance\n\n4.4 Performance Requirements\n- App launch time < 2 seconds\n- Data sync background operations < 5% battery impact\n- Offline functionality for core tracking features\n- Maximum storage requirement: 100MB (excluding user data)\n\n5. User Flow\n\n5.1 Onboarding\n- Account creation\n- Health profile setup\n- Connection to devices and services\n- Initial goal setting\n- Introduction to free vs. premium features\n\n5.2 Daily Use\n- Dashboard review\n- Metrics logging\n- Recommendation review\n- Premium feature discovery\n\n5.3 Offline Experience\n- Core tracking continues\n- Data stored locally\n- Sync upon reconnection\n- Graceful notification of limited functionality\n\n6. Design Guidelines\n\n6.1 Visual Style\n- Clean, medical aesthetic\n- Accessible color palette\n- Clear data visualizations\n- Premium features subtly distinguished\n\n6.2 Accessibility\n- Support for screen readers\n- Adjustable text sizes\n- Voice commands\n- High contrast mode\n\n7. Monetization Strategy\n\n7.1 Freemium Model\n- Basic Tier (Free)\n  - Core health tracking features\n  - Basic insights and recommendations\n  - 30-day history\n  - Limited healthcare provider sharing\n  - Ad-supported experience\n\n- Premium Tier ($7.99/month or $79.99/year)\n  - Advanced analytics and insights\n  - Unlimited history and data export\n  - AI health coach and personalized recommendations\n  - Priority healthcare provider connectivity\n  - Custom health metrics and tracking\n  - Ad-free experience\n\n- Family Plan ($19.99/month or $199.99/year)\n  - Premium features for up to 6 family members\n  - Family health coordination tools\n  - Family challenges and goals\n  - Caregiver monitoring features\n\n7.2 Healthcare Provider Model\n- Provider Dashboard Subscription ($199/month per provider)\n  - Patient population monitoring\n  - Custom alert configuration\n  - Integration with EHR systems\n  - Patient communication tools\n  - Outcome tracking and reporting\n\n7.3 Data Research Partnership (Opt-in)\n- Anonymized, aggregated data insights\n- Research partnership revenue sharing\n- Absolute user privacy and transparency\n- Clear user benefits for participation\n\n8. Development Timeline\n\nPhase 1 (June 2025)\n- Core tracking features\n- Basic dashboard\n- User accounts and profiles\n- Freemium foundation\n\nPhase 2 (August 2025)\n- Social features\n- Enhanced analytics\n- Premium subscription implementation\n- Initial healthcare provider features\n- Family plan beta\n\nPhase 3 (October 2025)\n- Full healthcare integration\n- Provider subscription launch\n- Advanced recommendations\n- Complete premium feature set\n\nPhase 4 (December 2025)\n- Research partnership platform\n- Advanced AI health coaching\n- International localization\n\n9. Success Metrics\n\n9.1 User Metrics\n- User acquisition: 100,000 users in first 3 months\n- Retention: 60% 30-day retention rate\n- Engagement: 5 app opens per week per user\n- Health outcomes: Improvement in user-reported health metrics\n\n9.2 Business Metrics\n- Conversion rate: 5% free to premium\n- Provider adoption: 500 healthcare providers in first 6 months\n- Annual recurring revenue: $2M by end of year 1\n\n10. Support and Operations\n\n10.1 User Support\n- In-app help center\n- Email support (24-hour response)\n- Live chat support (Premium users)\n- Community forums\n\n10.2 Updates and Maintenance\n- Bi-weekly feature updates\n- Monthly security patches\n- Quarterly major releases\n\n11. Localization\n\n- Initial launch: English (US, UK, CA, AU)\n- Phase 2: Spanish, French, German\n- Phase 3: Japanese, Chinese, Portuguese\n- Culturally appropriate health recommendations\n- Regional regulatory compliance\n\n12. Testing Strategy\n\n12.1 Internal Testing\n- Unit testing for all components\n- Integration testing for connected services\n- Performance testing for speed and battery usage\n\n12.2 External Testing\n- Closed beta with 500 users (2 weeks)\n- Open beta with 5,000 users (4 weeks)\n- Healthcare provider beta program\n- Accessibility compliance testing",
          filename: "HealthTrack_Product_Spec_v1.1.txt",
          fileType: "text/plain",
          changes: [
            {
              type: "addition",
              section: "2. Target Audience",
              content: "- Family health coordinators",
            },
            {
              type: "addition",
              section: "3. Key Features",
              content:
                "Multiple subsection enhancements with Premium features indicated",
            },
            {
              type: "addition",
              section: "4. Technical Requirements",
              content: "4.4 Performance Requirements section and EHR specifics",
            },
            {
              type: "addition",
              section: "7. Monetization Strategy",
              content: "Complete new section with freemium model details",
            },
            {
              type: "modification",
              section: "8. Development Timeline",
              content: "Added Phase 4 and monetization implementation details",
            },
            {
              type: "addition",
              section: "10-12",
              content: "New sections for Support, Localization, and Testing",
            },
          ],
          pages: 1,
        },
      },
      {
        id: "msg-12",
        sender: "ai",
        timestamp: new Date("2025-05-17T16:11:15"),
        content: {
          type: "text",
          data: "I've updated the product specification document to version 1.1 with comprehensive improvements based on our discussion:\n\n1. **Added Monetization Strategy (Section 7)**\n   - Detailed freemium model with specific pricing\n   - Family plan option\n   - Healthcare provider subscription model\n   - Ethical research partnership option\n\n2. **Expanded Technical Details**\n   - Added specific performance requirements\n   - Listed specific EHR systems for integration\n   - Enhanced security compliance information\n\n3. **Added Missing Sections**\n   - User Support and Operations (Section 10)\n   - Localization Strategy (Section 11)\n   - Testing Approach (Section 12)\n\n4. **Enhanced Feature Descriptions**\n   - Clearly marked Premium features\n   - Added offline experience details\n   - Expanded healthcare provider integration\n\n5. **Updated Business Metrics**\n   - Added conversion rate targets\n   - Included provider adoption goals\n   - Set revenue expectations\n\nThe document now addresses all the gaps identified in our review while maintaining consistency with the original structure and style. The monetization strategy is fully integrated throughout relevant sections to ensure a cohesive product vision.\n\nIs there anything specific you'd like me to explain or expand upon from these updates?",
        },
      },
    ],
  },

  {
    id: "conv-4",
    title: "Voice Interaction Design Session",
    description: "Designing voice interactions for a smart home assistant",
    messages: [
      {
        id: "msg-1",
        sender: "user",
        timestamp: new Date("2025-05-17T18:00:00"),
        content: {
          type: "text",
          data: "I'm working on designing voice interactions for a smart home system. Can you help me create a framework for handling different types of voice commands?",
        },
      },
      {
        id: "msg-2",
        sender: "ai",
        timestamp: new Date("2025-05-17T18:00:20"),
        content: {
          type: "text",
          data: "I'd be happy to help you create a framework for handling different types of voice commands in your smart home system. To start, let's identify the main categories of voice interactions we should account for and then design appropriate handling patterns for each. Could you tell me a bit more about the specific features and devices your smart home system will control?",
        },
      },
      {
        id: "msg-3",
        sender: "user",
        timestamp: new Date("2025-05-17T18:01:30"),
        content: {
          type: "audio",
          data: "/api/placeholder/audio",
          duration: 45,
          transcription:
            "Our system will control lighting, temperature, security cameras, door locks, entertainment systems like TV and music, and kitchen appliances. We want it to handle both direct commands and more conversational requests. Users should be able to create routines and scenes as well. The target audience is primarily families and working professionals who want convenience but might not be tech experts.",
        },
      },
      {
        id: "msg-4",
        sender: "ai",
        timestamp: new Date("2025-05-17T18:03:00"),
        content: {
          type: "diagram",
          diagramType: "flowchart",
          data: "graph TD\nUser[User Voice Input] --> Processing[Natural Language Processing]\nProcessing --> Intent[Intent Classification]\nIntent --> Direct[Direct Commands]\nIntent --> Conversational[Conversational Queries]\nIntent --> Routines[Routine Management]\nIntent --> Status[Status Requests]\nIntent --> Scenes[Scene Control]\n\nDirect --> CommandParser[Command Parser]\nCommandParser --> DeviceID[Device Identification]\nCommandParser --> ActionType[Action Type]\nCommandParser --> Parameters[Parameters]\n\nConversational --> ContextEngine[Context Engine]\nContextEngine --> EntityResolution[Entity Resolution]\nContextEngine --> UserPreferences[User Preferences]\nContextEngine --> ConversationHistory[Conversation History]\n\nRoutines --> RoutineManager[Routine Manager]\nRoutineManager --> RoutineCreate[Create]\nRoutineManager --> RoutineExecute[Execute]\nRoutineManager --> RoutineModify[Modify]\n\nStatus --> StatusManager[Status Manager]",
        },
      },
      {
        id: "msg-5",
        sender: "user",
        timestamp: new Date("2025-05-17T18:04:00"),
        content: {
          type: "text",
          data: "This flowchart looks great! Can you explain how the framework handles conversational commands versus direct commands?",
        },
      },
      {
        id: "msg-6",
        sender: "ai",
        timestamp: new Date("2025-05-17T18:05:30"),
        content: {
          type: "text",
          data: "Conversational commands rely on the Context Engine to interpret the user's intent, taking into account previous interactions and stored preferences. In contrast, direct commands are parsed more straightforwardly, mapping to specific devices and actions. This layered approach ensures both flexibility for natural interactions and efficiency for direct commands.",
        },
      },
      {
        id: "msg-7",
        sender: "user",
        timestamp: new Date("2025-05-17T18:06:15"),
        content: {
          type: "text",
          data: "That makes sense. How can we ensure the system recognizes user preferences correctly during conversational interactions?",
        },
      },
      {
        id: "msg-8",
        sender: "ai",
        timestamp: new Date("2025-05-17T18:07:00"),
        content: {
          type: "text",
          data: "We can implement a preference learning module that continuously updates based on user behavior and explicit settings. By storing user preferences as structured data, the Context Engine can reference them efficiently during each interaction.",
        },
      },
      {
        id: "msg-9",
        sender: "user",
        timestamp: new Date("2025-05-17T18:08:45"),
        content: {
          type: "text",
          data: "Sounds promising! Let's focus on integrating routine management with voice control next.",
        },
      },
      {
        id: "msg-10",
        sender: "ai",
        timestamp: new Date("2025-05-17T18:09:30"),
        content: {
          type: "text",
          data: "Great idea! We can leverage the Routine Manager to allow users to create, modify, and execute routines through voice commands. We'll ensure routines are dynamically adjusted based on context, like time of day or user location.",
        },
      },
    ],
  },
  {
    id: "conv-5",
    title: "Image Analysis and Enhancement",
    description: "Analyzing a scanned document and enhancing image quality",
    messages: [
      {
        id: "msg-1",
        sender: "user",
        timestamp: new Date("2025-05-17T19:00:00"),
        content: {
          type: "text",
          data: "I have a scanned document that's hard to read. Can you extract the text and improve the image quality?",
        },
      },
      {
        id: "msg-2",
        sender: "ai",
        timestamp: new Date("2025-05-17T19:00:20"),
        content: {
          type: "text",
          data: "Sure, please upload the scanned document, and I'll analyze it to extract the text and enhance the image quality.",
        },
      },
      {
        id: "msg-3",
        sender: "user",
        timestamp: new Date("2025-05-17T19:01:00"),
        content: {
          type: "image",
          data: "/api/placeholder/scanned-document",
          caption: "Scanned document with low contrast and blurred text.",
        },
      },
      {
        id: "msg-4",
        sender: "ai",
        timestamp: new Date("2025-05-17T19:02:00"),
        thinking: [
          {
            step: "Image Analysis",
            content: "Enhancing contrast and sharpness.",
          },
          {
            step: "Text Extraction",
            content: "Using OCR to extract text from the image.",
          },
        ],
        tools: [
          {
            name: "image-enhancer",
            execution: "Enhancing image quality",
            result: "Improved contrast and sharpness.",
          },
          {
            name: "ocr-extractor",
            execution: "Extracting text from image",
            result: "Text successfully extracted.",
          },
        ],
        content: {
          type: "text",
          data: "I've enhanced the image and extracted the text. Here’s the result:",
        },
      },
      {
        id: "msg-5",
        sender: "ai",
        timestamp: new Date("2025-05-17T19:02:30"),
        content: {
          type: "image",
          data: "/api/placeholder/enhanced-document",
          caption: "Enhanced document with improved readability.",
        },
      },
      {
        id: "msg-6",
        sender: "ai",
        timestamp: new Date("2025-05-17T19:02:45"),
        content: {
          type: "text",
          data: "Extracted Text: 'The quick brown fox jumps over the lazy dog. This is a sample text from the scanned document.'",
        },
      },
      {
        id: "msg-7",
        sender: "user",
        timestamp: new Date("2025-05-17T19:03:15"),
        content: {
          type: "text",
          data: "This is perfect! The text is clear now, and the image looks much better. Thank you!",
        },
      },
      {
        id: "msg-8",
        sender: "ai",
        timestamp: new Date("2025-05-17T19:03:30"),
        content: {
          type: "text",
          data: "You're welcome! Let me know if you need help with any more documents.",
        },
      },
    ],
  },
  {
    id: "conv-6",
    title: "Recipe Recommendation",
    description: "Suggesting recipes based on uploaded ingredient images",
    messages: [
      {
        id: "msg-1",
        sender: "user",
        timestamp: new Date("2025-05-17T20:00:00"),
        content: {
          type: "text",
          data: "I have some ingredients at home, but I'm not sure what to cook. Can you suggest a recipe?",
        },
      },
      {
        id: "msg-2",
        sender: "ai",
        timestamp: new Date("2025-05-17T20:00:20"),
        content: {
          type: "text",
          data: "Of course! Please upload a photo of the ingredients you have.",
        },
      },
      {
        id: "msg-3",
        sender: "user",
        timestamp: new Date("2025-05-17T20:01:00"),
        content: {
          type: "image",
          data: "/api/placeholder/ingredients",
          caption: "Ingredients on the kitchen counter.",
        },
      },
      {
        id: "msg-4",
        sender: "ai",
        timestamp: new Date("2025-05-17T20:01:45"),
        thinking: [
          {
            step: "Image Analysis",
            content: "Identifying ingredients from the image.",
          },
          {
            step: "Recipe Search",
            content: "Finding suitable recipes based on detected ingredients.",
          },
        ],
        tools: [
          {
            name: "image-recognition",
            execution: "Detecting ingredients",
            result: "Tomatoes, onions, pasta, garlic.",
          },
          {
            name: "recipe-suggester",
            execution: "Finding recipes",
            result: "Pasta Marinara, Tomato Soup, Garlic Bread.",
          },
        ],
        content: {
          type: "text",
          data: "Here are a few recipes you can make with your ingredients: Pasta Marinara, Tomato Soup, Garlic Bread. Which one would you like to try?",
        },
      },
      {
        id: "msg-5",
        sender: "user",
        timestamp: new Date("2025-05-17T20:02:15"),
        content: {
          type: "text",
          data: "Pasta Marinara sounds good! Could you give me some cooking tips?",
        },
      },
      {
        id: "msg-6",
        sender: "ai",
        timestamp: new Date("2025-05-17T20:02:45"),
        content: {
          type: "text",
          data: "Sure! Use fresh tomatoes for a richer flavor, sauté garlic and onions until golden, and add a pinch of sugar to balance acidity. Cook pasta al dente to avoid overcooking when mixed with sauce.",
        },
      },
      {
        id: "msg-7",
        sender: "user",
        timestamp: new Date("2025-05-17T20:03:10"),
        content: {
          type: "text",
          data: "Great tips, thanks! I'll start cooking.",
        },
      },
      {
        id: "msg-8",
        sender: "ai",
        timestamp: new Date("2025-05-17T20:03:30"),
        content: {
          type: "text",
          data: "Enjoy your meal! Let me know if you need help with any other recipes.",
        },
      },
    ],
  },
  {
    id: "conv-7",
    title: "Photo Enhancement",
    description:
      "Enhancing photo quality and making adjustments based on user requests",
    messages: [
      {
        id: "msg-1",
        sender: "user",
        timestamp: new Date("2025-05-17T21:00:00"),
        content: {
          type: "text",
          data: "I have a photo that's a bit dark and blurry. Can you enhance it?",
        },
      },
      {
        id: "msg-2",
        sender: "ai",
        timestamp: new Date("2025-05-17T21:00:20"),
        content: {
          type: "text",
          data: "Sure! Please upload the photo, and I'll enhance it for you.",
        },
      },
      {
        id: "msg-3",
        sender: "user",
        timestamp: new Date("2025-05-17T21:01:00"),
        content: {
          type: "image",
          data: "/api/placeholder/dark-blurry-photo",
          caption: "A dark and blurry photo of a cityscape.",
        },
      },
      {
        id: "msg-4",
        sender: "ai",
        timestamp: new Date("2025-05-17T21:01:45"),
        thinking: [
          {
            step: "Image Enhancement",
            content: "Improving brightness, contrast, and sharpness.",
          },
        ],
        tools: [
          {
            name: "photo-enhancer",
            execution: "Enhancing photo quality",
            result:
              "Increased brightness, adjusted contrast, and sharpened image.",
          },
        ],
        content: {
          type: "text",
          data: "Here’s the enhanced version of your photo!",
        },
      },
      {
        id: "msg-5",
        sender: "ai",
        timestamp: new Date("2025-05-17T21:02:15"),
        content: {
          type: "image",
          data: "/api/placeholder/enhanced-cityscape",
          caption:
            "Enhanced cityscape photo with improved brightness and sharpness.",
        },
      },
      {
        id: "msg-6",
        sender: "user",
        timestamp: new Date("2025-05-17T21:02:45"),
        content: {
          type: "text",
          data: "Looks much better! Can you increase the brightness just a bit more?",
        },
      },
      {
        id: "msg-7",
        sender: "ai",
        timestamp: new Date("2025-05-17T21:03:00"),
        content: {
          type: "text",
          data: "Sure! Let me make that adjustment.",
        },
      },
      {
        id: "msg-8",
        sender: "ai",
        timestamp: new Date("2025-05-17T21:03:30"),
        content: {
          type: "image",
          data: "/api/placeholder/brightened-cityscape",
          caption: "Cityscape photo with increased brightness.",
        },
      },
      {
        id: "msg-9",
        sender: "user",
        timestamp: new Date("2025-05-17T21:03:45"),
        content: {
          type: "text",
          data: "Perfect! Thanks for the quick fix.",
        },
      },
    ],
  },
  {
    id: "conv-8",
    title: "Travel Itinerary Generation",
    description: "Creating a travel itinerary based on user preferences",
    messages: [
      {
        id: "msg-1",
        sender: "user",
        timestamp: new Date("2025-05-17T22:00:00"),
        content: {
          type: "text",
          data: "I'm planning a 5-day trip to Paris and would like a day-by-day itinerary. Can you help?",
        },
      },
      {
        id: "msg-2",
        sender: "ai",
        timestamp: new Date("2025-05-17T22:00:20"),
        content: {
          type: "text",
          data: "Absolutely! Could you tell me your interests (e.g., museums, food, shopping, sightseeing)?",
        },
      },
      {
        id: "msg-3",
        sender: "user",
        timestamp: new Date("2025-05-17T22:01:00"),
        content: {
          type: "text",
          data: "I love art, history, and trying local food. Also, I'd like some leisure time to explore.",
        },
      },
      {
        id: "msg-4",
        sender: "ai",
        timestamp: new Date("2025-05-17T22:01:45"),
        thinking: [
          {
            step: "Itinerary Planning",
            content:
              "Creating a balanced schedule of sightseeing, cultural experiences, and leisure.",
          },
        ],
        content: {
          type: "text",
          data: `Here’s a suggested 5-day itinerary for Paris based on your interests:

Day 1: Arrival and Leisure
- Check into your hotel
- Evening walk around Montmartre
- Dinner at a local bistro

Day 2: Iconic Paris
- Morning: Eiffel Tower and Champ de Mars
- Afternoon: Louvre Museum
- Evening: Seine River Cruise

Day 3: Art and Culture
- Morning: Musée d'Orsay
- Afternoon: Le Marais art galleries
- Evening: Traditional French dinner

Day 4: History and Exploration
- Morning: Palace of Versailles
- Afternoon: Latin Quarter and Notre-Dame
- Evening: Explore local cafes

Day 5: Leisure and Shopping
- Morning: Montparnasse Tower view
- Afternoon: Shopping on Champs-Élysées
- Departure preparation`,
        },
      },
      {
        id: "msg-5",
        sender: "user",
        timestamp: new Date("2025-05-17T22:02:30"),
        content: {
          type: "text",
          data: "This looks amazing! Could you suggest a few food spots near the Eiffel Tower?",
        },
      },
      {
        id: "msg-6",
        sender: "ai",
        timestamp: new Date("2025-05-17T22:03:00"),
        content: {
          type: "text",
          data: `Sure! Here are a few great spots near the Eiffel Tower:
- Le Jules Verne (fine dining)
- Café de l'Homme (amazing views)
- La Fontaine de Mars (classic French bistro)`,
        },
      },
      {
        id: "msg-7",
        sender: "user",
        timestamp: new Date("2025-05-17T22:03:30"),
        content: {
          type: "text",
          data: "Perfect! Thanks for the recommendations!",
        },
      },
      {
        id: "msg-8",
        sender: "ai",
        timestamp: new Date("2025-05-17T22:03:45"),
        content: {
          type: "text",
          data: "You're welcome! Have a wonderful trip to Paris!",
        },
      },
    ],
  },
];

// Add a helper to get conversation by ID
export function getConversationById(id: string): Conversation | undefined {
  return mockConversations.find((conv) => conv.id === id);
}

// Add a default conversation for new chats
export const emptyConversation: Conversation = {
  id: "new-conversation",
  title: "New Conversation",
  description: "",
  messages: [],
};
