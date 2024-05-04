"use client";

import { useState, useEffect } from "react";
import { useFormState } from "react-dom";

import { MdDeleteForever } from "react-icons/md";

import { calculateCurrentDate } from "@/utils/functions/calculateCurrentDate";

// Issues as get request in a server function (supposed to be post requests)
import { getPronounEnums } from "@/utils/supabase/db-server-queries/getPronounEnum";
import { getClassStudentDetails } from "@/utils/supabase/db-server-queries/getClassStudents";

import { newClassAction } from "@/utils/form-actions/newClassAction";

import ModalOuter from "../modal-parent-components/ModalOuter";
import ModalInnerAdd from "../modal-parent-components/ModalInnerAdd";

import { Class, PreSaveStudent } from "@/types/types";

import AddNewStudent from "./AddNewStudent";
import AddPrevClassStudents from "./AddPrevClassStudents";

const { currentMonth, currentYear } = calculateCurrentDate();
const academicYearEnd = currentMonth < 8 ? currentYear : currentYear + 1;

const initialFormActionState = { errorMessage: "" };

const initialNewStudentState = {
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
}: {
  myClasses: Array<Class> | null;
  organisationId: number;
  updateShowNewClassModal: (bool: boolean) => void;
}) => {
  const [state, formAction] = useFormState(
    newClassAction,
    initialFormActionState
  );

  const [pronouns, setPronouns] = useState([]);
  const [newClassName, setNewClassName] = useState<string>("");
  const [yearGroup, setYearGroup] = useState("");
  const [selectPreviousClass, setSelectPreviousClass] = useState({
    display: false,
    selectedClass: "",
  });

  const [displayNewStudent, setDisplayNewStudent] = useState(false);
  const [newStudent, setNewStudent] = useState<PreSaveStudent>({
    ...initialNewStudentState,
    organisation_id: organisationId,
  });
  const [newClassRegister, setNewClassRegister] = useState<
    Array<PreSaveStudent>
  >([]);

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
  function updateNewStudent(value: string | boolean, field: string) {
    setNewStudent((oldState) => ({
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
      setNewClassRegister([
        ...newClassRegister,
        ...selectedClassStudents.map((s) => s.student),
      ]);
    }
    fetchClassStudents();
  };

  const addNewStudentToList = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault;
    setNewClassRegister(
      [
        ...newClassRegister,
        {
          ...newStudent,
        },
      ].sort((a, b) => {
        if (a.surname > b.surname) return 1;
        if (a.surname < b.surname) return -1;
        if (a.forename > b.forename) return 1;
        if (a.forename < b.forename) return -1;
        return 0;
      })
    );
    setNewStudent({
      ...initialNewStudentState,
      organisation_id: organisationId,
    });
  };

  const handleDeleteStudentFromList = (index: number) => {
    const newList = [...newClassRegister];
    newList.splice(index, 1);
    setNewClassRegister(newList);
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
        formAction={formAction}
        formState={state}
      >
        <div className="flex flex-col md:flex-row w-full items-center mb-4">
          <label htmlFor="className" className="md:w-1/4">
            Class Name
          </label>
          <input
            type="text"
            name="className"
            className="w-full md:w-3/4 rounded-md px-4 md:py-2 bg-inherit border border-black"
            value={newClassName}
            onChange={(e) => setNewClassName(e.target.value)}
            placeholder="e.g. Mulberry"
            required
          />
        </div>
        <div className="flex flex-col md:flex-row w-full items-center mb-4">
          <label htmlFor="yearGroup" className="md:w-1/4">
            Year Group
          </label>
          <input
            type="text"
            name="yearGroup"
            className="w-full md:w-3/4 rounded-md px-4 md:py-2 bg-inherit border border-black"
            value={yearGroup}
            onChange={(e) => setYearGroup(e.target.value)}
            placeholder="e.g. Year 6"
            required
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
          <label htmlFor="newStudent">Add new individual student[s]</label>
          <input
            type="checkbox"
            id="newStudent"
            className="accent-gray ml-4"
            checked={displayNewStudent}
            onChange={() => {
              setDisplayNewStudent(!displayNewStudent);
              setNewStudent({
                ...initialNewStudentState,
                organisation_id: organisationId,
              });
            }}
          />
        </div>
        {displayNewStudent && (
          <AddNewStudent
            newStudent={newStudent}
            updateNewStudent={updateNewStudent}
            pronounsState={pronouns}
            addNewStudentToList={addNewStudentToList}
          />
        )}

        <div className="flex flex-col w-full items-center mb-4">
          <label htmlFor="studentList">New Class Students</label>
          <div
            id="studentList"
            className="px-4 py-2 bg-inherit border border-black w-full h-16 md:h-32 overflow-y-auto"
          >
            <ul>
              {newClassRegister.map((student, index) => (
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
            <input
              type="hidden"
              name="newClassRegister"
              value={JSON.stringify(newClassRegister)}
            />
          </div>
        </div>
        <input type="hidden" name="organisationId" value={organisationId} />
        <input type="hidden" name="academicYearEnd" value={academicYearEnd} />
      </ModalInnerAdd>
    </ModalOuter>
  );
};

export default AddNewClassModal;
