"use client";

import { useState, useEffect } from "react";

import { MdDeleteForever } from "react-icons/md";

import { getPronounEnums } from "@/utils/supabase/db-server-queries/getPronounEnum";
import { getClassStudentDetails } from "@/utils/supabase/db-server-queries/getClassStudents";

import ModalOuter from "../modal-parent-components/ModalOuter";
import ModalInnerAdd from "../modal-parent-components/ModalInnerAdd";

import { Class, PreSaveStudent } from "@/types/types";
import AddNewStudent from "./AddNewStudent";
import AddPrevClassStudents from "./AddPrevClassStudents";

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
  const [selectPreviousClass, setSelectPreviousClass] = useState({
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

  function updateSelectPreviousClass(selectedClass: string) {
    setSelectPreviousClass((oldState) => ({
      ...oldState,
      selectedClass,
    }));
  }

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
        Number(selectPreviousClass.selectedClass)
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
        <div className="flex flex-col md:flex-row w-full items-center mb-4">
          <label htmlFor="className" className="md:w-1/4">
            Class Name
          </label>
          <input
            type="text"
            id="className"
            className="w-full md:w-3/4 rounded-md px-4 md:py-2 bg-inherit border border-black"
            value={newClassName}
            onChange={(e) => setNewClassName(e.target.value)}
            placeholder="e.g. Mulberry"
          />
        </div>
        <div className="flex flex-col md:flex-row w-full items-center mb-4">
          <label htmlFor="yearGroup" className="md:w-1/4">
            Year Group
          </label>
          <input
            type="text"
            id="yearGroup"
            className="w-full md:w-3/4 rounded-md px-4 md:py-2 bg-inherit border border-black"
            value={yearGroupInput}
            onChange={(e) => setYearGroupInput(e.target.value)}
            placeholder="e.g. Year 6"
          />
        </div>
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
          <AddPrevClassStudents
            selectPreviousClass={selectPreviousClass}
            updateSelectPreviousClass={updateSelectPreviousClass}
            addPrevClassStudentsToList={addPrevClassStudentsToList}
            myClasses={myClasses}
          />
        )}

        <div className="flex flex-row w-full items-center mb-4">
          <label htmlFor="addStudent">Add new individual student[s]</label>
          <input
            type="checkbox"
            id="addStudent"
            className="accent-gray ml-4"
            checked={addStudent.display}
            onChange={(e) => updateAddStudentState(e.target.checked, "display")}
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

        <div className="flex flex-col w-full items-center mb-4">
          <label htmlFor="studentList">New Class Students</label>
          <div
            id="studentList"
            className="px-4 py-2 bg-inherit border border-black w-full h-16 md:h-32 overflow-y-auto"
          >
            <ul>
              {studentList.map((student, index) => (
                <div
                  key={index}
                  className="flex flex-row w-full items-center justify-between"
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
      </ModalInnerAdd>
    </ModalOuter>
  );
};

export default AddNewClassModal;
