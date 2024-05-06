"use client";

import { PreSaveStudent } from "@/types/types";

import { MdDeleteForever } from "react-icons/md";

const ClassRegister = ({
  newClassRegister,
  handleDeleteStudentFromRegister,
}: {
  newClassRegister: Array<PreSaveStudent>;
  handleDeleteStudentFromRegister: (index: number) => void;
}) => {
  return (
    <div className="flex flex-col w-full items-center mb-4">
      <label htmlFor="studentList">New Class Students</label>
      <div
        id="classRegister"
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
                  handleDeleteStudentFromRegister(index);
                }}
              />
            </div>
          ))}
        </ul>
        {/* <input
          type="hidden"
          name="newClassRegister"
          value={JSON.stringify(newClassRegister)}
        /> */}
      </div>
    </div>
  );
};
export default ClassRegister;
