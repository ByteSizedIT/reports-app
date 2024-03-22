"use client";

import ModalInnerMessageOnly from "../modal-parent-components/ModalInnerMessageOnly";
import ModalOuter from "../modal-parent-components/ModalOuter";

const WarningModal = ({
  message,
  updateShowModal,
}: {
  message: string;
  updateShowModal: (bool: boolean) => void;
}) => {
  return (
    <ModalOuter updateShowModal={updateShowModal} height="h-1/3" width="w-1/3">
      <ModalInnerMessageOnly
        message={message}
        updateShowModal={updateShowModal}
      ></ModalInnerMessageOnly>
    </ModalOuter>
  );
};
export default WarningModal;
