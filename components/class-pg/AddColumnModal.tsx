"use client";

import ModalInnerAdd from "../ModalInnerAdd";
import ModalOuter from "../ModalOuter";

const AddColumnModal = ({
  updateShowAddModal,
  addColumnToState,
}: {
  updateShowAddModal: (bool: boolean) => void;
  addColumnToState: () => void;
}) => {
  return (
    <ModalOuter
      updateShowModal={updateShowAddModal}
      height="h-1/3"
      width="w-1/3"
    >
      <ModalInnerAdd
        updateShowModal={updateShowAddModal}
        saveContent={addColumnToState}
      />
    </ModalOuter>
  );
};
export default AddColumnModal;
