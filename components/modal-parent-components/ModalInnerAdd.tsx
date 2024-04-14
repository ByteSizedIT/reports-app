"use client";

const ModalInnerAdd = ({
  title,
  children,
  updateShowModal,
  saveContent,
}: {
  title: string;
  children?: React.ReactNode;
  updateShowModal: (bool: boolean) => void;
  saveContent: () => void;
}) => {
  async function contentSubmit() {
    saveContent();
  }

  return (
    <div className="text-black flex flex-col h-full">
      <h4 className="">{title}</h4>
      {children}
      <div className=" ">
        <button
          type="button"
          className="m-1 py-2 px-2 rounded-md no-underline bg-btn-background hover:bg-green-700 focus:bg-green-700  text-white"
          onClick={contentSubmit}
        >
          Save
        </button>
        <button
          type="button"
          className="m-1 py-2 px-2 rounded-md no-underline bg-btn-background hover:bg-green-700 focus:bg-green-700 text-white"
          onClick={() => updateShowModal(false)}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};
export default ModalInnerAdd;