"use client";

import ModalOuter from "../modal-parent-components/ModalOuter";
import ModalInnerConfirmation from "../modal-parent-components/ModalInnerConfirmation";
import { ReportGroup } from "@/types/types";

const DeleteColumnModal = ({
  group,
  updateShowDeleteModal,
  deleteColumnFromState,
}: {
  group: ReportGroup;
  updateShowDeleteModal: (bool: boolean) => void;
  deleteColumnFromState: () => void;
}) => {
  const confirmDeleteMessage = `Are you sure you want to delete the '${group.description}' column?`;

  return (
    <ModalOuter
      updateShowModal={updateShowDeleteModal}
      height="h-1/3"
      width="w-1/3"
    >
      <ModalInnerConfirmation
        message={confirmDeleteMessage}
        confirmSelection={deleteColumnFromState}
        updateShowModal={updateShowDeleteModal}
      />
    </ModalOuter>
  );
};
export default DeleteColumnModal;
