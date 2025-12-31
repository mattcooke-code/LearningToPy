// useModal.js
import useModalStore from "../store/useModalStore";

const useModal = () => {
  const { openModal, closeModal } = useModalStore();

  return { openModal, closeModal };
};
