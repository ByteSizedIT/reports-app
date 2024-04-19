import ModalOuter from "./modal-parent-components/ModalOuter";
import ModalInnerAdd from "./modal-parent-components/ModalInnerAdd";

const AddNewClassModal = ({
  updateShowNewClassModal,
  saveNewClass,
}: {
  updateShowNewClassModal: (bool: boolean) => void;
  saveNewClass: () => void;
}) => {
  return (
    <ModalOuter
      updateShowModal={updateShowNewClassModal}
      height="h-3/4"
      width="w-3/4"
    >
      <ModalInnerAdd
        title="Add New Class"
        updateShowModal={updateShowNewClassModal}
        saveContent={saveNewClass}
      ></ModalInnerAdd>
    </ModalOuter>
  );
};

export default AddNewClassModal;
