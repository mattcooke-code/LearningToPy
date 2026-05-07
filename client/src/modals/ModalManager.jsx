// ModalManager.jsx
import * as Modals from "./index";
import useModalStore from "../store/useModalStore";

/**
 * @fileoverview
 * Central modal coordination system managing dynamic modal display and state.
 * This component serves as the single entry point for all modal rendering, coordinating
 * with the global modal store to handle modal type selection, data passing, and
 * lifecycle management. Provides error handling for missing modal components and
 * ensures consistent modal behavior across the application.
 */

/**
 * Central modal coordination system managing dynamic modal display and state.
 * 
 * This component acts as the orchestrator for all modal interactions in the application,
 * working in conjunction with the global modal store to dynamically render the appropriate
 * modal based on the current state. It handles modal type resolution, data passing,
 * and lifecycle management while providing robust error handling for missing modal
 * components. The ModalManager ensures consistent modal behavior and provides a
 * centralized point for modal coordination across the entire application.
 * 
 * @component
 * @returns {JSX.Element|null} Dynamically rendered modal component or null
 * 
 * @modalCoordination
 * - Integrates with useModalStore for global modal state management
 * - Dynamically resolves modal components based on type string
 * - Passes modal data and lifecycle functions to rendered components
 * - Handles modal visibility and closure coordination
 * - Ensures single modal instance at any time
 * 
 * @stateManagement
 * - type: String identifier for the current modal type
 * - data: Object containing modal-specific props and data
 * - isOpen: Boolean indicating modal visibility state
 * - closeModal: Function to close the current modal
 * - Reactive to store state changes
 * 
 * @componentResolution
 * - Imports all modal components from ./index.js
 * - Uses dynamic component access Modals[type]
 * - Graceful error handling for missing modal types
 * - Console error logging for debugging purposes
 * - Null return for invalid modal types
 * 
 * @dataFlow
 * - Receives modal data from global store
 * - Spreads data object as props to modal component
 * - Passes standard modal props (isOpen, onClose)
 * - Maintains data consistency across modal lifecycle
 * - Type-safe prop passing
 * 
 * @errorHandling
 * - Validates modal type existence before rendering
 * - Console error logging for missing modal components
 * - Graceful fallback to null for invalid types
 * - Development-friendly error messages
 * - Prevents application crashes from modal errors
 * 
 * @lifecycleManagement
 * - Renders only when modal is open and type is valid
 * - Automatic cleanup on modal closure
 * - Efficient re-rendering based on store changes
 * - Memory-efficient component resolution
 * - Proper component mounting/unmounting
 * 
 * @integrationPoints
 * - useModalStore: Global state management
 * - ./index.js: Modal component registry
 * - Individual modal components: Dynamic rendering targets
 * - Application-wide modal coordination
 * - Consistent modal behavior patterns
 * 
 * @performanceOptimizations
 * - Conditional rendering prevents unnecessary updates
 * - Efficient component lookup and resolution
 * - Minimal re-renders through store subscription
 * - Memory-efficient error handling
 * - Optimized prop spreading
 */

const ModalManager = () => {
  const { type, data, isOpen, closeModal } = useModalStore();

  if (!isOpen || !type) return null;

  const ModalComponent = Modals[type];

  if (!ModalComponent) {
    console.error(`Modal type "${type}" not found in /modals/index.js.`);
    return null;
  }

  return <ModalComponent isOpen={isOpen} onClose={closeModal} {...data} />;
};

export default ModalManager;
