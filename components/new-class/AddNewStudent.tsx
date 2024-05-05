"use client";

import { PreSaveStudent } from "@/types/types";

import { generateYearsArray } from "@/utils/functions/generateYearsArray";

const AddNewStudent = ({
  newStudent,
  updateNewStudent,
  pronounsState,
  addNewStudentToRegister,
}: {
  newStudent: PreSaveStudent & { display?: boolean };
  pronounsState: Array<string>;
  updateNewStudent: (value: string, field: string) => void;
  addNewStudentToRegister: (e: React.MouseEvent<HTMLButtonElement>) => void;
}) => {
  const { forename, surname, pronoun, dob, grad_year } = newStudent;
  const missingDetails = [forename, surname, pronoun, dob, grad_year].some(
    (value) =>
      !value ||
      (typeof value === "string" && value.length === 0) ||
      (typeof value === "number" && value === 0)
  );

  return (
    <fieldset className="border border-black w-full p-2 mb-4">
      <legend>Add New Student</legend>
      <div className="flex flex-col items-center md:flex-row">
        <label htmlFor="firstName" className="md:w-1/4">
          First Name
        </label>
        <input
          type="text"
          id="firstName"
          className="w-full sm:w-3/4 rounded-md px-4 sm:py-2 bg-inherit border border-black mb-4"
          value={newStudent.forename}
          onChange={(e) => updateNewStudent(e.target.value.trim(), "forename")}
          placeholder="e.g. Jo"
        />
      </div>
      <div className="flex flex-col items-center md:flex-row">
        <label htmlFor="secondName" className="md:w-1/4">
          Second Name
        </label>
        <input
          type="text"
          id="secondName"
          className="w-full sm:w-3/4 rounded-md px-4 sm:py-2 bg-inherit border border-black mb-4"
          value={newStudent.surname}
          onChange={(e) => updateNewStudent(e.target.value.trim(), "surname")}
          placeholder="e.g Bloggs"
        />
      </div>
      <div className="flex flex-col md:flex-row items-center mb-4">
        <label htmlFor="pronouns" className="md:w-1/4">
          Pronouns
        </label>
        <select
          id="pronouns"
          className="w-full sm:w-3/4 rounded-md px-4 sm:py-2 bg-inherit border border-black"
          value={newStudent.pronoun}
          onChange={(e) => updateNewStudent(e.target.value, "pronoun")}
        >
          <option value={""}>Select an option...</option>
          {pronounsState.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </div>
      <div className="flex flex-col md:flex-row items-center mb-4">
        <label htmlFor="className" className="md:w-1/4">
          Date of Birth
        </label>
        <input
          type="date"
          id="className"
          className="w-full sm:w-3/4 rounded-md px-4 sm:py-2 bg-inherit border border-black"
          value={newStudent.dob}
          onChange={(e) => updateNewStudent(e.target.value.trim(), "dob")}
          placeholder="e.g. Year 6"
        />
      </div>
      <div className="flex flex-col md:flex-row items-center mb-4">
        <label htmlFor="gradYear" className="md:w-1/4">
          Graduation Year
        </label>
        <select
          id="gradYear"
          className="w-full sm:w-3/4 rounded-md px-4 sm:py-2 bg-inherit border border-black"
          value={newStudent.grad_year}
          onChange={(e) => updateNewStudent(e.target.value.trim(), "grad_year")}
        >
          <option value={""}>Select an option...</option>
          {generateYearsArray(6).map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>
      <div className="text-center">
        <button
          type="button"
          className={`px-2 rounded-md no-underline border border-black ${
            missingDetails
              ? "disabled:bg-slate-300"
              : "hover:border-transparent hover:bg-green-700 focus:bg-green-700 hover:text-white focus:text-white"
          }`}
          onClick={(e) => addNewStudentToRegister(e)}
          disabled={missingDetails}
        >
          Add Student
        </button>
      </div>
    </fieldset>
  );
};
export default AddNewStudent;
