# Constants

This folder contains configuration constants and static data used throughout the LearningToPy application. These constants provide centralized management of UI elements, theming, settings configurations, and admin interface configurations.

## Overview

The constants folder serves as a centralized repository for all static configuration data, ensuring consistency across the application and making it easy to manage global settings, color schemes, and interface configurations without hardcoding values throughout the codebase.

## Files

### adminConstants.js
**Purpose**: Configuration constants for admin interface including menu items, status configurations, and analytics chart settings.

**Key Features**:
- Admin navigation menu configuration
- Flagged content status and issue type mappings
- Analytics chart types and color palettes
- Time range and grouping options for analytics
- Helper functions for configuration retrieval

**Exports**:
- `ADMIN_MENU_ITEMS` - Admin navigation menu with paths, labels, icons, and badges
- `FLAG_STATUS_CONFIG` - Status configuration for flagged content
- `ISSUE_TYPE_CONFIG` - Issue type configuration with icons and descriptions
- `getStatusConfig(status)` - Helper function to get status configuration
- `getIssueTypeConfig(issueType)` - Helper function to get issue type configuration
- `ANALYTICS_CHARTS` - Chart types for analytics dashboard
- `CHART_COLORS` - Color palette for charts
- `ANALYTICS_TIME_RANGES` - Time range options for filtering
- `ANALYTICS_GROUP_BY` - Grouping options for data aggregation

**Usage**:
```javascript
import { ADMIN_MENU_ITEMS, getStatusConfig } from '../../constants/adminConstants';

// Get admin menu items
const menuItems = ADMIN_MENU_ITEMS.filter(item => user.isAdmin);

// Get status configuration for flagged content
const statusConfig = getStatusConfig(flag.status);
```

---

### settingsConfigs.js
**Purpose**: Comprehensive settings configuration for admin settings panel with categorized settings and validation rules.

**Key Features**:
- Organized settings by categories (general, theme, gamification, features, security, advanced)
- Input type configurations with validation rules
- Descriptive labels and help text for each setting
- Tab configuration for settings panel interface

**Exports**:
- `SETTINGS_CONFIGS` - Complete settings configuration object
  - `general` - Basic platform settings (avatar size, difficulty, lessons per module)
  - `theme` - Theme and appearance settings (site theme, accent color, code theme)
  - `gamification` - XP and reward system settings
  - `features` - Feature toggles and platform capabilities
  - `security` - Security and authentication settings
  - `advanced` - Advanced technical configurations
- `ADMIN_TABS` - Tab configuration for settings panel

**Usage**:
```javascript
import { SETTINGS_CONFIGS, ADMIN_TABS } from '../../constants/settingsConfigs';

// Render settings for a specific category
const generalSettings = SETTINGS_CONFIGS.general;

// Render tabs in settings panel
ADMIN_TABS.map(tab => (
  <Tab key={tab.id} label={tab.label} icon={tab.icon} />
));
```

---

### themeConstants.js
**Purpose**: Theme constants for Python-themed color scheme and styling with progress-based theming support.

**Key Features**:
- Core Python brand colors using CSS custom properties
- Progress-based color palette mapped to completion percentages
- Hover color variants for interactive elements
- Route-based theming configuration
- Admin section identification

**Exports**:
- `PYTHON_BLUE`, `PYTHON_YELLOW`, `PYTHON_DARK`, `PYTHON_LIGHT` - Core theme colors
- `THEME_COLORS` - Progress-based color palette with percentage mappings
- `THEME_HOVER_COVERS` - Hover color variants
- `DEFAULT_THEME_PATHS` - Routes using default theming
- `ADMIN_PATH_PREFIX` - Admin route prefix for special styling

**Usage**:
```javascript
import { THEME_COLORS, DEFAULT_THEME_PATHS } from '../../constants/themeConstants';

// Get theme color based on user progress
const themeColor = THEME_COLORS[userProgressColor];

// Check if route should use default theming
const useDefaultTheme = DEFAULT_THEME_PATHS.includes(pathname);
```

---

### uiColors.js
**Purpose**: UI color mappings for consistent styling with dark mode support across the application.

**Key Features**:
- Tailwind CSS class combinations for consistent styling
- Dark mode variants for all color mappings
- Background and text color pairs
- Status indicator color schemes

**Exports**:
- `STAT_COLOR_MAP` - Color mappings for statistics and status indicators
  - `yellow`, `green`, `orange`, `purple`, `blue`, `indigo` - Color variants
  - Each color has `bg` and `text` properties with dark mode support

**Usage**:
```javascript
import { STAT_COLOR_MAP } from '../../constants/uiColors';

// Apply consistent styling to status indicators
const statusClasses = STAT_COLOR_MAP[statusColor];
<div className={`${statusClasses.bg} ${statusClasses.text}`}>
  Status indicator
</div>
```

## Integration and Dependencies

### File Relationships
```
Constants System
├── adminConstants.js (Admin interface configuration)
├── settingsConfigs.js (Settings panel configuration)
├── themeConstants.js (Theme and color management)
└── uiColors.js (UI styling consistency)
```

### External Dependencies
- **Lucide React**: Icons used in adminConstants.js for menu items and status indicators
- **CSS Custom Properties**: Theme colors defined in themeConstants.js reference CSS variables

### Internal Dependencies
- **Admin Components**: Use adminConstants.js for menu and status configurations
- **Settings Components**: Use settingsConfigs.js for dynamic form generation
- **Theme System**: Uses themeConstants.js for color management
- **UI Components**: Use uiColors.js for consistent styling

## Usage Patterns

### Admin Interface Configuration
```javascript
import { 
  ADMIN_MENU_ITEMS, 
  getStatusConfig, 
  getIssueTypeConfig 
} from '../constants/adminConstants';

// Render admin navigation
ADMIN_MENU_ITEMS.map(item => (
  <MenuItem key={item.path} {...item} />
));

// Get status styling for flagged content
const statusConfig = getStatusConfig(flag.status);
const issueConfig = getIssueTypeConfig(flag.issueType);
```

### Settings Panel Generation
```javascript
import { SETTINGS_CONFIGS, ADMIN_TABS } from '../constants/settingsConfigs';

// Dynamic settings form generation
Object.entries(SETTINGS_CONFIGS).map(([category, settings]) => (
  <SettingsTab key={category} category={category} settings={settings} />
));

// Tab navigation
ADMIN_TABS.map(tab => (
  <TabButton key={tab.id} {...tab} />
));
```

### Theme Application
```javascript
import { 
  THEME_COLORS, 
  PYTHON_BLUE, 
  DEFAULT_THEME_PATHS 
} from '../constants/themeConstants';

// Progress-based theming
const getThemeColor = (progress) => {
  if (progress < 25) return THEME_COLORS.RED;
  if (progress < 40) return THEME_COLORS.ORANGE;
  // ... more conditions
  return THEME_COLORS.GREEN;
};

// Default theming for specific routes
const useDefaultTheme = DEFAULT_THEME_PATHS.includes(location.pathname);
```

### Consistent UI Styling
```javascript
import { STAT_COLOR_MAP } from '../constants/uiColors';

// Status indicators with consistent styling
const StatusBadge = ({ status, color }) => {
  const classes = STAT_COLOR_MAP[color];
  return (
    <span className={`${classes.bg} ${classes.text} px-2 py-1 rounded`}>
      {status}
    </span>
  );
};
```

## Data Structure Examples

### Admin Menu Item Structure
```javascript
{
  path: "/admin/users",
  label: "User Management", 
  icon: Users,
  exact: false,
  badge: true,
  badgeCount: 5
}
```

### Settings Configuration Structure
```javascript
{
  key: "maxAvatarSize",
  label: "Max Avatar Size (MB)",
  type: "number",
  options: { min: 0.1, max: 10, step: 0.1 },
  description: "Maximum avatar image size"
}
```

### Status Configuration Structure
```javascript
{
  color: "yellow",
  icon: Clock,
  label: "Pending"
}
```

## Best Practices

### Organization
- **Logical Grouping**: Constants are organized by functionality and purpose
- **Clear Naming**: Descriptive names that indicate usage and scope
- **Consistent Structure**: Similar objects follow consistent property patterns

### Maintenance
- **Centralized Management**: All configuration in one place reduces duplication
- **Type Safety**: Clear object structures for better development experience
- **Documentation**: Comprehensive JSDoc comments for all exports

### Performance
- **Static Imports**: Constants are imported once and reused throughout
- **No Computation**: Values are static and don't require runtime calculation
- **Efficient Lookup**: Helper functions provide O(1) access to configurations

## Customization and Extension

### Adding New Admin Menu Items
```javascript
// Add to ADMIN_MENU_ITEMS array
{ 
  path: "/admin/reports", 
  label: "Reports", 
  icon: FileText,
  badge: true 
}
```

### Adding New Settings Categories
```javascript
// Add to SETTINGS_CONFIGS object
SETTINGS_CONFIGS.newCategory = [
  {
    key: "newSetting",
    label: "New Setting",
    type: "toggle",
    description: "Description of new setting"
  }
];
```

### Extending Theme Colors
```javascript
// Add to THEME_COLORS object
THEME_COLORS.CYAN = "#06b6d4";

// Add corresponding hover color
THEME_HOVER_COVERS.CYAN = "#059669";
```

### Adding New UI Color Mappings
```javascript
// Add to STAT_COLOR_MAP object
STAT_COLOR_MAP.cyan = {
  bg: "bg-cyan-100 dark:bg-cyan-900",
  text: "text-cyan-600 dark:text-cyan-400"
};
```

## Integration Examples

### Complete Admin Dashboard Setup
```javascript
import { 
  ADMIN_MENU_ITEMS, 
  ANALYTICS_CHARTS, 
  CHART_COLORS 
} from '../constants/adminConstants';

const AdminDashboard = () => {
  return (
    <div>
      <AdminSidebar menuItems={ADMIN_MENU_ITEMS} />
      <AnalyticsCharts 
        charts={ANALYTICS_CHARTS} 
        colors={CHART_COLORS} 
      />
    </div>
  );
};
```

### Dynamic Settings Form
```javascript
import { SETTINGS_CONFIGS, ADMIN_TABS } from '../constants/settingsConfigs';

const SettingsPanel = () => {
  const [activeTab, setActiveTab] = useState('general');
  
  return (
    <div>
      <TabNavigation 
        tabs={ADMIN_TABS} 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
      />
      <SettingsForm 
        settings={SETTINGS_CONFIGS[activeTab]} 
      />
    </div>
  );
};
```

### Theme-Aware Component
```javascript
import { 
  THEME_COLORS, 
  DEFAULT_THEME_PATHS,
  ADMIN_PATH_PREFIX 
} from '../constants/themeConstants';

const ThemedComponent = ({ userProgress, pathname }) => {
  const useDefaultTheme = DEFAULT_THEME_PATHS.includes(pathname);
  const isAdminRoute = pathname.startsWith(ADMIN_PATH_PREFIX);
  
  const getThemeColor = () => {
    if (useDefaultTheme || isAdminRoute) return PYTHON_BLUE;
    return THEME_COLORS[userProgress.color];
  };
  
  return (
    <div style={{ backgroundColor: getThemeColor() }}>
      Content
    </div>
  );
};
```

## Future Enhancements

### Potential Improvements
- **Environment-Specific Constants**: Different configurations for development/production
- **Dynamic Constants**: Server-side configuration that can be updated at runtime
- **Validation Schemas**: JSON schemas for constant structure validation
- **Type Definitions**: TypeScript definitions for better type safety

### Scalability
- **Modular Structure**: Easy to add new constant categories
- **Configuration Management**: Centralized control of application behavior
- **Theme System**: Flexible theming that can be extended for new color schemes
- **Internationalization**: Support for locale-specific configurations

This constants system provides a robust foundation for managing application configuration, ensuring consistency, maintainability, and scalability across the LearningToPy platform.
