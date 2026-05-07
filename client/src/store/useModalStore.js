import { create } from "zustand";

/**
 * Zustand store for managing modal state across the application.
 * Provides a simple API to open/close any modal by name.
 * 
 * @hook
 * @returns {Object} Modal store with state and actions
 * @returns {string|null} .type - Current modal identifier (e.g., "xpModal", "userDetail")
 * @returns {Object} .data - Props/data to pass to the modal
 * @returns {boolean} .isOpen - Whether modal is currently visible
 * @returns {Function} .openModal - Opens a modal: (type: string, data?: Object) => void
 * @returns {Function} .closeModal - Closes the current modal: () => void
 * 
 * @example
 * ```jsx
 * const { openModal, closeModal } = useModalStore();
 * 
 * // Open a modal with data
 * openModal("xpAdjustment", { userId: "123", currentXP: 500 });
 * 
 * // Close the modal
 * closeModal();
 * ```
 */

const useModalStore = create((set) => ({
  type: null,
  data: {},
  isOpen: false,

  openModal: (type, data = {}) =>
    set({
      isOpen: true,
      type,
      data,
    }),

  closeModal: () =>
    set({
      isOpen: false,
      type: null,
      data: {},
    }),
}));

export default useModalStore;