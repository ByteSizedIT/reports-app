"use client";

import { useState, useEffect } from "react";

import { MdDeleteForever } from "react-icons/md";

import ModalOuter from "./modal-parent-components/ModalOuter";
import ModalInnerAdd from "./modal-parent-components/ModalInnerAdd";

import { Class } from "@/types/types";

const AddNewClassModal = ({
  myClasses,
  updateShowNewClassModal,
  saveNewClass,
}: {
  myClasses: Array<Class> | null;
  updateShowNewClassModal: (bool: boolean) => void;
  saveNewClass: () => void;
}) => {
  const [newClassInput, setNewClassInput] = useState<string | undefined>(
    undefined
  );
  const [usePreviousClass, setUsePreviousClass] = useState(false);
  const [selectedClass, setSelectedClass] = useState("");
  const [firstNameInput, setFirstNameInput] = useState("");
  const [secondNameInput, setSecondNameInput] = useState("");
  const [studentList, setStudentList] = useState<
    Array<{ first: string; second: string }>
  >([]);

  useEffect(() => {
    setSelectedClass("");
  }, [usePreviousClass]);

  const fetchClassStudents = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault;
    console.log({ selectedClass });
  };

  const addInputToList = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault;
    if (firstNameInput?.trim() !== "" && secondNameInput?.trim() !== "") {
      setStudentList(
        [
          ...studentList,
          { first: firstNameInput?.trim(), second: secondNameInput?.trim() },
        ].sort((a, b) => {
          if (a.second > b.second) return 1;
          if (a.second < b.second) return -1;
          if (a.first > b.first) return 1;
          if (a.first < b.first) return -1;
          return 0;
        })
      );
      setFirstNameInput("");
      setSecondNameInput("");
    }
  };

  const handleDelete = (index: number) => {
    const newList = [...studentList];
    newList.splice(index, 1);
    setStudentList(newList);
  };

  return (
    <ModalOuter
      updateShowModal={updateShowNewClassModal}
      height="h-3/4"
      width="w-3/4"
    >
      <ModalInnerAdd
        title="Add New Class"
        updateShowModal={updateShowNewClassModal}
        saveContent={saveNewClass}
      >
        <form className="w-full flex-1 flex flex-col max-h-full sm:w-3/4 md:w-1/2 mt-4 md:mt-8">
          <div className="flex flex-col md:flex-row items-center mb-4">
            <label htmlFor="className" className="sm:w-1/4">
              Class Name
            </label>
            <input
              type="text"
              id="className"
              className="sm:w-3/4 rounded-md px-4 sm:py-2 bg-inherit border border-black"
              value={newClassInput}
              onChange={(e) => setNewClassInput(e.target.value)}
              placeholder="e.g. Mulberry"
            />
          </div>
          {myClasses?.length && (
            <div className="flex flex-row items-center mb-4">
              <label htmlFor="prevClass">
                Use previous class&apos; students
              </label>
              <input
                type="checkbox"
                id="prevClass"
                className="accent-gray ml-4"
                checked={usePreviousClass}
                onChange={() => setUsePreviousClass(!usePreviousClass)}
              />
            </div>
          )}
          {usePreviousClass && (
            <fieldset className="border border-black p-2 mb-4">
              <legend>Select Previous Class</legend>
              <div className="flex flex-col md:flex-row items-center mb-4">
                <label htmlFor="prevClassName" className="sm:w-1/4">
                  Previous Class
                </label>
                <select
                  id="className"
                  className="sm:w-3/4 rounded-md px-4 sm:py-2 bg-inherit border border-black"
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                >
                  <option value={""}>Select an option...</option>
                  {myClasses?.map((c: Class) => (
                    <option key={c.id} value={c.description}>
                      {c.description}
                    </option>
                  ))}
                </select>
              </div>
              <div className="text-center">
                <button
                  type="button"
                  className={`px-2 rounded-md no-underline border border-black ${
                    selectedClass.length === 0
                      ? "disabled:bg-slate-300"
                      : "hover:border-transparent hover:bg-green-700 focus:bg-green-700 hover:text-white focus:text-white"
                  }`}
                  onClick={(e) => fetchClassStudents(e)}
                  disabled={selectedClass.length === 0}
                >
                  Add Class&apos; Students
                </button>
              </div>
            </fieldset>
          )}
          <fieldset className="border border-black p-2 mb-4">
            <legend>Add Student</legend>
            <div className="flex flex-col sm:flex-row">
              <label htmlFor="addStudent" className="sm:w-1/4">
                First Name
              </label>
              <input
                type="text"
                id="addStudent"
                className="sm:w-3/4 rounded-md px-4 sm:py-2 bg-inherit border  border-black mb-4"
                value={firstNameInput}
                onChange={(e) => setFirstNameInput(e.target.value)}
                placeholder="e.g. Jo"
              />
            </div>
            <div className="w-full flex flex-col items-center sm:flex-row">
              <label htmlFor="addStudent" className="sm:w-1/4">
                Second Name
              </label>
              <input
                type="text"
                id="addStudent"
                className="sm:w-3/4 rounded-md px-4 sm:py-2 bg-inherit border border-black mb-4"
                value={secondNameInput}
                onChange={(e) => setSecondNameInput(e.target.value)}
                placeholder="e.g Bloggs"
              />
            </div>
            <div className="text-center">
              <button
                type="button"
                className={`px-2 rounded-md no-underline border border-black ${
                  firstNameInput.length === 0 || secondNameInput.length === 0
                    ? "disabled:bg-slate-300"
                    : "hover:border-transparent hover:bg-green-700 focus:bg-green-700 hover:text-white focus:text-white"
                }`}
                onClick={(e) => addInputToList(e)}
                disabled={
                  firstNameInput.length === 0 || secondNameInput.length === 0
                }
              >
                Add Student
              </button>
            </div>
          </fieldset>
          <div className="flex flex-col items-center mb-4">
            <label htmlFor="studentList">Added Students</label>
            <div
              id="studentList"
              className="px-4 py-2 bg-inherit border border-black w-full h-16 md:h-32 overflow-y-auto"
            >
              <ul>
                {studentList.map((student, index) => (
                  <div
                    key={index}
                    className="w-full flex flex-row items-center justify-between"
                  >
                    <li>{`${student.second}, ${student.first}`}</li>
                    <MdDeleteForever
                      className="text-xl sm:text-2xl"
                      onClick={() => {
                        handleDelete(index);
                      }}
                    />
                  </div>
                ))}
              </ul>
            </div>
          </div>
        </form>
      </ModalInnerAdd>
    </ModalOuter>
  );
};

export default AddNewClassModal;
