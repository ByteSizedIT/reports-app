"use client";

import { useState } from "react";

import { Class, Student } from "@/types/types";

const AddPrevClassStudents = ({
  myClasses,
  addExistStudentsToRegister,
  updateFetchError,
}: {
  myClasses: Array<Class> | null;
  addExistStudentsToRegister: (selectedClassStudents: Array<Student>) => void;
  updateFetchError: (bool: boolean) => void;
}) => {
  const [selectPreviousClass, setSelectPreviousClass] = useState({
    display: false,
    selectedClass: "",
  });

  const addPrevClassStudentsToRegister = (
    e: React.MouseEvent<HTMLButtonElement>
  ) => {
    e.preventDefault;
    async function fetchClassStudents() {
      try {
        // Fetching directly from the client side
        // const selectedClassStudents = await getClassStudentDetails(
        //   supabase,
        //   Number(selectPreviousClass.selectedClass)
        // );

        // Fetching previous class' students from the server side via route handler
        const response = await fetch(
          `/my-classes/api/students?class_id=${selectPreviousClass.selectedClass}`
        );
        const jsonData = await response.json();
        if (jsonData.error) throw new Error(jsonData.error);
        const selectedClassStudents = jsonData;
        addExistStudentsToRegister(
          selectedClassStudents.map((s: { student: Student }) => s.student)
        );
      } catch (error) {
        console.error(`${error}`);
        updateFetchError(true);
      }
    }
    fetchClassStudents();
  };

  return (
    <>
      {myClasses?.length && (
        <div className="flex flex-row items-center w-full mb-4">
          <label htmlFor="prevClass">Add previous class&apos; students</label>
          <input
            type="checkbox"
            id="prevClass"
            className="accent-gray ml-4"
            checked={selectPreviousClass.display}
            onChange={() =>
              setSelectPreviousClass({
                selectedClass: "",
                display: !selectPreviousClass.display,
              })
            }
          />
        </div>
      )}
      {selectPreviousClass.display && (
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
              onChange={(e) =>
                setSelectPreviousClass((prevState) => ({
                  ...prevState,
                  selectedClass: e.target.value,
                }))
              }
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
              onClick={(e) => addPrevClassStudentsToRegister(e)}
              disabled={selectPreviousClass.selectedClass.length === 0}
            >
              Add Class&apos; Students
            </button>
          </div>
        </fieldset>
      )}
    </>
  );
};

export default AddPrevClassStudents;
