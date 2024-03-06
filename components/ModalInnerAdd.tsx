const ModalInnerAdd = ({
  children,
  updateShowModal,
  saveContent,
}: {
  children?: React.ReactNode;
  updateShowModal: (bool: boolean) => void;
  saveContent: () => void;
}) => {
  return (
    <>
      {children}
      <div className="absolute bottom-2 right-2 ">
        <button
          className="m-1 py-2 px-2 rounded-md no-underline bg-btn-background hover:bg-green-700 focus:bg-green-700"
          onClick={() => saveContent}
        >
          Save
        </button>
        <button
          className="m-1 py-2 px-2 rounded-md no-underline bg-btn-background hover:bg-green-700 focus:bg-green-700"
          onClick={() => updateShowModal(false)}
        >
          Cancel
        </button>
      </div>
    </>
  );
};
export default ModalInnerAdd;
