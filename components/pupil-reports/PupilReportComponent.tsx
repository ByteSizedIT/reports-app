"use client";

import { useState } from "react";

import { Student } from "@/types/types";

import Button from "../Button";

const PupilReportComponent = ({
  classStudents,
}: {
  classStudents: Array<{
    student: Student;
    class_id: number;
    student_id: number;
  }>;
}) => {
  const [selectedStudent, setSelectedStudent] = useState<number>(
    classStudents[0].student.id
  );

  return (
    <div className="flex flex-col md:flex-row md:gap-8 m-8">
      {
        <>
          <div className="flex flex-row flex-wrap md:flex-col gap-8 md:w-1/4">
            {classStudents.map((item) => (
              <Button
                key={item.student.id}
                label={`${item.student.surname}, ${item.student.forename}`}
                color="secondary-button"
                activeBorder={selectedStudent === item.student.id}
                onClick={() => setSelectedStudent(item.student.id)}
                width="w-20 md:w-full"
              />
            ))}
          </div>
          <div className="md:w-3/4"></div>
        </>
      }
    </div>
  );
};
export default PupilReportComponent;
