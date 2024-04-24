"use client";

import { useState, useEffect } from "react";

import { MdDeleteForever } from "react-icons/md";

import { getPronounEnums } from "@/utils/supabase/db-server-queries/getPronounEnum";
import { getClassStudentDetails } from "@/utils/supabase/db-server-queries/getClassStudents";

import ModalOuter from "../modal-parent-components/ModalOuter";
import ModalInnerAdd from "../modal-parent-components/ModalInnerAdd";

import { Class, PreSaveStudent } from "@/types/types";
import AddNewStudent from "./AddNewStudent";

const initialAddStudentState = {
  display: false,
  forename: "",
  surname: "",
  pronoun: "",
  dob: "",
  grad_year: 0,
};

const AddNewClassModal = ({
  myClasses,
  organisationId,
  updateShowNewClassModal,
  saveNewClass,
}: {
  myClasses: Array<Class> | null;
  organisationId: number;
  updateShowNewClassModal: (bool: boolean) => void;
  saveNewClass: () => void;
}) => {
  const [pronouns, setPronouns] = useState([]);
  const [newClassName, setNewClassName] = useState<string>("");
  const [yearGroupInput, setYearGroupInput] = useState("");
  const [addPreviousStudents, setAddPreviousStudents] = useState({
    display: false,
    selectedClass: "",
  });
  const [addStudent, setAddStudent] = useState<
    PreSaveStudent & { display?: boolean }
  >({ ...initialAddStudentState, organisation_id: organisationId });
  const [studentList, setStudentList] = useState<Array<PreSaveStudent>>([]);

  useEffect(() => {
    async function fetchPronouns() {
      const pronounEnums = await getPronounEnums();
      setPronouns(pronounEnums);
    }
    fetchPronouns();
  }, []);

  // e: React.ChangeEvent<HTMLInputElement>,
  function updateAddStudentState(value: string | boolean, field: string) {
    setAddStudent((oldState) => ({
      ...oldState,
      [field]: value,
    }));
  }

  const addPrevClassStudentsToList = (
    e: React.MouseEvent<HTMLButtonElement>
  ) => {
    e.preventDefault;
    async function fetchClassStudents() {
      const selectedClassStudents = await getClassStudentDetails(
        Number(addPreviousStudents.selectedClass)
      );
      setStudentList([
        ...studentList,
        ...selectedClassStudents.map((s) => s.student),
      ]);
    }
    fetchClassStudents();
  };

  const addInputToList = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault;
    setStudentList(
      [
        ...studentList,
        {
          ...addStudent,
        },
      ].sort((a, b) => {
        if (a.surname > b.surname) return 1;
        if (a.surname < b.surname) return -1;
        if (a.forename > b.forename) return 1;
        if (a.forename < b.forename) return -1;
        return 0;
      })
    );
    setAddStudent({
      ...initialAddStudentState,
      organisation_id: organisationId,
      display: true,
    });
  };

  const handleDeleteStudentFromList = (index: number) => {
    const newList = [...studentList];
    newList.splice(index, 1);
    setStudentList(newList);
  };

  const handleSaveNewClass = () => {
    // Save new class to Class table  - user entered fields(description/year_group), autopop other fields(academic_year_end/owner/org_id - calculating academic-year-end based on current month)

    // Save new students in StudentList to Students table - user entered fields(first_name, second_name, pronoun, dob, grad year)
    // Convert the selected dob to ISO 8601 string
    // const isoDateString = new Date(dobInput).toISOString();

    updateShowNewClassModal(false);
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
        saveContent={handleSaveNewClass}
      >
        {/* <form className="w-full flex-1 flex flex-col max-h-full sm:w-3/4 md:w-1/2 mt-4 md:mt-8"> */}
        <form className="w-full flex-1 flex flex-col max-h-full sm:w-3/4 md:w-1/2 mt-4 md:mt-8">
          <div className="flex flex-col md:flex-row items-center mb-4">
            <label htmlFor="className" className="sm:w-1/4">
              Class Name
            </label>
            <input
              type="text"
              id="className"
              className="w-full sm:w-3/4 rounded-md px-4 sm:py-2 bg-inherit border border-black"
              value={newClassName}
              onChange={(e) => setNewClassName(e.target.value)}
              placeholder="e.g. Mulberry"
            />
          </div>
          <div className="flex flex-col md:flex-row items-center mb-4">
            <label htmlFor="yearGroup" className="sm:w-1/4">
              Year Group
            </label>
            <input
              type="text"
              id="yearGroup"
              className="w-full sm:w-3/4 rounded-md px-4 sm:py-2 bg-inherit border border-black"
              value={yearGroupInput}
              onChange={(e) => setYearGroupInput(e.target.value)}
              placeholder="e.g. Year 6"
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
                checked={addPreviousStudents.display}
                onChange={() =>
                  setAddPreviousStudents({
                    ...addPreviousStudents,
                    display: !addPreviousStudents.display,
                  })
                }
              />
            </div>
          )}
          {addPreviousStudents.display && (
            <fieldset className="border border-black p-2 mb-4">
              <legend>Select Previous Class</legend>
              <div className="flex flex-col md:flex-row items-center mb-4">
                <label htmlFor="prevClassName" className="sm:w-1/4">
                  Previous Class
                </label>
                <select
                  id="prevClassName"
                  className="w-full sm:w-3/4 rounded-md px-4 sm:py-2 bg-inherit border border-black"
                  value={addPreviousStudents.selectedClass}
                  onChange={(e) =>
                    setAddPreviousStudents(() => ({
                      ...addPreviousStudents,
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
                    addPreviousStudents.selectedClass.length === 0
                      ? "disabled:bg-slate-300"
                      : "hover:border-transparent hover:bg-green-700 focus:bg-green-700 hover:text-white focus:text-white"
                  }`}
                  onClick={(e) => addPrevClassStudentsToList(e)}
                  disabled={addPreviousStudents.selectedClass.length === 0}
                >
                  Add Class&apos; Students
                </button>
              </div>
            </fieldset>
          )}

          <div className="flex flex-row items-center mb-4">
            <label htmlFor="addStudent">Add new individual student[s]</label>
            <input
              type="checkbox"
              id="addStudent"
              className="accent-gray ml-4"
              checked={addStudent.display}
              onChange={(e) =>
                updateAddStudentState(e.target.checked, "display")
              }
            />
          </div>
          {addStudent.display && (
            <AddNewStudent
              addStudentState={addStudent}
              updateAddStudentState={updateAddStudentState}
              pronounsState={pronouns}
              addInputToList={addInputToList}
            />
          )}

          {(addPreviousStudents.display || addStudent.display) && (
            <div className="flex flex-col items-center mb-4">
              <label htmlFor="studentList">New Class Students</label>
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
                      <li>{`${student.surname}, ${student.forename}`}</li>

                      <MdDeleteForever
                        className="text-xl sm:text-2xl"
                        onClick={() => {
                          handleDeleteStudentFromList(index);
                        }}
                      />
                    </div>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </form>
      </ModalInnerAdd>
    </ModalOuter>
  );
};

export default AddNewClassModal;
