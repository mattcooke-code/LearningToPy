// ModalManager.jsx
import * as Modals from "./index";
import useModalStore from "../store/useModalStore";

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
