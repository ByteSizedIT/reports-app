"use client";

import { useState, useEffect, useCallback } from "react";

import { Student, Subject, ClassSubjectGroupStudent } from "@/types/types";

import Button from "../Button";
import { PupilSubjectReport } from "./PupilSubjectReport";

const PupilReportComponent = ({
  classStudents,
  classSubjects,
}: {
  classStudents: Array<{
    student: Student;
    class_id: number;
    student_id: number;
  }>;
  classSubjects: Array<{
    id: any;
    subject: Subject;
    class_subject_group: Array<ClassSubjectGroupStudent>;
  }>;
}) => {
  // Get reports for given/selected studentId
  const getStudentReports = useCallback(
    (studentId: number) => {
      return classSubjects.map((item) => ({
        id: item.id,
        class_subject_group: item.class_subject_group.filter(
          (group) =>
            group.class_subject_group_student.some(
              (student) => student.student.id === studentId
            ) && group.report_group.id !== 160 // filter out ClassRegisters (not report groups)
        ),
        subject: item.subject,
      }));
    },
    [classSubjects]
  );

  const [selectedStudent, setSelectedStudent] = useState<number>(
    classStudents[0].student.id
  );
  const [selectedStudentReports, setSelectedStudentReports] = useState(
    getStudentReports(selectedStudent)
  );
  const [studentComment, setStudentComment] = useState<Array<string>>();

  useEffect(() => {
    const pupilReports = getStudentReports(selectedStudent);
    setSelectedStudentReports(pupilReports);
  }, [selectedStudent, getStudentReports]);

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
          <div className="md:w-3/4">
            <div className="w-full flex flex-col gap-8">
              {selectedStudentReports
                .filter((i) => i.class_subject_group.length) // filter out subjects for which there is no entry in the class_subject_group array, having had all groups filtered out in getStudentReports function, as student id is not assigned to any of the groups
                .map((item, index) => (
                  <PupilSubjectReport
                    key={item.id}
                    item={item}
                    index={index}
                    selectedPupil={selectedStudent}
                    studentComment={studentComment}
                  />
                ))}
            </div>
          </div>
        </>
      }
    </div>
  );
};
export default PupilReportComponent;
