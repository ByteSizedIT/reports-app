"use client";

import { Class } from "@/types/types";

const AddPrevClassStudents = ({
  selectPreviousClass,
  updateSelectPreviousClass,
  addPrevClassStudentsToList,
  myClasses,
}: {
  selectPreviousClass: {
    display: boolean;
    selectedClass: string;
  };
  updateSelectPreviousClass: (selectedClass: string) => void;
  addPrevClassStudentsToList: (e: React.MouseEvent<HTMLButtonElement>) => void;
  myClasses: Array<Class> | null;
}) => {
  return (
    <fieldset className="border border-black w-full p-2 mb-4">
      <legend>Add Previous Class</legend>
      <div className="flex flex-col md:flex-row items-center mb-4">
        <label htmlFor="prevClassName" className="md:w-1/4">
          Previous Class
        </label>
        <select
          id="prevClassName"
          className="w-full sm:w-3/4 rounded-md px-4 sm:py-2 border border-black bg-inherit"
          value={selectPreviousClass.selectedClass}
          onChange={(e) => updateSelectPreviousClass(e.target.value)}
        >
          <option value={""}>Select an option...</option>
          {myClasses?.map((c: Class) => (
            <option key={c.id} value={c.id}>
              {`${c.description} | ${c.year_group} | ${c.academic_year_end} `}
            </option>
          ))}
        </select>
      </div>
      <div className="text-center">
        <button
          type="button"
          className={`px-2 rounded-md no-underline border border-black ${
            selectPreviousClass.selectedClass.length === 0
              ? "disabled:bg-slate-300"
              : "hover:border-transparent hover:bg-green-700 focus:bg-green-700 hover:text-white focus:text-white"
          }`}
          onClick={(e) => addPrevClassStudentsToList(e)}
          disabled={selectPreviousClass.selectedClass.length === 0}
        >
          Add Class&apos; Students
        </button>
      </div>
    </fieldset>
  );
};

export default AddPrevClassStudents;
