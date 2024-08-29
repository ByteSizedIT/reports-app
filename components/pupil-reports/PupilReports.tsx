"use client";

import { useState, useEffect } from "react";

import { Student } from "@/types/types";

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
  function selectReport() {
    const classStudentId =
      classStudents[
        classStudents.findIndex(
          (classStudent) => classStudent.student_id === selectedStudent.id
        )
      ].id;

    const urlIndex = signedUrls.findIndex(
      (pdf) =>
        pdf?.id === // file name, without .pdf file type, equals the class_student table id
        `${classStudentId}.pdf`
    );

    const selectedUrl = signedUrls[urlIndex]?.signedUrl;

    return selectedUrl;
  }

  const [selectedStudent, setSelectedStudent] = useState<Student>(
    classStudents[0].student
  );
  const [selectedReport, setSelectedReport] = useState<
    string | undefined // File type required for use with react-pdf lib in ReportPDF component; string required for printJS below
  >(() => selectReport());

  // update selectedPdf on selectedStudent change
  useEffect(() => {
    setSelectedReport(() => selectReport());
  }, [selectedStudent]);

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
      <ReportPDF selectedReport={selectedReport} />
    </div>
  );
};
export default PupilReports;
