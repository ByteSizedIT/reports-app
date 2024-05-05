"use client";

const ModalOuter = ({
  children,
  updateShowModal,
  height,
  width,
}: {
  children?: React.ReactNode;
  updateShowModal: (bool: boolean) => void;
  height: string;
  width: string;
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-gray-500 bg-opacity-50 flex items-center justify-center">
      <div
        className={`rounded-2xl relative bg-white p-4 border-8 border-green-700 ${height} ${width} overflow-y-auto`}
      >
        <button
          className="absolute text-gray-500 hover:text-black focus:text-black font-bold text-xl md:text-3xl top-0 right-2 leading-none"
          onClick={() => updateShowModal(false)}
        >
          &times;
        </button>
        <div
          className={`flex flex-col w-full h-full p-4 justify-center items-center text-black text-xs ${
            width === "w-3/4" || "w-3/4 md:w-1/3"
              ? "sm:text-base"
              : "md:text-base"
          }`}
        >
          {children}
        </div>
      </div>
    </div>
  );
};
export default ModalOuter;
