"use client";

import { useState, useEffect, useCallback, useMemo } from "react";

import { PiWarning } from "react-icons/pi";
import { FaCheck } from "react-icons/fa6";

import {
  Student,
  Subject,
  ClassSubjectGroupStudent,
  StudentComment,
} from "@/types/types";

import Button from "../Button";
import { PupilSubjectReport } from "./PupilSubjectReport";

const PupilReportComponent = ({
  classId,
  classStudents,
  classSubjects,
  studentComments,
}: {
  classId: number;
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
  studentComments: Array<StudentComment>;
}) => {
  const [studentCommentsState, setStudentCommentsState] =
    useState<Array<StudentComment>>(studentComments);

  const calcConfirmedComments = useCallback(() => {
    // Create an object, with a key for each studentId, and a value that is also an object. The nested object for each studentId should have their assigned classSubjectGroupIds (or subjectIds) as keys, and a boolean OR the comments themselves as values - indicating whether a studentComment entry exists for the given classSubjectGroupId/subjectId )
    return classStudents.reduce((accum, student) => {
      const thisStudentsClassGroups = classSubjects.reduce(
        (accum, classSubject) => {
          const classGroupIds = classSubject.class_subject_group
            .filter((classSubjectGroup) =>
              classSubjectGroup.class_subject_group_student.some(
                (groupStudent) => student.student_id === groupStudent.student.id
              )
            )
            .map((classSubjectGroup) => classSubjectGroup.id);

          return [...accum, ...classGroupIds];
        },
        [] as number[]
      );
      // ALT METHOD
      // const thisStudentsClassGroups = classSubjects.reduce(
      //   (innerAccum, classSubject) => {
      //     const classGroupIds = classSubject.class_subject_group.reduce(
      //       (groupAccum, classSubjectGroup) => {
      //         if (
      //           classSubjectGroup.class_subject_group_student.some(
      //             (groupStudent) =>
      //               student.student_id === groupStudent.student.id
      //           )
      //         ) {
      //           groupAccum.push(classSubjectGroup.id);
      //         }
      //         return groupAccum;
      //       },
      //       [] as number[] // Accumulate directly into an array of numbers
      //     );

      //     return innerAccum.concat(classGroupIds); // Concatenate results
      //   },
      //   [] as number[] // Inner accumulator is a flat array of numbers
      // );

      const thisStudentsCommentsArr = studentCommentsState.filter(
        (comment) => comment.student_id === student.student.id
      );

      // const thisStudentsCommentStatus: { [key: string]: boolean } = {};
      const thisStudentsCommentStatus: {
        [key: string]: StudentComment | undefined;
      } = {};

      thisStudentsClassGroups.forEach((classGroup) => {
        const index = thisStudentsCommentsArr.findIndex(
          (comment) => comment.class_subject_group_id === classGroup
        );
        index === -1
          ? // ? (thisStudentsCommentStatus[classGroup] = false)
            // : (thisStudentsCommentStatus[classGroup] = true);
            (thisStudentsCommentStatus[classGroup] = undefined)
          : (thisStudentsCommentStatus[classGroup] =
              thisStudentsCommentsArr[index]);
      });

      return {
        ...accum,
        [student.student.id]: thisStudentsCommentStatus,
      };
    }, {});
  }, [classSubjects, classStudents, studentCommentsState]);

  const [confirmedComments, setConfirmedComments] = useState<
    | {
        [key: number]: { [key: number]: StudentComment | undefined };
      }
    | undefined
  >(() => calcConfirmedComments());

  useEffect(() => {
    setConfirmedComments(calcConfirmedComments);
  }, [calcConfirmedComments]);

  useEffect(() => console.log({ confirmedComments }), [confirmedComments]);

  const updateStudentCommentsState = useCallback((data: StudentComment) => {
    const {
      id,
      student_id,
      class_id,
      student_comment,
      group_comment_updated,
      class_subject_group_id,
    } = data;
    setStudentCommentsState((prev) => {
      const index = prev.findIndex((comment) => comment.id === id);
      if (index !== -1) {
        const newState = [...prev];
        newState[index].student_comment = student_comment;
        newState[index].group_comment_updated = group_comment_updated;
        return newState;
      } else {
        return [
          ...prev,
          {
            id,
            student_id,
            student_comment,
            class_id,
            class_subject_group_id,
            group_comment_updated,
          },
        ];
      }
    });
  }, []);

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
      {
        <>
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
                Object.values(confirmedComments?.[item.student.id])
                .some((comment: {} | undefined) => comment === undefined) ? (
                  <PiWarning color="red" />
                ) : (
                  <FaCheck />
                )}
              </Button>
            ))}
          </div>
          <div className="md:w-3/4">
            <div className="w-full flex flex-col gap-8">
              {selectedStudentsGroupReports
                .filter((i) => i.class_subject_group.length) // filter out subjects for which there is no entry in the class_subject_group array, having had all groups filtered out in getStudentReports function, as student id is not assigned to any of the groups
                .map((classSubject) => {
                  return (
                    <PupilSubjectReport
                      key={`${selectedStudent}.${classSubject.class_subject_group?.[0]?.id}`}
                      classSubject={classSubject}
                      classId={classId}
                      studentNames={studentNames}
                      studentCommentsState={studentCommentsState}
                      selectedStudent={selectedStudent}
                      updateStudentCommentsState={updateStudentCommentsState}
                    />
                  );
                })}
            </div>
          </div>
        </>
      }
    </div>
  );
};

export default PupilReportComponent;
