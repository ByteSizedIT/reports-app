"use client";

import Button from "../Button";
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
      <p className="pt-2 md:w-1/2 md:pb-4">{message}</p>
      <div>
        <Button
          label="OK"
          color="modal-secondary-button"
          onClick={() => updateShowModal(false)}
        />
      </div>
    </ModalOuter>
  );
};
export default WarningModal;
