import { createContext, useContext, useState, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";

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
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-in fade-in duration-200">
      <div className="bg-white rounded-lg shadow-xl p-6 m-4 max-w-md w-full transform transition-all animate-in zoom-in-95">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600 mb-6">{message}</p>

        <div className="flex justify-end space-x-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm font-medium text-white bg-python-blue hover:bg-python-dark rounded-md transition-colors"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export const NotificationProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    message: "",
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
      confirmText = "Confirm",
      cancelText = "Cancel",
    }) => {
      setConfirmModal({
        isOpen: true,
        title,
        message,
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
    []
  );

  const closeConfirm = useCallback(() => {
    setConfirmModal((prev) => ({ ...prev, isOpen: false }));
  }, []);

  const value = { showToast, showConfirm, closeConfirm };

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
