"use client";

import { useState } from "react";

import { Student, Organisation, StudentComment } from "@/types/types";

import Button from "../Button";
import ReportPDF from "./ReportPDF";

const PupilReports = ({
  classStudents,
  signedUrls,
}: {
  classStudents: Array<{
    student: Student;
    class_id: number;
    student_id: number;
    id: number;
  }>;
  classSubjectGroupsDict: { [key: number]: string };
  signedUrls: Array<{ id: string; signedUrl: string } | null>; // this is the id from class_student table
}) => {
  const [selectedStudent, setSelectedStudent] = useState<Student>(
    classStudents[0].student
  );

  return (
    <div className="flex flex-col item-center md:flex-row md:justify-between md:m-8 gap-8 xl:gap-0">
      <div className="flex flex-row flex-wrap md:flex-col gap-2 justify-around md:justify-normal items-center m-4 md:m-0 md:gap-8 md:w-1/4">
        {classStudents.map((item) => (
          <Button
            key={item.student.id}
            label={`${item.student.surname}, ${item.student.forename}`}
            color="secondary-button"
            activeBorder={selectedStudent.id === item.student.id}
            onClick={() => setSelectedStudent(item.student)}
            width="w-20 md:w-full md:max-w-48"
          />
        ))}
      </div>
      <ReportPDF
        signedUrls={signedUrls}
        classStudents={classStudents}
        selectedStudent={selectedStudent}
      />
    </div>
  );
};
export default PupilReports;
