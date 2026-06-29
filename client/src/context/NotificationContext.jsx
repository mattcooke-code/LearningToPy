// NotificationContext.jsx
/**
 * @fileoverview Notification context provider and hooks.
 *
 * Provides a lightweight toast notification system and a confirmation modal
 * dialog that can be triggered from anywhere in the component tree without
 * prop drilling.
 *
 * **Toasts** appear at the bottom-center of the viewport and auto-dismiss
 * after a configurable duration (default 5 seconds). They support four
 * semantic types: info, success, error, warning.
 *
 * **Confirmation modals** present a two-button dialog (confirm/cancel) with
 * a title, message, and type-based styling (info, warning, danger).
 *
 * @module NotificationContext
 * @requires react
 * @requires uuid
 * @requires ../components/ui/BaseModal
 */

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useRef,
} from "react";
import BaseModal from "../components/ui/BaseModal";

// ---------------------------------------------------------------------------
// Context Definition
// ---------------------------------------------------------------------------

/**
 * React Context holding notification state and actions.
 *
 * @type {React.Context<object|null>}
 */
const NotificationContext = createContext();

// ---------------------------------------------------------------------------
// Internal Components
// ---------------------------------------------------------------------------

/**
 * Individual toast notification bar.
 *
 * Renders a coloured, animated bar at the bottom of the screen with a
 * message and a close button. Colours are determined by the `type` prop.
 *
 * @todo Extract to /client/src/components/ui/Toast.jsx — this is a
 *   presentational component, not context logic.
 *
 * @param {{ id: string, message: string, type: 'info'|'success'|'error'|'warning', onClose: (id: string) => void }} props
 * @returns {JSX.Element}
 */
const Toast = ({ id, message, type, onClose }) => {
  const typeStyles = {
    info: "bg-blue-600 border-blue-700",
    success: "bg-green-600 border-green-700",
    error: "bg-red-600 border-red-700",
    warning: "bg-yellow-500 border-yellow-600 text-gray-900",
  };

  const textColor = type === "warning" ? "text-gray-900" : "text-white";
  const closeButtonColor =
    type === "warning"
      ? "text-gray-700 hover:text-gray-900"
      : "text-white hover:text-gray-200";

  const role = type === "error" || type === "warning" ? "alert" : "status";

  return (
    <div
      role={role}
      className={`flex items-center justify-between p-4 mb-2 rounded-lg border-l-4 shadow-lg transform transition-all duration-300 animate-in slide-in-from-bottom-8 ${typeStyles[type]} min-w-300px max-w-md`}
    >
      <span className={`flex-1 font-medium ${textColor}`}>{message}</span>
      <button
        onClick={() => onClose(id)}
        className={`ml-4 transition-colors text-lg font-bold ${closeButtonColor}`}
        aria-label="Close notification"
      >
        ×
      </button>
    </div>
  );
};

/**
 * Confirmation modal dialog.
 *
 * Displays a modal with a title, message, and two action buttons (confirm /
 * cancel). The styling adapts based on the `type` prop (info, warning,
 * danger).
 *
 * Uses the shared `BaseModal` component for the overlay and container.
 *
 * @todo Extract to /client/src/components/ui/ConfirmationModal.jsx.
 *
 * @param {{ isOpen: boolean, title: string, message: string, onConfirm: () => void, onCancel: () => void, confirmText?: string, cancelText?: string, type?: 'info'|'warning'|'danger' }} props
 * @returns {JSX.Element}
 */
const ConfirmationModal = ({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = "Confirm",
  cancelText = "Cancel",
  type = "info",
}) => {
  const styles = {
    danger: {
      bg: "bg-red-50 dark:bg-red-900/20",
      btn: "bg-red-600 hover:bg-red-700 shadow-red-500/20",
    },
    warning: {
      bg: "bg-yellow-50 dark:bg-yellow-900/20",
      btn: "bg-yellow-600 hover:bg-yellow-700 shadow-yellow-500/20",
    },
    info: {
      bg: "bg-blue-50 dark:bg-blue-900/20",
      btn: "bg-blue-600 hover:bg-blue-700 shadow-blue-500/20",
    },
  }[type] || { bg: "bg-gray-50", btn: "bg-gray-900" };

  return (
    <BaseModal isOpen={isOpen} onClose={onCancel} title="" size="md">
      <div className="flex flex-col items-center text-center p-2">
        <div
          className={`w-16 h-16 rounded-full ${styles.bg} flex items-center justify-center mb-4`}
        >
          <div
            className={`w-3 h-3 rounded-full animate-pulse ${
              type === "danger" ? "bg-red-500" : "bg-blue-500"
            }`}
          />
        </div>

        <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">
          {title}
        </h3>
        <p className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-8 max-w-280px leading-relaxed">
          {message}
        </p>

        <div className="grid grid-cols-2 gap-3 w-full">
          <button
            onClick={onCancel}
            className="px-6 py-3 text-xs font-black uppercase tracking-widest text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest text-white shadow-lg transition-all active:scale-95 ${styles.btn}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </BaseModal>
  );
};

// ---------------------------------------------------------------------------
// NotificationProvider Component
// ---------------------------------------------------------------------------

/**
 * Provider component that manages toast notifications and confirmation
 * modals.
 *
 * **State managed:**
 * - `toasts` — array of active toast objects `{ id, message, type, duration }`
 * - `confirmModal` — configuration object for the current (or last) confirmation dialog
 *
 * **Actions exposed via context:**
 * - `showToast(message, type?, duration?)` — display a toast
 * - `showConfirm({ title, message, onConfirm, onCancel?, type?, confirmText?, cancelText? })` — open a confirmation modal
 * - `closeConfirm()` — programmatically close the confirmation modal
 *
 * @param {{ children: React.ReactNode }} props
 * @returns {JSX.Element}
 */
export const NotificationProvider = ({ children }) => {
  /** @type {[{ id: string, message: string, type: string, duration: number }[], Function]} */
  const [toasts, setToasts] = useState([]);

  /** @type {[object, Function]} */
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "info",
    onConfirm: () => {},
    onCancel: () => {},
    confirmText: "Confirm",
    cancelText: "Cancel",
  });

  /**
   * Display a toast notification.
   *
   * Each toast receives a unique ID (crypto.randomUUID) and is automatically removed
   * after `duration` milliseconds.
   *
   * @param {string} message - The text to display.
   * @param {'info'|'success'|'error'|'warning'} [type='info'] - Semantic type
   *   controlling colour.
   * @param {number} [duration=5000] - Auto-dismiss delay in ms.
   */

  const timersRef = useRef(new Map());

  const showToast = useCallback((message, type = "info", duration = 5000) => {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev, { id, message, type, duration }]);

    const timer = setTimeout(() => {
      timersRef.current.delete(id);
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, duration);

    timersRef.current.set(id, timer);
  }, []);

  /**
   * Remove a toast immediately by ID (used by the close button).
   *
   * @param {string} id - The crypto.randomUUID of the toast to dismiss.
   */
  const removeToast = useCallback((id) => {
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  /**
   * Open a confirmation modal dialog.
   *
   * The `onConfirm` callback is wrapped to automatically close the modal
   * before executing. The `onCancel` callback is wrapped similarly and is
   * optional — if omitted the modal simply closes.
   *
   * @param {{ title: string, message: string, onConfirm: () => void, onCancel?: () => void, type?: 'info'|'warning'|'danger', confirmText?: string, cancelText?: string }} config
   */
  const showConfirm = useCallback(
    ({
      title,
      message,
      onConfirm,
      onCancel,
      type = "info",
      confirmText = "Confirm",
      cancelText = "Cancel",
    }) => {
      setConfirmModal({
        isOpen: true,
        title,
        message,
        type,
        onConfirm: () => {
          setConfirmModal((prev) => ({ ...prev, isOpen: false }));
          onConfirm();
        },
        onCancel: () => {
          setConfirmModal((prev) => ({ ...prev, isOpen: false }));
          onCancel?.();
        },
        confirmText,
        cancelText,
      });
    },
    [],
  );

  /**
   * Programmatically close the confirmation modal without executing either
   * callback. Useful for cleanup or external state changes.
   */
  const closeConfirm = useCallback(() => {
    setConfirmModal((prev) => ({ ...prev, isOpen: false }));
  }, []);

  /**
   * Memoised context value to prevent unnecessary re-renders of consumers.
   *
   * @type {{ showToast: Function, showConfirm: Function, closeConfirm: Function }}
   */
  const value = useMemo(
    () => ({
      showToast,
      showConfirm,
      closeConfirm,
    }),
    [showToast, showConfirm, closeConfirm],
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}

      {/* Toast Container — fixed bottom-center, above all other content */}
      <aside
        className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 flex flex-col items-center"
        aria-label="Notifications"
      >
        {toasts.map((toast) => (
          <Toast key={toast.id} {...toast} onClose={removeToast} />
        ))}
      </aside>

      {/* Confirmation Modal — spread the full state object as props */}
      <ConfirmationModal {...confirmModal} />
    </NotificationContext.Provider>
  );
};

// ---------------------------------------------------------------------------
// Consumer Hook
// ---------------------------------------------------------------------------

/**
 * Access the notification context. Must be called from a component wrapped in
 * `<NotificationProvider>`.
 *
 * @returns {{ showToast: Function, showConfirm: Function, closeConfirm: Function }}
 * @throws {Error} If called outside of a NotificationProvider.
 */
export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotification must be used within NotificationProvider");
  }
  return context;
};
