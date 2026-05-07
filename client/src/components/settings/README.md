# Settings Components

This folder contains React components for managing user settings and preferences in the LearningToPy application. These components provide intuitive interfaces for users to configure their privacy, appearance, and platform preferences.

## Overview

The settings components form a comprehensive user preference management system, allowing users to customize their experience with privacy controls, theme options, and various platform settings. Each component is designed with accessibility, user experience, and consistent theming in mind.

## Components

### PrivacySettings.jsx
**Purpose**: Privacy settings form controlling leaderboard visibility and anonymity options.

**Key Features**:
- Leaderboard visibility toggle with nested username display options
- Interdependent settings with automatic state management
- Real-time preview of how user appears on leaderboards
- Theme-aware styling with responsive design
- Form validation and error handling
- Loading states and success/error messaging

**Props**:
- `user` - Current user object containing privacySettings
- `onUpdate` - Callback fired with updated settings after save

**Settings Managed**:
- `showOnLeaderboards` - Whether user appears in rankings
- `showAsAnonymous` - Whether to show as anonymous on leaderboards
- `showUsernameOnLeaderboards` - Whether to display username publicly

**Usage**:
```jsx
import { PrivacySettings } from '../components/settings';

const UserProfile = ({ user, onSettingsUpdate }) => {
  return (
    <div>
      <h2>Privacy Settings</h2>
      <PrivacySettings 
        user={user} 
        onUpdate={onSettingsUpdate}
      />
    </div>
  );
};
```

---

## Integration and Dependencies

### Component Hierarchy
```
Settings System
└── PrivacySettings (Privacy and leaderboard controls)
```

### External Dependencies
- **React**: Component framework and hooks (useState, useEffect)
- **Lucide React**: Icons for UI elements (Shield, Eye, EyeOff, User)
- **API Client**: For saving settings to backend

### Internal Dependencies
- **useThemeStyles**: Hook for theme-aware styling
- **getErrorMessage/getSuccessMessage**: Utility functions for messaging
- **Privacy Settings API**: Backend endpoint for saving preferences

### Data Flow
- **User Data**: Current user object with existing privacy settings
- **Settings State**: Local form state with validation
- **API Integration**: PATCH requests to update user preferences
- **Callback Pattern**: Parent component receives updated settings

## Usage Examples

### Complete Settings Page Setup
```jsx
import { PrivacySettings } from '../components/settings';
import { useState, useEffect } from 'react';
import { apiClient } from '../services';

const SettingsPage = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await apiClient.get('/auth/me');
        setUser(userData);
      } catch (error) {
        console.error('Failed to fetch user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const handleSettingsUpdate = (updatedSettings) => {
    setUser(prev => ({
      ...prev,
      privacySettings: updatedSettings
    }));
  };

  if (loading) return <div>Loading settings...</div>;
  if (!user) return <div>Error loading settings</div>;

  return (
    <div className="settings-page">
      <h1>Settings</h1>
      <PrivacySettings 
        user={user} 
        onUpdate={handleSettingsUpdate}
      />
    </div>
  );
};
```

### Integration with User Profile
```jsx
import { PrivacySettings } from '../components/settings';

const UserProfile = ({ userId }) => {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('profile');

  const handlePrivacyUpdate = (privacySettings) => {
    setUser(prev => ({
      ...prev,
      privacySettings
    }));
  };

  return (
    <div className="user-profile">
      <div className="profile-tabs">
        <button onClick={() => setActiveTab('profile')}>
          Profile
        </button>
        <button onClick={() => setActiveTab('settings')}>
          Settings
        </button>
      </div>

      {activeTab === 'settings' && (
        <PrivacySettings 
          user={user} 
          onUpdate={handlePrivacyUpdate}
        />
      )}
    </div>
  );
};
```

### Settings with Validation
```jsx
import { PrivacySettings } from '../components/settings';

const SettingsWithValidation = () => {
  const [validationErrors, setValidationErrors] = useState({});
  const [user, setUser] = useState(mockUser);

  const handleSettingsUpdate = (updatedSettings) => {
    // Custom validation logic
    const errors = validateSettings(updatedSettings);
    
    if (Object.keys(errors).length === 0) {
      setUser(prev => ({
        ...prev,
        privacySettings: updatedSettings
      }));
      setValidationErrors({});
    } else {
      setValidationErrors(errors);
    }
  };

  const validateSettings = (settings) => {
    const errors = {};
    
    // Example validation
    if (settings.showUsernameOnLeaderboards && !settings.showOnLeaderboards) {
      errors.username = 'Cannot show username when not on leaderboards';
    }
    
    return errors;
  };

  return (
    <div>
      {Object.keys(validationErrors).length > 0 && (
        <div className="validation-errors">
          {Object.values(validationErrors).map((error, index) => (
            <div key={index} className="error-message">
              {error}
            </div>
          ))}
        </div>
      )}
      
      <PrivacySettings 
        user={user} 
        onUpdate={handleSettingsUpdate}
      />
    </div>
  );
};
```

## Data Structure Examples

### User Privacy Settings Object
```javascript
{
  _id: "60f1b2c3d4e5f6789012345",
  username: "pythonlearner",
  privacySettings: {
    showOnLeaderboards: true,
    showAsAnonymous: false,
    showUsernameOnLeaderboards: true
  }
}
```

### Settings Update Payload
```javascript
{
  showOnLeaderboards: false,
  showAsAnonymous: true,
  showUsernameOnLeaderboards: false
}
```

### API Response Structure
```javascript
{
  success: true,
  privacySettings: {
    showOnLeaderboards: false,
    showAsAnonymous: true,
    showUsernameOnLeaderboards: false
  }
}
```

## Styling and Design

### Design System
- **Color Palette**: Theme-aware colors with dark mode support
- **Typography**: System fonts with responsive sizing
- **Spacing**: Tailwind utilities for consistent spacing
- **Layout**: Card-based layout with clear visual hierarchy

### Visual Elements
- **Toggle Switches**: Custom-styled switches with theme colors
- **Preview Components**: Live preview of settings changes
- **Status Indicators**: Visual feedback for setting states
- **Interactive Elements**: Hover states and transitions

### Responsive Design
- **Mobile**: Optimized layout with touch-friendly controls
- **Tablet**: Adaptive spacing and sizing
- **Desktop**: Full-featured layout with optimal dimensions

## Accessibility

### Features
- **Semantic HTML**: Proper form structure and labeling
- **Keyboard Navigation**: Full keyboard accessibility for all controls
- **Screen Reader Support**: ARIA labels and descriptions
- **Focus Management**: Logical tab order and focus indicators

### Considerations
- **Toggle Controls**: Accessible toggle switches with proper labels
- **Form Validation**: Clear error messages and instructions
- **Visual Feedback**: High contrast colors and clear indicators
- **Touch Targets**: Appropriate sizing for touch interfaces

## Performance Considerations

### Optimizations
- **State Management**: Efficient local state with minimal re-renders
- **API Calls**: Debounced saves and proper error handling
- **Conditional Rendering**: Efficient rendering of preview components
- **Event Handling**: Optimized event handlers with proper cleanup

### Best Practices
- **Memoization**: Use React.memo for expensive computations
- **Lazy Loading**: Load settings data only when needed
- **Error Boundaries**: Handle API errors gracefully
- **Loading States**: Provide feedback during async operations

## Customization and Theming

### Theme Integration
- **Dynamic Colors**: Theme-aware styling with CSS custom properties
- **Dark Mode**: Full dark mode support with proper contrast
- **Responsive Colors**: Adaptive colors based on user preferences
- **Brand Consistency**: Consistent with platform design system

### Customization Options
- **Layout Variants**: Different layout options for different contexts
- **Control Styles**: Customizable toggle and control styling
- **Animation**: Smooth transitions and micro-interactions
- **Localization**: Support for different languages and regions

## Advanced Features

### Interactive Elements
- **Live Preview**: Real-time preview of setting changes
- **Validation**: Client-side validation with clear error messages
- **Auto-save**: Optional auto-save functionality
- **Reset Options**: Ability to reset to default settings

### State Management
- **Optimistic Updates**: Immediate UI updates with server sync
- **Conflict Resolution**: Handle concurrent setting changes
- **Offline Support**: Basic offline functionality with sync
- **History**: Track setting changes over time

## Testing

### Component Testing
```jsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PrivacySettings } from '../PrivacySettings';
import { apiClient } from '../../../services';

jest.mock('../../../services');

const mockUser = {
  _id: '123',
  username: 'testuser',
  privacySettings: {
    showOnLeaderboards: true,
    showAsAnonymous: false,
    showUsernameOnLeaderboards: true
  }
};

describe('PrivacySettings', () => {
  it('renders with initial settings', () => {
    render(<PrivacySettings user={mockUser} onUpdate={jest.fn()} />);
    
    expect(screen.getByText('Privacy Settings')).toBeInTheDocument();
    expect(screen.getByText('Show on Leaderboards')).toBeInTheDocument();
  });

  it('toggles leaderboard visibility', async () => {
    const onUpdate = jest.fn();
    apiClient.patch.mockResolvedValue({ 
      privacySettings: { showOnLeaderboards: false }
    });

    render(<PrivacySettings user={mockUser} onUpdate={onUpdate} />);
    
    const toggle = screen.getByRole('checkbox', { name: /show on leaderboards/i });
    fireEvent.click(toggle);

    await waitFor(() => {
      expect(apiClient.patch).toHaveBeenCalledWith('/auth/privacy-settings', {
        showOnLeaderboards: false,
        showAsAnonymous: true,
        showUsernameOnLeaderboards: false
      });
    });
  });

  it('shows success message on save', async () => {
    apiClient.patch.mockResolvedValue({ 
      privacySettings: mockUser.privacySettings
    });

    render(<PrivacySettings user={mockUser} onUpdate={jest.fn()} />);
    
    const saveButton = screen.getByText('Save Settings');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText(/privacy settings updated/i)).toBeInTheDocument();
    });
  });
});
```

### Integration Testing
```jsx
import { render, screen } from '@testing-library/react';
import { PrivacySettings } from '../PrivacySettings';
import { ThemeProvider } from '../../../context/ThemeContext';

const renderWithTheme = (component) => {
  return render(
    <ThemeProvider>
      {component}
    </ThemeProvider>
  );
};

describe('PrivacySettings Integration', () => {
  it('integrates with theme system', () => {
    renderWithTheme(<PrivacySettings user={mockUser} onUpdate={jest.fn()} />);
    
    // Test theme-aware styling
    expect(screen.getByText('Privacy Settings')).toHaveClass('text-gray-900');
  });
});
```

## Future Enhancements

### Potential Improvements
- **Additional Settings**: More privacy and preference options
- **Settings Categories**: Organized settings in different categories
- **Import/Export**: Settings import/export functionality
- **Advanced Privacy**: More granular privacy controls
- **Analytics**: User settings usage analytics

### Scalability
- **Component Composition**: Easy to add new setting types
- **Form Validation**: Extensible validation system
- **API Integration**: Flexible API integration patterns
- **Testing**: Comprehensive test coverage

## Component Exports

The settings components are exported through the index.js file for easy importing:

```javascript
export { default as PrivacySettings } from "./PrivacySettings";
```

## Integration Examples

### Complete User Settings System
```jsx
import { PrivacySettings } from '../components/settings';

const UserSettingsSystem = ({ userId }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('privacy');

  const sections = [
    { id: 'privacy', label: 'Privacy', component: PrivacySettings },
    // Add more sections as they're created
  ];

  const ActiveComponent = sections.find(s => s.id === activeSection)?.component;

  return (
    <div className="settings-system">
      <div className="settings-navigation">
        {sections.map(section => (
          <button
            key={section.id}
            onClick={() => setActiveSection(section.id)}
            className={activeSection === section.id ? 'active' : ''}
          >
            {section.label}
          </button>
        ))}
      </div>

      <div className="settings-content">
        {ActiveComponent && (
          <ActiveComponent 
            user={user} 
            onUpdate={(settings) => {
              setUser(prev => ({
                ...prev,
                privacySettings: settings
              }));
            }}
          />
        )}
      </div>
    </div>
  );
};
```

### Settings with Analytics
```jsx
import { PrivacySettings } from '../components/settings';
import { useAnalytics } from '../hooks/useAnalytics';

const TrackedSettings = ({ user }) => {
  const { trackEvent } = useAnalytics();

  const handleSettingsUpdate = (updatedSettings) => {
    // Track settings changes
    trackEvent('settings_updated', {
      category: 'privacy',
      changes: Object.keys(updatedSettings).filter(key => 
        updatedSettings[key] !== user.privacySettings[key]
      )
    });

    // Update user state
    setUser(prev => ({
      ...prev,
      privacySettings: updatedSettings
    }));
  };

  return (
    <PrivacySettings 
      user={user} 
      onUpdate={handleSettingsUpdate}
    />
  );
};
```

This settings component system provides a robust foundation for managing user preferences in the LearningToPy application, with a focus on privacy controls, user experience, and extensibility for future setting categories.
