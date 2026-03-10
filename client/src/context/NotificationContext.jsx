// NotificationContext.jsx
import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
} from "react";
import { v4 as uuidv4 } from "uuid";
import BaseModal from "../components/ui/BaseModal";

const NotificationContext = createContext();

// Toast Component
const Toast = ({ id, message, type, onClose }) => {
  const typeStyles = {
    info: "bg-blue-500 border-blue-600",
    success: "bg-green-500 border-green-600",
    error: "bg-red-500 border-red-600",
    warning: "bg-yellow-500 border-yellow-600",
  };

  return (
    <div
      className={`flex items-center justify-between p-4 mb-2 rounded-lg border-l-4 text-white shadow-lg transform transition-all duration-300 animate-in slide-in-from-bottom-8 ${typeStyles[type]} min-w-[300px] max-w-md`}
    >
      <span className="flex-1">{message}</span>
      <button
        onClick={() => onClose(id)}
        className="ml-4 text-white hover:text-gray-200 transition-colors text-lg font-bold"
        aria-label="Close notification"
      >
        ×
      </button>
    </div>
  );
};

// Confirmation Modal Component
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
          {/* You can dynamically choose icon based on type here */}
          <div
            className={`w-3 h-3 rounded-full animate-pulse ${
              type === "danger" ? "bg-red-500" : "bg-blue-500"
            }`}
          />
        </div>

        <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">
          {title}
        </h3>
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-8 max-w-[280px] leading-relaxed">
          {message}
        </p>

        <div className="grid grid-cols-2 gap-3 w-full">
          <button
            onClick={onCancel}
            className="px-6 py-3 text-xs font-black uppercase tracking-widest text-gray-400 hover:text-gray-600 transition-colors"
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

export const NotificationProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
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

  const showToast = useCallback((message, type = "info", duration = 5000) => {
    const id = uuidv4();
    setToasts((prev) => [...prev, { id, message, type, duration }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  // Confirm methods
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

  const closeConfirm = useCallback(() => {
    setConfirmModal((prev) => ({ ...prev, isOpen: false }));
  }, []);

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

      {/* Toast Container - Bottom Center */}
      <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 flex flex-col items-center">
        {toasts.map((toast) => (
          <Toast key={toast.id} {...toast} onClose={removeToast} />
        ))}
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal {...confirmModal} />
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotification must be used within NotificationProvider");
  }
  return context;
};
