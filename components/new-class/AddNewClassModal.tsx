"use client";

import ModalOuter from "../modal-parent-components/ModalOuter";

import { Class } from "@/types/types";
import AddNewClassForm from "./AddNewClassForm";

const AddNewClassModal = ({
  myClasses,
  organisationId,
  updateShowNewClassModal,
}: {
  myClasses: Array<Class> | null;
  organisationId: number;
  updateShowNewClassModal: (bool: boolean) => void;
}) => {
  return (
    <ModalOuter
      updateShowModal={updateShowNewClassModal}
      height="h-3/4"
      width="w-3/4"
    >
      <h4>Add New Class</h4>
      <AddNewClassForm
        myClasses={myClasses}
        organisationId={organisationId}
        updateShowNewClassModal={updateShowNewClassModal}
      />
    </ModalOuter>
  );
};

export default AddNewClassModal;
