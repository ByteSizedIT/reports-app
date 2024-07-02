"use client";

import { useState, useEffect, useCallback, useMemo } from "react";

import {
  Student,
  Subject,
  ClassSubjectGroupStudent,
  StudentComment,
} from "@/types/types";

import Button from "../Button";
import { PupilSubjectReport } from "./PupilSubjectReport";

const PupilReportComponent = ({
  classStudents,
  classSubjects,
  studentComments,
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
  studentComments: Array<StudentComment>;
}) => {
  const studentNames = useMemo(
    () => classStudents.map((student) => student.student.forename),
    [classStudents]
  );

  // Get reports for given/selected studentId
  const getStudentsGroupReports = useCallback(
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
  const [selectedStudentsGroupReports, setSelectedStudentsGroupReports] =
    useState<
      {
        id: any;
        class_subject_group: ClassSubjectGroupStudent[];
        subject: Subject;
      }[]
    >([]);

  useEffect(() => {
    const pupilReports = getStudentsGroupReports(selectedStudent);
    setSelectedStudentsGroupReports(pupilReports);
  }, [selectedStudent, getStudentsGroupReports]);

  return (
    <div className="flex flex-col item-center md:flex-row md:gap-8 md:m-8">
      {
        <>
          <div className="flex flex-row flex-wrap md:flex-col gap-2 justify-around md:justify-normal m-4 md:m-0 md:gap-8 md:w-1/4">
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
              {selectedStudentsGroupReports
                .filter((i) => i.class_subject_group.length) // filter out subjects for which there is no entry in the class_subject_group array, having had all groups filtered out in getStudentReports function, as student id is not assigned to any of the groups
                .map((item) => (
                  <PupilSubjectReport
                    key={`${selectedStudent}.${item.id}`}
                    item={item}
                    studentNames={studentNames}
                    studentComments={studentComments}
                    selectedStudent={selectedStudent}
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
