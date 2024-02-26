"use client";

import { Student } from "@/types/types";

const StudentEntry = ({ student }: { student: Student }) => {
  return (
    <p className="text-center border rounded-md border-slate-500 mb-2 p-2 bg-black">
      {`${student.forename}  ${student.surname}`.slice(0, 15)}{" "}
      {`${student.forename} ${student.surname}`.length > 15 ? "..." : ""}
    </p>
  );
};
export default StudentEntry;
