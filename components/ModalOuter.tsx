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
        className={`relative bg-white p-4 border-8 border-green-700 ${height} ${width}`}
      >
        <button
          className="absolute text-gray-500 hover:text-black focus:text-black font-bold text-xl md:text-3xl top-0 right-2 leading-none"
          onClick={() => updateShowModal(false)}
        >
          &times;
        </button>
        {children}
      </div>
    </div>
  );
};
export default ModalOuter;
