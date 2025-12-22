// useModalStore.js
import { create } from "zustand";

const useModalStore = create((set) => ({
  type: null, // Modal Name
  data: {}, // Props
  isOpen: false,

  // Function to open any modal by name
  openModal: (type, data = {}) =>
    set({
      isOpen: true,
      type,
      data,
    }),

  // Function to clear everything
  closeModal: () =>
    set({
      isOpen: false,
      type: null,
      data: {},
    }),
}));

export default useModalStore;
