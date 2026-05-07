# Store

This folder contains Zustand stores for managing global application state. The store system provides a lightweight, performant solution for state management without the complexity of Redux or other heavy state management libraries.

## Overview

The store system uses Zustand to manage global state across the LearningToPy application. Each store is focused on a specific domain (e.g., modal management) and provides a simple, intuitive API for state access and updates.

## Files

### useModalStore.js
**Purpose**: Zustand store for managing modal state across the application.

**Key Features**:
- Global modal state management
- Simple API for opening/closing any modal by name
- Support for passing data to modals
- Type-safe state management with clear interfaces
- Minimal re-renders with Zustand's optimized subscriptions

**State Structure**:
- `type` - Current modal identifier (e.g., "xpModal", "userDetail")
- `data` - Props/data to pass to the modal
- `isOpen` - Whether modal is currently visible

**Actions**:
- `openModal(type, data)` - Opens a modal with optional data
- `closeModal()` - Closes the current modal and resets state

**Usage**:
```javascript
import { useModalStore } from '../store/useModalStore';

// In a component
const { openModal, closeModal, isOpen, type, data } = useModalStore();

// Open a modal with data
const handleOpenXPModal = () => {
  openModal("xpAdjustment", { userId: "123", currentXP: 500 });
};

// Close the modal
const handleCloseModal = () => {
  closeModal();
};
```

## Integration and Dependencies

### External Dependencies
- **Zustand**: Lightweight state management library
  - Provides create() function for store creation
  - Optimized subscriptions and minimal re-renders
  - TypeScript support for type safety

### Internal Dependencies
- **Modal Components**: Store works with modal components in the modals folder
- **UI Components**: Integrates with modal UI components for display

## Usage Patterns

### Basic Modal Management
```javascript
import { useModalStore } from '../store/useModalStore';

const ModalManager = () => {
  const { openModal, closeModal, isOpen, type, data } = useModalStore();

  // Open different types of modals
  const openUserDetail = (userId) => {
    openModal("userDetail", { userId });
  };

  const openXPAdjustment = (user) => {
    openModal("xpAdjustment", { 
      userId: user._id, 
      currentXP: user.xp,
      maxAdjustment: 1000
    });
  };

  // Close modal
  const closeCurrentModal = () => {
    closeModal();
  };

  return (
    <div>
      <button onClick={() => openUserDetail("123")}>
        View User Details
      </button>
      <button onClick={() => openXPAdjustment(mockUser)}>
        Adjust XP
      </button>
      {isOpen && (
        <button onClick={closeCurrentModal}>
          Close Modal
        </button>
      )}
    </div>
  );
};
```

### Modal Component Integration
```javascript
import { useModalStore } from '../store/useModalStore';
import UserDetailModal from '../modals/UserDetailModal';
import XPAdjustmentModal from '../modals/XPAdjustmentModal';

const ModalRenderer = () => {
  const { isOpen, type, data } = useModalStore();

  if (!isOpen) return null;

  const renderModal = () => {
    switch (type) {
      case "userDetail":
        return <UserDetailModal userId={data.userId} />;
      case "xpAdjustment":
        return (
          <XPAdjustmentModal 
            userId={data.userId}
            currentXP={data.currentXP}
            maxAdjustment={data.maxAdjustment}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="modal-overlay">
      {renderModal()}
    </div>
  );
};
```

### Advanced Usage with Custom Hooks
```javascript
import { useModalStore } from '../store/useModalStore';
import { useCallback } from 'react';

// Custom hook for specific modal types
const useUserModal = () => {
  const { openModal, closeModal } = useModalStore();

  const openUserModal = useCallback((userId) => {
    openModal("userDetail", { userId });
  }, [openModal]);

  const closeUserModal = useCallback(() => {
    closeModal();
  }, [closeModal]);

  return { openUserModal, closeUserModal };
};

// Usage in component
const UserManagementTable = () => {
  const { openUserModal } = useUserModal();

  return (
    <table>
      {users.map(user => (
        <tr key={user._id}>
          <td>{user.username}</td>
          <td>
            <button onClick={() => openUserModal(user._id)}>
              View Details
            </button>
          </td>
        </tr>
      ))}
    </table>
  );
};
```

## Best Practices

### Store Design
- **Single Responsibility**: Each store manages one specific domain
- **Simple API**: Minimal, intuitive actions for state manipulation
- **Type Safety**: Clear TypeScript interfaces for state and actions
- **Performance**: Optimized subscriptions to prevent unnecessary re-renders

### Usage Guidelines
- **Consistent Naming**: Use descriptive modal type identifiers
- **Data Validation**: Validate data before passing to modals
- **Error Handling**: Handle cases where modal type is not recognized
- **Cleanup**: Ensure modals are properly closed when unmounting

### Performance Considerations
- **Selective Subscriptions**: Only subscribe to state you need
- **Memoization**: Use useCallback for action creators
- **Lazy Loading**: Load modal components only when needed
- **Cleanup**: Proper cleanup of event listeners and subscriptions

## Data Structure Examples

### Modal State Structure
```javascript
{
  type: "xpAdjustment",
  data: {
    userId: "123",
    currentXP: 500,
    maxAdjustment: 1000,
    reason: "Bug fix compensation"
  },
  isOpen: true
}
```

### Common Modal Types
```javascript
// User management modals
"userDetail" - { userId: string }
"xpAdjustment" - { userId: string, currentXP: number, maxAdjustment: number }

// Content management modals
"lessonEdit" - { lessonId: string, module: string }
"moduleCreate" - { template: string }

// Admin modals
"flagResolution" - { flagId: string, issueType: string }
"userBan" - { userId: string, reason: string, duration: number }
```

## Integration Examples

### Complete Modal System Setup
```javascript
// App.jsx - Root component with modal renderer
import { useModalStore } from './store/useModalStore';
import ModalRenderer from './components/ModalRenderer';

const App = () => {
  return (
    <div>
      <Router>
        <Routes>
          {/* Your routes */}
        </Routes>
      </Router>
      <ModalRenderer />
    </div>
  );
};

// ModalRenderer.jsx - Central modal component
import { useModalStore } from '../store/useModalStore';
import UserDetailModal from './modals/UserDetailModal';
import XPAdjustmentModal from './modals/XPAdjustmentModal';

const ModalRenderer = () => {
  const { isOpen, type, data } = useModalStore();

  if (!isOpen) return null;

  const modals = {
    userDetail: UserDetailModal,
    xpAdjustment: XPAdjustmentModal,
  };

  const ModalComponent = modals[type];

  return ModalComponent ? (
    <div className="modal-overlay">
      <ModalComponent {...data} />
    </div>
  ) : null;
};
```

### Admin Dashboard Integration
```javascript
// AdminUserTable.jsx - Using modal store for user actions
import { useModalStore } from '../../store/useModalStore';

const AdminUserTable = ({ users }) => {
  const { openModal } = useModalStore();

  const handleUserDetail = (userId) => {
    openModal("userDetail", { userId });
  };

  const handleXPAdjustment = (user) => {
    openModal("xpAdjustment", { 
      userId: user._id, 
      currentXP: user.xp 
    });
  };

  const handleFlagResolution = (flag) => {
    openModal("flagResolution", { 
      flagId: flag._id,
      issueType: flag.issueType 
    });
  };

  return (
    <table>
      {users.map(user => (
        <tr key={user._id}>
          <td>{user.username}</td>
          <td>{user.xp}</td>
          <td>
            <button onClick={() => handleUserDetail(user._id)}>
              Details
            </button>
            <button onClick={() => handleXPAdjustment(user)}>
              Adjust XP
            </button>
          </td>
        </tr>
      ))}
    </table>
  );
};
```

## Testing

### Store Testing
```javascript
import { act, renderHook } from '@testing-library/react';
import { useModalStore } from '../store/useModalStore';

describe('useModalStore', () => {
  it('should open modal with correct data', () => {
    const { result } = renderHook(() => useModalStore());

    act(() => {
      result.current.openModal('userDetail', { userId: '123' });
    });

    expect(result.current.type).toBe('userDetail');
    expect(result.current.data).toEqual({ userId: '123' });
    expect(result.current.isOpen).toBe(true);
  });

  it('should close modal and reset state', () => {
    const { result } = renderHook(() => useModalStore());

    act(() => {
      result.current.openModal('userDetail', { userId: '123' });
    });

    act(() => {
      result.current.closeModal();
    });

    expect(result.current.type).toBe(null);
    expect(result.current.data).toEqual({});
    expect(result.current.isOpen).toBe(false);
  });
});
```

## Future Enhancements

### Potential Improvements
- **TypeScript Migration**: Add full TypeScript support for better type safety
- **Middleware Integration**: Add devtools and persistence middleware
- **Multiple Stores**: Add stores for other domains (auth, theme, etc.)
- **Modal History**: Add navigation between modals or modal history
- **Modal Stacking**: Support for multiple modals open at once

### Scalability
- **Store Composition**: Easy to add new stores for different domains
- **Plugin System**: Extensible architecture for modal types
- **Performance**: Optimized for large-scale applications
- **Testing**: Testable architecture with clear separation of concerns

This store system provides a robust foundation for managing global state in the LearningToPy application, with a focus on simplicity, performance, and developer experience.
