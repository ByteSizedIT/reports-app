"use client";

import ModalOuter from "../ModalOuter";
import { ClassSubjectGroupStudent } from "@/types/types";
import Button from "../Button";

const DeleteModal = ({
  updateShowDeleteModal,
  message,
  handleDelete,
}: {
  updateShowDeleteModal: (bool: boolean) => void;
  message: string;
  handleDelete: () => void;
}) => {
  return (
    <ModalOuter
      updateShowModal={updateShowDeleteModal}
      height="md:h-1/3"
      width="md:w-1/3"
    >
      <p className="py-4 md:w-1/2 md:pb-4 flex flex-1 items-center text-center">
        {message}
      </p>
      <div>
        <Button label="Yes" color={"primary-button"} onClick={handleDelete} />
        <Button
          label="No"
          color="modal-secondary-button"
          leftMargin
          onClick={() => updateShowDeleteModal(false)}
        />
      </div>
    </ModalOuter>
  );
};
export default DeleteModal;
