# Chart Components

This folder contains React components for data visualization using Recharts library. These components provide responsive, interactive charts for displaying analytics, user activity, device usage, and growth metrics with consistent styling and theming.

## Overview

The chart components form a complete data visualization system built on top of Recharts, providing standardized charts for the LearningToPy platform. Each component is designed with responsive design, accessibility, and consistent theming while maintaining flexibility for different data visualization needs.

## Components

### ActivityChart.jsx
**Purpose**: Line chart component displaying user activity metrics over time.

**Key Features**:
- Multi-line visualization for activity metrics
- Interactive tooltips with custom formatting
- Responsive design with debounced rendering
- Legend support with configurable styling
- Data validation and error handling
- Grid lines and axis customization

**Props**:
- `data`: Array of activity data points
  - `date`: Date identifier for the data point
  - `activeUsers`: Number of active users on that date
  - `lessonsCompleted`: Number of lessons completed on that date
  - `xpEarned`: Amount of XP earned on that date

**Usage**:
```jsx
<ActivityChart 
  data={[
    {
      date: "2024-01-01",
      activeUsers: 1250,
      lessonsCompleted: 85,
      xpEarned: 2500
    }
  ]}
/>
```

---

### CustomTooltip.jsx
**Purpose**: Custom tooltip component for Recharts with formatted data display.

**Key Features**:
- Styled tooltip with dark mode support
- Color-coded data values
- Number formatting with locale support
- Conditional rendering based on active state
- Responsive design with proper spacing

**Props**:
- `active`: Whether tooltip should be displayed
- `payload`: Array of data entries to display
  - `name`: Name of the data entry
  - `value`: Value of the data entry
  - `color`: Color for the data entry
- `label`: Label to display in tooltip header

**Usage**:
```jsx
<Tooltip content={<CustomTooltip />} />
```

---

### DevicesChart.jsx
**Purpose**: Pie chart component displaying device usage distribution with percentage labels.

**Key Features**:
- Pie chart with percentage labels on segments
- Color-coded device categories
- Responsive legend layout (mobile/desktop)
- Custom label positioning and formatting
- Data validation and filtering
- Mobile-optimized legend positioning

**Props**:
- `data`: Array of device usage data
  - `device`: Device type name (e.g., "Desktop", "Mobile")
  - `percentage`: Percentage of usage for this device type

**Usage**:
```jsx
<DevicesChart 
  data={[
    {
      device: "Desktop",
      percentage: 65.5
    },
    {
      device: "Mobile", 
      percentage: 34.5
    }
  ]}
/>
```

---

### GrowthChart.jsx
**Purpose**: Area chart component displaying user growth metrics over time.

**Key Features**:
- Filled area visualization for growth metrics
- Multiple area layers for different metrics
- Gradient fills with transparency
- Responsive design with debounced rendering
- Grid lines and axis configuration
- Data validation and error handling

**Props**:
- `data`: Array of growth data points
  - `_id`: Date identifier for the data point
  - `newUsers`: Number of new users on that date
  - `cumulativeUsers`: Total cumulative users up to that date

**Usage**:
```jsx
<GrowthChart 
  data={[
    {
      _id: "2024-01-01",
      newUsers: 45,
      cumulativeUsers: 1250
    }
  ]}
/>
```

---

## Integration and Dependencies

### Component Hierarchy
```
Charts System
├── ActivityChart (Line chart with multi-line support)
├── DevicesChart (Pie chart with percentage labels)
├── GrowthChart (Area chart with filled visualization)
└── CustomTooltip (Shared tooltip component)
```

### External Dependencies
- **React**: Component framework and hooks
- **Recharts**: Chart library for data visualization
  - LineChart, Line, XAxis, YAxis
  - AreaChart, Area
  - PieChart, Pie, Cell
  - CartesianGrid, Tooltip, Legend
  - ResponsiveContainer

### Internal Dependencies
- **CHART_COLORS**: Color constants from adminConstants
- **CustomTooltip**: Shared tooltip component used across charts

### Data Flow
- **Activity Data**: Time-series data for user activity metrics
- **Device Data**: Distribution data for device usage analytics
- **Growth Data**: Time-series data for user growth metrics
- **Tooltip Data**: Interactive data for hover states

## Styling and Design

### Design System
- **Color Palette**: Consistent with CHART_COLORS constants
- **Typography**: System fonts with responsive sizing
- **Spacing**: Tailwind utilities for consistent spacing
- **Layout**: Responsive containers with debounced rendering

### Visual Elements
- **Grid Lines**: Subtle grid with configurable opacity
- **Axes**: Customized stroke colors and tick formatting
- **Legends**: Responsive positioning and sizing
- **Tooltips**: Custom styled with dark mode support

### Responsive Design
- **Mobile**: Optimized layouts with adjusted legend positioning
- **Tablet**: Adaptive sizing and spacing
- **Desktop**: Full-featured layouts with optimal dimensions

## Usage Examples

### Complete Analytics Dashboard Setup
```jsx
import { 
  ActivityChart, 
  DevicesChart, 
  GrowthChart 
} from './components/charts';

const AnalyticsDashboard = ({ analyticsData }) => {
  return (
    <div className="space-y-6">
      {/* Activity Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-medium mb-4">User Activity</h3>
        <ActivityChart data={analyticsData.activity} />
      </div>
      
      {/* Growth Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-medium mb-4">User Growth</h3>
        <GrowthChart data={analyticsData.growth} />
      </div>
      
      {/* Device Distribution */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-medium mb-4">Device Usage</h3>
        <DevicesChart data={analyticsData.devices} />
      </div>
    </div>
  );
};
```

### Individual Chart Usage
```jsx
// Activity Chart Only
<ActivityChart data={activityData} />

// Device Distribution with Custom Styling
<div className="h-96">
  <DevicesChart data={deviceData} />
</div>

// Growth Chart with Error Handling
<GrowthChart data={growthData || []} />
```

### Custom Tooltip Integration
```jsx
import { CustomTooltip } from './components/charts';

const CustomChart = () => {
  return (
    <LineChart data={data}>
      <Line dataKey="value" stroke="#3B82F6" />
      <Tooltip content={<CustomTooltip />} />
    </LineChart>
  );
};
```

## Data Structure Examples

### Activity Data Array
```javascript
const activityData = [
  {
    date: "2024-01-01",
    activeUsers: 1250,
    lessonsCompleted: 85,
    xpEarned: 2500
  },
  {
    date: "2024-01-02",
    activeUsers: 1180,
    lessonsCompleted: 92,
    xpEarned: 2750
  }
];
```

### Device Data Array
```javascript
const deviceData = [
  {
    device: "Desktop",
    percentage: 65.5
  },
  {
    device: "Mobile",
    percentage: 28.3
  },
  {
    device: "Tablet",
    percentage: 6.2
  }
];
```

### Growth Data Array
```javascript
const growthData = [
  {
    _id: "2024-01-01",
    newUsers: 45,
    cumulativeUsers: 1250
  },
  {
    _id: "2024-01-02",
    newUsers: 38,
    cumulativeUsers: 1288
  }
];
```

## Performance Considerations

### Optimizations
- **Debounced Rendering**: ResponsiveContainer with 50ms debounce
- **Data Validation**: Efficient filtering of invalid data points
- **Conditional Rendering**: Early returns for empty/invalid data
- **Memoized Components**: CustomTooltip optimized for performance

### Best Practices
- **Data Validation**: Always validate data structure before rendering
- **Error Boundaries**: Handle chart rendering errors gracefully
- **Loading States**: Provide appropriate empty states
- **Responsive Design**: Use proper container sizing

## Accessibility

### Features
- **Semantic HTML**: Proper chart structure and labeling
- **Color Contrast**: WCAG compliant color combinations
- **Keyboard Navigation**: Accessible chart interactions
- **Screen Reader Support**: Proper ARIA labels and descriptions

### Considerations
- **Chart Labels**: Clear and descriptive axis labels
- **Color Alternatives**: Not relying solely on color for data distinction
- **Tooltip Accessibility**: Keyboard-accessible tooltips
- **Focus Management**: Logical tab order for interactive elements

## Customization and Theming

### Color Customization
- **Chart Colors**: Configurable through CHART_COLORS constants
- **Stroke Colors**: Customizable stroke colors for lines and areas
- **Fill Colors**: Configurable fill colors with transparency
- **Grid Colors**: Adjustable grid line colors and opacity

### Layout Customization
- **Chart Dimensions**: Responsive sizing with fixed heights
- **Margins**: Configurable chart margins and padding
- **Legend Position**: Responsive legend positioning
- **Tooltip Styling**: Customizable tooltip appearance

### Data Customization
- **Data Keys**: Flexible data key mapping
- **Date Formatting**: Configurable date display formats
- **Number Formatting**: Locale-aware number formatting
- **Label Positioning**: Customizable label positioning

## Advanced Features

### Interactive Elements
- **Hover States**: Interactive tooltips with data details
- **Click Handlers**: Configurable click interactions
- **Zoom Support**: Built-in zoom capabilities (if needed)
- **Animation**: Smooth transitions and animations

### Data Processing
- **Data Filtering**: Automatic filtering of invalid data
- **Data Aggregation**: Support for aggregated data display
- **Real-time Updates**: Support for live data updates
- **Data Transformation**: Flexible data transformation hooks

## Future Enhancements

### Potential Improvements
- **Chart Types**: Additional chart types (bar, scatter, etc.)
- **Advanced Tooltips**: Enhanced tooltip customization
- **Export Functionality**: Chart export capabilities
- **Real-time Data**: WebSocket integration for live updates
- **Custom Animations**: Advanced animation controls

### Scalability
- **Component Composition**: Modular design for easy extension
- **Plugin System**: Support for custom chart plugins
- **Theme Integration**: Enhanced theming system
- **Performance Monitoring**: Built-in performance metrics

## Component Exports

The chart components are exported through the index.js file for easy importing:

```javascript
export { ActivityChart } from "./ActivityChart";
export { CustomTooltip } from "./CustomTooltip";
export { DevicesChart } from "./DevicesChart";
export { GrowthChart } from "./GrowthChart";
```

## Integration Examples

### With Analytics Dashboard
```jsx
import { ActivityChart, DevicesChart, GrowthChart } from './components/charts';

const AnalyticsDashboard = () => {
  const [chartData, setChartData] = useState(null);
  
  useEffect(() => {
    fetchAnalyticsData().then(setChartData);
  }, []);
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <ActivityChart data={chartData?.activity} />
      <GrowthChart data={chartData?.growth} />
      <DevicesChart data={chartData?.devices} />
    </div>
  );
};
```

### With Custom Data Processing
```jsx
import { ActivityChart } from './components/charts';

const CustomActivityChart = ({ rawData }) => {
  const processedData = useMemo(() => {
    return rawData.map(item => ({
      ...item,
      date: new Date(item.timestamp).toLocaleDateString(),
      activeUsers: item.users.filter(u => u.isActive).length
    }));
  }, [rawData]);
  
  return <ActivityChart data={processedData} />;
};
```

### With Error Boundaries
```jsx
import { ErrorBoundary } from 'react-error-boundary';
import { DevicesChart } from './components/charts';

const SafeChart = ({ data }) => {
  return (
    <ErrorBoundary
      fallback={<div>Chart failed to load</div>}
    >
      <DevicesChart data={data} />
    </ErrorBoundary>
  );
};
```

## Troubleshooting

### Common Issues
- **Empty Data**: Components handle empty data gracefully with appropriate messages
- **Invalid Data**: Automatic filtering of invalid data points
- **Responsive Issues**: Use proper container sizing and ResponsiveContainer
- **Performance Issues**: Implement data pagination or aggregation for large datasets

### Debug Tips
- **Console Logging**: Check data structure before passing to components
- **React DevTools**: Inspect component props and state
- **Network Tab**: Verify data fetching and API responses
- **Performance Tab**: Monitor rendering performance for large datasets

This modular architecture ensures maintainability, scalability, and consistency across the platform's chart system while providing comprehensive data visualization tools for monitoring user activity, growth, and device usage patterns.
