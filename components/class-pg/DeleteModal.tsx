"use client";

import ModalOuter from "../ModalOuter";
import { ClassSubjectGroupStudent } from "@/types/types";
import Button from "../Button";

const DeleteModal = ({
  // group,
  updateShowDeleteModal,
  message,
  handleDelete,
}: {
  group: ClassSubjectGroupStudent;
  updateShowDeleteModal: (bool: boolean) => void;
  message: string;
  handleDelete: () => void;
}) => {
  // const confirmDeleteMessage = `Are you sure you want to delete the '${group.report_group.description}' column?`;

  return (
    <ModalOuter
      updateShowModal={updateShowDeleteModal}
      height="h-1/3"
      width="w-1/3"
    >
      <p className="pt-2 md:w-1/2 md:pb-4 flex flex-1 items-center">
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
