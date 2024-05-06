const ModalInnerConfirmation = ({
  message,
  updateShowModal,
  confirmAction,
}: {
  message?: string;
  updateShowModal: (bool: boolean) => void;
  confirmAction: () => void;
}) => {
  return (
    <>
      {/* <div className="flex flex-col w-full h-full justify-center items-center text-xs md:text-base"> */}
      <p className="pt-2 md:w-1/2 md:pb-4">{message}</p>
      <div>
        <button
          className="m-1 py-2 px-2 rounded-md no-underline bg-btn-background hover:bg-green-700 focus:bg-green-700"
          onClick={confirmAction}
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
      {/* </div> */}
    </>
  );
};
export default ModalInnerConfirmation;
