"use client";

import { useState } from "react";

import { Student } from "@/types/types";

import Button from "../Button";

const PupilSelect = ({
  classStudents,
}: {
  classStudents: Array<{
    student: Student;
    class_id: number;
    student_id: number;
  }>;
}) => {
  const [selectedStudent, setSelectedStudent] = useState<Student>(
    classStudents[0].student
  );
  return (
    <div className="flex flex-col item-center md:flex-row md:gap-8 md:m-8">
      <div className="flex flex-row flex-wrap md:flex-col gap-2 justify-around md:justify-normal m-4 md:m-0 md:gap-8 md:w-1/4">
        {classStudents.map((item) => (
          <Button
            key={item.student.id}
            label={`${item.student.surname}, ${item.student.forename}`}
            color="secondary-button"
            activeBorder={selectedStudent.id === item.student.id}
            onClick={() => setSelectedStudent(item.student)}
            width="w-20 md:w-full"
          />
        ))}
      </div>
      <div className="md:w-3/4 border border-slate-500 aspect-[210/297]"></div>
    </div>
  );
};
export default PupilSelect;
