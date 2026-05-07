// BaseModal.jsx
import { useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

/**
 * A comprehensive, accessible modal component with advanced focus management and customization options.
 * 
 * This modal implements full accessibility standards including:
 * - Focus trapping within the modal
 * - Focus restoration on close
 * - Escape key handling
 * - Screen reader support with proper ARIA attributes
 * - Body scroll prevention when open
 * 
 * @component
 * @example
 * ```jsx
 * const [isOpen, setIsOpen] = useState(false);
 * const inputRef = useRef(null);
 * 
 * <BaseModal
 *   isOpen={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   title="Confirm Action"
 *   size="lg"
 *   initialFocusRef={inputRef}
 *   footer={
 *   <button onClick={() => setIsOpen(false)}>Cancel</button>
 * }
 * >
 *   <p>Are you sure you want to continue?</p>
 * </BaseModal>
 * ```
 * 
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Controls modal visibility. When false, modal is not rendered.
 * @param {Function} props.onClose - Callback function triggered when modal should close (overlay click, escape key, close button)
 * @param {string} [props.title] - Modal title displayed in the header. If not provided, header may still render for close button.
 * @param {React.ReactNode} props.children - Content to display in the modal body area
 * @param {string} [props.size="md"] - Modal size preset. Affects max-width of the modal.
 * @param {boolean} [props.showCloseButton=true] - Whether to show close button (X icon)
 * @param {boolean} [props.closeOnOverlayClick=true] - If true, clicking the overlay/backdrop closes the modal
 * @param {boolean} [props.closeOnEscape=true] - If true, pressing Escape key closes the modal
 * @param {string} [props.className=""] - Additional CSS classes to apply to the modal panel
 * @param {boolean} [props.hideOverlay=false] - If true, no overlay/backdrop is rendered
 * @param {React.ReactNode} [props.footer] - Content to display in the modal footer area
 * @param {string} [props.footerAlign="right"] - Alignment of footer content: "left", "center", "right", or "between"
 * @param {boolean} [props.disableBodyScroll=true] - If true, prevents body scrolling when modal is open
 * @param {React.RefObject} [props.initialFocusRef] - Ref to element that should receive focus when modal opens
 * @param {Function} [props.onAfterClose] - Callback function triggered after modal closes and focus is restored
 * @param {string} [props.closeButtonPosition="header"] - Position of close button: "header" or "corner"
 * @param {boolean} [props.backdropBlur=false] - If true, applies backdrop blur effect to overlay
 * 
 * @returns {JSX.Element|null} Modal rendered via React Portal, or null when closed
 * 
 * @sizeOptions
 * Available size presets:
 * - "xs" - max-w-xs (320px)
 * - "sm" - max-w-sm (384px) 
 * - "md" - max-w-md (448px)
 * - "lg" - max-w-lg (512px)
 * - "xl" - max-w-xl (576px)
 * - "2xl" - max-w-2xl (672px)
 * - "3xl" - max-w-3xl (768px)
 * - "4xl" - max-w-4xl (896px)
 * - "5xl" - max-w-5xl (1024px)
 * - "6xl" - max-w-6xl (1152px)
 * - "full" - max-w-full with horizontal margins
 * 
 * @accessibilityFeatures
 * - Focus trapping: Tab navigation stays within modal bounds
 * - Focus restoration: Previous focused element is restored on close
 * - Escape handling: Standard accessibility pattern
 * - ARIA attributes: role="dialog", aria-modal="true", proper labeling
 * - Keyboard navigation: Full keyboard support
 * - Screen reader friendly: Semantic HTML structure
 * 
 * @internalLogic
 * Focus Management:
 * 1. Stores current focused element when modal opens
 * 2. Attempts to focus initialFocusRef or modal itself
 * 3. Traps focus using Tab key detection and boundary handling
 * 4. Restores focus to stored element on close (with timeout for DOM updates)
 * 
 * Event Handling:
 * - Escape key listener added/removed based on isOpen state
 * - Body scroll lock/unlock for prevent background scrolling
 * - Click outside detection for overlay closing
 * - Cleanup functions properly remove all event listeners
 */
const BaseModal = ({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
  showCloseButton = true,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  className = "",
  hideOverlay = false,
  footer,
  footerAlign = "right",
  disableBodyScroll = true,
  initialFocusRef,
  onAfterClose,
  closeButtonPosition = "header",
  backdropBlur = false,
}) => {
  const modalRef = useRef(null);
  const lastFocusedElement = useRef(null);

  // Store last focused element
  useEffect(() => {
    if (isOpen) {
      lastFocusedElement.current = document.activeElement;
    }
  }, [isOpen]);

  // Close modal and restore focus
  const handleClose = useCallback(() => {
    onClose();
    if (onAfterClose) onAfterClose();

    // Restore focus to last focused element
    setTimeout(() => {
      if (lastFocusedElement.current) {
        lastFocusedElement.current.focus();
      }
    }, 100);
  }, [onClose, onAfterClose]);

  // Escape Key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && closeOnEscape) handleClose();
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      if (disableBodyScroll) {
        document.body.style.overflow = "hidden";
      }
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      if (disableBodyScroll) {
        document.body.style.overflow = "unset";
      }
    };
  }, [isOpen, handleClose, closeOnEscape, disableBodyScroll]);

  // Focus Management
  useEffect(() => {
    if (isOpen) {
      if (initialFocusRef?.current) {
        setTimeout(() => initialFocusRef.current.focus(), 100);
      } else if (modalRef.current) {
        modalRef.current.focus();
      }
    }
  }, [isOpen, initialFocusRef]);

  // Trap focus inside modal
  useEffect(() => {
    if (!isOpen) return;

    const handleTabKey = (e) => {
      if (e.key !== "Tab") return;

      const focusableElements = modalRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );

      if (!focusableElements?.length) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    };

    const modalElement = modalRef.current;
    modalElement?.addEventListener("keydown", handleTabKey);

    return () => {
      modalElement?.removeEventListener("keydown", handleTabKey);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizeClasses = {
    xs: "max-w-xs",
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
    "3xl": "max-w-3xl",
    "4xl": "max-w-4xl",
    "5xl": "max-w-5xl",
    "6xl": "max-w-6xl",
    full: "max-w-full mx-4",
  };

  const footerAlignClasses = {
    left: "justify-start",
    center: "justify-center",
    right: "justify-end",
    between: "justify-between",
  };

  const modalContent = (
    <>
      {/* Overlay */}
      {!hideOverlay && (
        <div
          className={`fixed inset-0 z-[9998] bg-gray-900 transition-opacity ${
            backdropBlur ? "backdrop-blur-sm" : "bg-opacity-50"
          }`}
          onClick={closeOnOverlayClick ? handleClose : undefined}
          aria-hidden="true"
        />
      )}

      {/* Modal Container */}
      <div
        className="fixed inset-0 z-[9999] overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? "modal-title" : undefined}
      >
        <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
          {/* Modal Panel */}
          <div
            ref={modalRef}
            className={`relative transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 text-left shadow-xl transition-all sm:my-8 w-full ${sizeClasses[size]} ${className}`}
            tabIndex={-1}
          >
            {/* Close Button in Corner (Optional) */}
            {showCloseButton && closeButtonPosition === "corner" && (
              <button
                onClick={handleClose}
                className="absolute right-4 top-4 z-10 p-2 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                aria-label="Close modal"
              >
                <X className="h-5 w-5" />
              </button>
            )}

            {/* Header */}
            {(title ||
              (showCloseButton && closeButtonPosition === "header")) && (
              <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 px-6 py-4">
                {title && (
                  <h3
                    id="modal-title"
                    className="text-lg font-semibold text-gray-900 dark:text-white"
                  >
                    {title}
                  </h3>
                )}
                {showCloseButton && closeButtonPosition === "header" && (
                  <button
                    onClick={handleClose}
                    className="ml-auto p-2 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    aria-label="Close modal"
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
              </div>
            )}

            {/* Content */}
            <div className="px-6 py-4 max-h-[70vh] overflow-y-auto">
              {children}
            </div>

            {/* Footer */}
            {footer && (
              <div
                className={`flex ${footerAlignClasses[footerAlign]} gap-3 border-t border-gray-200 dark:border-gray-700 px-6 py-4 bg-gray-50 dark:bg-gray-750 rounded-b-2xl`}
              >
                {footer}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );

  const modalRoot = document.getElementById("modal-root") || document.body;
  return createPortal(modalContent, modalRoot);
};

export default BaseModal;
