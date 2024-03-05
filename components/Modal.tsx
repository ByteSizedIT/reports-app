"use client";

const Modal = ({
  message,
  updateShowModal,
  confirmSelection,
}: {
  message: string;
  updateShowModal: (bool: boolean) => void;
  confirmSelection: () => void;
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-gray-500 bg-opacity-50 flex items-center justify-center">
      <div className="relative bg-white p-4 border-8 border-green-700 w-1/3 h-1/3">
        <div className="flex flex-col w-full h-full justify-center items-center text-xs md:text-base">
          <button
            className="absolute text-gray-500 hover:text-black focus:text-black font-bold text-xl md:text-3xl top-0 right-2 float-top leading-none"
            onClick={() => updateShowModal(false)}
          >
            &times;
          </button>
          <p className="text-black pt-2 md:w-1/2 md:pb-4">{message}</p>
          <div>
            <button
              className="m-1 py-2 px-2 rounded-md no-underline bg-btn-background hover:bg-green-700 focus:bg-green-700"
              onClick={() => confirmSelection}
            >
              Yes
            </button>
            <button
              className="m-1 py-2 px-2 rounded-md no-underline bg-btn-background hover:bg-green-700 focus:bg-green-700"
              onClick={() => updateShowModal(false)}
            >
              No
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Modal;
