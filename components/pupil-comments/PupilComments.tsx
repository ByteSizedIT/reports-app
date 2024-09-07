"use client";

import { useState, useEffect, useCallback, useMemo } from "react";

import { PiWarning } from "react-icons/pi";
import { FaCheck } from "react-icons/fa6";

import {
  Student,
  Subject,
  ClassSubjectGroupStudent,
  StudentComment,
  StudentsCommentsBySubject,
} from "@/types/types";

import Button from "../Button";
import ButtonLink from "../ButtonLink";

import { PupilSubjectComment } from "./PupilSubjectComment";

const PupilComments = ({
  orgId,
  classId,
  className,
  classYearGroup,
  academicYearEnd,
  classStudents,
  classSubjects,
  studentsCommentsBySubject,
}: {
  orgId: number;
  classId: number;
  className: string;
  classYearGroup: string;
  academicYearEnd: number;
  classStudents: Array<{
    student: Student;
    class_id: number;
    student_id: number;
  }>;
  classSubjects: Array<{
    id: number;
    subject: Subject;
    class_subject_group: Array<ClassSubjectGroupStudent>;
  }>;
  studentsCommentsBySubject: StudentsCommentsBySubject;
}) => {
  const [confirmedComments, setConfirmedComments] =
    useState<StudentsCommentsBySubject>(studentsCommentsBySubject);
  const [selectedStudent, setSelectedStudent] = useState<Student>(
    classStudents[0].student
  );
  const [selectedStudentsGroupReports, setSelectedStudentsGroupReports] =
    useState<
      {
        id: any;
        class_subject_group: ClassSubjectGroupStudent[];
        subject: Subject;
      }[]
    >([]);

  const studentNames = useMemo(
    () => classStudents.map((student) => student.student.forename),
    [classStudents]
  );

  const updateConfirmedComments = useCallback(
    (data: StudentComment, subjectId: number) => {
      setConfirmedComments((prev) => {
        const newState = { ...prev };
        newState[selectedStudent.id][subjectId] = { ...data };
        return newState;
      });
    },
    [selectedStudent.id]
  );

  // Get reports for given/selected studentId
  const getStudentsGroupReports = useCallback(
    async (studentId: number) => {
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

  useEffect(() => {
    async function getReports() {
      const pupilReports = await getStudentsGroupReports(selectedStudent.id);
      setSelectedStudentsGroupReports(pupilReports);
    }
    getReports();
  }, [selectedStudent, getStudentsGroupReports]);

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
          >
            {confirmedComments &&
            Object.values(confirmedComments?.[item.student.id]).some(
              (comment: {} | undefined) => comment === undefined
            ) ? (
              <PiWarning color="red" />
            ) : (
              <FaCheck />
            )}
          </Button>
        ))}
        <ButtonLink
          tooltipText={`Confirm all comments for each student before generating Pupil Reports`}
          label="Generate Pupil Reports"
          id="generate-pupils-btn"
          ariaDescribedBy="generate-pupils-tooltip"
          color="primary-button"
          href={`/my-classes/${classId}/pupil-reports`}
          disabled={Object.values(confirmedComments)
            .flatMap((group) => Object.values(group))
            .some((item) => item === undefined)}
        />
      </div>
      <div className="md:w-3/4">
        <div className="w-full flex flex-col gap-8">
          {selectedStudentsGroupReports
            .filter((i) => i.class_subject_group.length) // filter out subjects for which there is no entry in the class_subject_group array, having had all groups filtered out in getStudentReports function, as student id is not assigned to any of the groups
            .map((classSubject) => {
              return (
                <PupilSubjectComment
                  key={`${selectedStudent}.${
                    classSubject.class_subject_group?.[0]?.id as number
                  }`}
                  classSubject={classSubject}
                  classId={classId}
                  studentNames={studentNames}
                  studentComment={
                    confirmedComments?.[selectedStudent.id][
                      classSubject.subject.id
                    ]
                  }
                  selectedStudent={selectedStudent}
                  updateConfirmedComments={updateConfirmedComments}
                />
              );
            })}
        </div>
      </div>
    </div>
  );
};

export default PupilComments;
