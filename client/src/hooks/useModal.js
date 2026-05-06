// /client/src/hooks/useModal.js
/**
 * @fileoverview Modal store access hook.
 *
 * Thin wrapper around the Zustand modal store. Provides `openModal` and
 * `closeModal` without requiring components to import the store directly.
 *
 * @module hooks/useModal
 * @requires ../store/useModalStore
 */

import useModalStore from "../store/useModalStore";

/**
 * Access the global modal store.
 *
 * @returns {{ openModal: Function, closeModal: Function }}
 */
const useModal = () => {
  const { openModal, closeModal } = useModalStore();

  return { openModal, closeModal };
};
