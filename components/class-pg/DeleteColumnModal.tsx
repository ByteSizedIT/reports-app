"use client";

import ModalOuter from "../modal-parent-components/ModalOuter";
import ModalInnerConfirmation from "../modal-parent-components/ModalInnerConfirmation";
import { ClassSubjectGroup } from "@/types/types";

const DeleteColumnModal = ({
  group,
  updateShowDeleteModal,
  deleteColumn,
}: {
  group: ClassSubjectGroup;
  updateShowDeleteModal: (bool: boolean) => void;
  deleteColumn: () => void;
}) => {
  const confirmDeleteMessage = `Are you sure you want to delete the '${group.report_group.description}' column?`;

  return (
    <ModalOuter
      updateShowModal={updateShowDeleteModal}
      height="h-1/3"
      width="w-1/3"
    >
      <ModalInnerConfirmation
        message={confirmDeleteMessage}
        confirmSelection={deleteColumn}
        updateShowModal={updateShowDeleteModal}
      />
    </ModalOuter>
  );
};
export default DeleteColumnModal;
