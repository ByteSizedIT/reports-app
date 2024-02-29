import { FaPlus } from "react-icons/fa";

const NewColumn = () => {
  return (
    <button
      className="border-2 border-slate-500 rounded-lg flex justify-center items-center min-w-36 md:min-w-72 p-4 h-full"
      onClick={() =>
        console.log("Need to create function to open new ReportGroup")
      }
    >
      <FaPlus className="text-green-700 text-3xl sm:text-4xl" />
    </button>
  );
};
export default NewColumn;
