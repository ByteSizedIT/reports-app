"use client";

import { useState, useEffect } from "react";

import { Student } from "@/types/types";

import Button from "../Button";
import ReportPDF from "./ReportPDF";

import printJS from "print-js";

import mergePdfs from "@/utils/functions/mergePdfs";

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
    string | File | undefined // File type required for use with react-pdf lib in ReportPDF component; string required for printJS below
  >(() => selectReport());

  // update selectedPdf on selectedStudent change
  useEffect(() => {
    setSelectedReport(() => selectReport());
  }, [selectedStudent]);

  function printSelected() {
    if (typeof selectedReport === "string") {
      printJS(selectedReport);
    }
    // typeguard preferred to casting with as, selected report maybe undefined. TODO: throw error when mapping through fetched reports and one is missing - currently returning null, which wld result in undefined when using selectReport function above to set state
  }

  async function printAll() {
    const urlArr = signedUrls
      .map((item) => item?.signedUrl)
      .filter((signedUrl) => signedUrl !== undefined) as Array<string>; // filter method used as signedUrl maybe undefined. TODO: throw error when mapping through fetched reports and one is missing - currently returning null, which wld result in signedUrl being undefined when  mapped here

    const mergedPdfBytes = await mergePdfs(urlArr);

    const blob = new Blob([mergedPdfBytes], { type: "application/pdf" });

    //  URL is built-in global object in the browser's JavaScript environment as part of WEB API
    printJS(URL.createObjectURL(blob));
  }

  return (
    <>
      <div className="flex justify-center my-2 md:my-4 gap-4 md:gap-8">
        <Button
          label="Print Selected"
          color="primary-button"
          onClick={() => printSelected()}
          width="w-20 md:w-full md:max-w-48"
        />
        <Button
          label="Print All"
          color="primary-button"
          onClick={() => printAll()}
          width="w-20 md:w-full md:max-w-48"
        />
      </div>

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
          selectedReport={selectedReport}
          selectedStudent={selectedStudent}
        />
      </div>
    </>
  );
};
export default PupilReports;
