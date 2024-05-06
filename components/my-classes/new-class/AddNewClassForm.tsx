"use client";

import { useState, useEffect } from "react";
import { useFormState } from "react-dom";

import FormSubmitButton from "../../authentication/FormSubmitButton";

import { calculateCurrentDate } from "@/utils/functions/calculateCurrentDate";

// import { createClient } from "@/utils/supabase/clients/browserClient";
// import { getYearGroupEnums } from "@/utils/supabase/db-server-queries/getYearGroupEnum";
// import { getPronounEnums } from "@/utils/supabase/db-server-queries/getPronounEnum";
// import { getClassStudentDetails } from "@/utils/supabase/db-server-queries/getClassStudents";

import { newClassAction } from "@/utils/supabase/form-actions/newClassAction";

import { Class, PreSaveStudent, Student } from "@/types/types";

import AddNewStudent from "./AddNewStudent";
import AddPrevClassStudents from "./AddPrevClassStudents";
import ClassRegister from "./ClassRegister";

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

const AddNewClassForm = ({
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

  const [pronounEnums, setPronounEnums] = useState([]);
  const [yearGroupEnums, setYearGroupEnums] = useState([]);

  const [newClassName, setNewClassName] = useState<string>("");
  const [yearGroup, setYearGroup] = useState<string>("");

  const [newStudent, setNewStudent] = useState<PreSaveStudent>({
    ...initialNewStudentState,
    organisation_id: organisationId,
  });
  const [newClassRegister, setNewClassRegister] = useState<
    Array<PreSaveStudent>
  >([]);

  const [fetchError, setFetchError] = useState(false);

  // const supabase = createClient();

  // Fetch pronoun enums directly from the client side
  // useEffect(() => {
  //   async function fetchEnums() {
  //     try {
  //       const pronounEnums = await getPronounEnums(supabase);
  //       setPronounEnums(pronounEnums);
  //     } catch (error) {
  //       console.error("Error fetching data:", error);
  //       setFetchError(true);
  //     }
  //   }
  //   fetchEnums();
  // }, []);

  // Fetch pronoun enums on the server via route handler
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/my-classes/api/pronouns");
        const jsonData = await response.json();
        if (jsonData.error) throw new Error(jsonData.error);
        setPronounEnums(jsonData);
      } catch (error) {
        console.error(`${error}`);
        setFetchError(true);
      }
    };
    fetchData();
  }, []);

  // Fetch year_group enums directly from the client side
  // useEffect(() => {
  //   async function fetchEnums() {
  //     try {
  //       const yearGroupEnums = await getYearGroupEnums(supabase);
  //       setYearGroupEnums(yearGroupEnums);
  //     } catch (error) {
  //       console.error("Error fetching data:", error);
  //       setFetchError(true);
  //     }
  //   }
  //   fetchEnums();
  // }, []);

  // Fetch yearGroup enums on the server via route handler
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/my-classes/api/year-group");
        const jsonData = await response.json();
        if (jsonData.error) throw new Error(jsonData.error);
        setYearGroupEnums(jsonData);
      } catch (error) {
        console.error(`${error}`);
        setFetchError(true);
      }
    };
    fetchData();
  }, []);

  function updateFetchError(bool: boolean) {
    setFetchError(bool);
  }

  if (fetchError) throw new Error();

  function addExistStudentsToRegister(selectedClassStudents: Array<Student>) {
    setNewClassRegister((prevState) => [
      ...prevState,
      ...selectedClassStudents,
    ]);
  }

  function updateNewStudent(value: string | boolean, field: string) {
    setNewStudent((oldState) => ({
      ...oldState,
      [field]: value,
    }));
  }

  function resetNewStudent() {
    setNewStudent({
      ...initialNewStudentState,
      organisation_id: organisationId,
    });
  }

  function addNewStudentToRegister(e: React.MouseEvent<HTMLButtonElement>) {
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
  }

  const handleDeleteStudentFromRegister = (index: number) => {
    const newList = [...newClassRegister];
    newList.splice(index, 1);
    setNewClassRegister(newList);
  };

  return (
    <form
      action={formAction}
      className="w-full h-full flex flex-col sm:w-3/4 md:w-1/2 mt-4 md:mt-8"
    >
      <div className="flex flex-1 flex-col">
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
        <div className="flex flex-col md:flex-row items-center mb-4">
          <label htmlFor="yearGroup" className="md:w-1/4">
            Year Group
          </label>
          <select
            name="yearGroup"
            className="w-full sm:w-3/4 rounded-md px-4 sm:py-2 bg-inherit border border-black"
            value={yearGroup}
            onChange={(e) => setYearGroup(e.target.value)}
          >
            <option value={""}>Select an option...</option>
            {yearGroupEnums.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>

        <AddPrevClassStudents
          myClasses={myClasses}
          addExistStudentsToRegister={addExistStudentsToRegister}
          updateFetchError={updateFetchError}
        />

        <AddNewStudent
          pronounsState={pronounEnums}
          newStudent={newStudent}
          updateNewStudent={updateNewStudent}
          resetNewStudent={resetNewStudent}
          addNewStudentToRegister={addNewStudentToRegister}
        />

        <ClassRegister
          newClassRegister={newClassRegister}
          handleDeleteStudentFromRegister={handleDeleteStudentFromRegister}
        />

        <input type="hidden" name="organisationId" value={organisationId} />
        <input type="hidden" name="academicYearEnd" value={academicYearEnd} />
        <input
          type="hidden"
          name="newClassRegister"
          value={JSON.stringify(newClassRegister)}
        />
      </div>
      <div className="flex justify-center">
        <FormSubmitButton buttonLabel="Save" />
        <button
          type="button"
          className="ml-2 mb-2 py-2 px-4 rounded-md no-underline bg-btn-background hover:bg-green-700 focus:bg-green-700 text-white"
          onClick={() => updateShowNewClassModal(false)}
        >
          Cancel
        </button>
      </div>
      {state?.errorMessage && (
        <p
          className="p-2 bg-foreground/10 text-foreground text-center text-sm text-red-500"
          aria-live="assertive"
        >
          {state.errorMessage}
        </p>
      )}
    </form>
  );
};

export default AddNewClassForm;
