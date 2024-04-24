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
    <div className="flex flex-col h-full items-center text-black text-xs sm:text-base">
      <h4>{title}</h4>
      <form className="w-full h-full flex flex-col sm:w-3/4 md:w-1/2 mt-4 md:mt-8">
        <div className="flex flex-1 flex-col items-center">{children}</div>
        <div className="flex justify-center">
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
      </form>
    </div>
  );
};
export default ModalInnerAdd;
