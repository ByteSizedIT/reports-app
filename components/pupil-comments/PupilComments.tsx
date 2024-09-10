"use client";

import { useState, useEffect, useCallback, useMemo } from "react";

import { useRouter } from "next/navigation";

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

import Spinner from "../Spinner";

import { saveAsPDFs } from "@/app/server-actions/saveAsPdfs";

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
  const [pdfsPending, setPdfsPending] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);
  const [unsuccessfulPdfUploads, setUnsuccessfulPdfUploads] = useState<Array<{
    data: { path: string; fullPath: string };
    error: object | string | null;
    studentId: string;
    studentName: string;
    pdfFilename: number;
    key: number;
  }> | null>(null);

  const studentNames = useMemo(
    () => classStudents.map((student) => student.student.forename),
    [classStudents]
  );

  const updateConfirmedComments = useCallback(
    (data: StudentComment, subjectId: number) => {
      setConfirmedComments((prev) => {
        const newState = { ...prev };
        if (!newState[selectedStudent.id]) {
          newState[selectedStudent.id] = {};
        }
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

  const router = useRouter();

  useEffect(() => {
    async function getReports() {
      const pupilReports = await getStudentsGroupReports(selectedStudent.id);
      setSelectedStudentsGroupReports(pupilReports);
    }
    getReports();
  }, [selectedStudent, getStudentsGroupReports]);

  async function generatePupilReports(e: React.MouseEvent) {
    e.preventDefault();
    setError(false);
    setPdfsPending(true);
    try {
      let commentsToSave = confirmedComments;

      if (unsuccessfulPdfUploads?.length) {
        const unsuccessfulStudentIds = new Set(
          unsuccessfulPdfUploads.map((obj) => obj.studentId)
        );
        // Reduce down confirmedComments object to only include student reports from unsuccesfulPdfUploads
        commentsToSave = Object.keys(confirmedComments).reduce((acc, key) => {
          if (unsuccessfulStudentIds.has(key)) {
            acc[key] = confirmedComments[key];
          }
          return acc;
        }, {} as StudentsCommentsBySubject);
        setConfirmedComments(commentsToSave);
      }

      const { successfulUploads, unsuccessfulUploads } = await saveAsPDFs(
        orgId,
        classId,
        className,
        classYearGroup,
        academicYearEnd,
        classStudents,
        confirmedComments
      );
      if (unsuccessfulUploads.length > 0) {
        setPdfsPending(false);
        setUnsuccessfulPdfUploads(unsuccessfulUploads);
      } else router.push(`/my-classes/${classId}/pupil-reports`);
    } catch (error) {
      if (error instanceof Error)
        console.error("Error generating reports: ", error.message);
      else console.error("Error generating reports: ", error);
      setError(true);
    }
  }

  return (
    <>
      {pdfsPending && !error && (
        <Spinner text="Generating PDF reports for all students" />
      )}
      {error && (
        <div className="flex flex-1 flex-col items-center justify-center">
          <h2 className="m-4">Oops! Something went wrong...</h2>
          <p className="m-2 md:text-lg">
            An error occurred while generating the reports. Please try again
          </p>
          <p className="m-2 md:text-lg">
            If the problem persists and you think it&apos;s an error, please
            contact support
          </p>
        </div>
      )}
      {!pdfsPending && !error && unsuccessfulPdfUploads?.length && (
        <div className="flex flex-1 flex-col items-center justify-center">
          <p className="m-2 md:text-lg">
            The following student&apos;s reports could not be created:
          </p>
          <ul>
            {unsuccessfulPdfUploads.map((upload) => (
              <li key={Number(upload.studentId)}>{upload.studentName}</li>
            ))}
          </ul>
          <ButtonLink
            tooltipText={`Confirm all comments for each student before generating Pupil Reports`}
            label="Generate Pupil Reports"
            id="generate-pupils-btn"
            ariaDescribedBy="generate-pupils-tooltip"
            color="primary-button"
            href={`/my-classes/${classId}/pupil-reports`}
            onClickFunction={generatePupilReports}
          />
        </div>
      )}
      {!pdfsPending && !unsuccessfulPdfUploads && !error && (
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
                {!confirmedComments?.[item.student.id] ||
                (Object.values(confirmedComments?.[item.student.id]).length &&
                  Object.values(confirmedComments?.[item.student.id])?.some(
                    (comment: StudentComment | undefined) =>
                      comment === undefined
                  )) ? (
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
              onClickFunction={generatePupilReports}
            />
          </div>
          <div className="md:w-3/4">
            <div className="w-full flex flex-col gap-8">
              {selectedStudentsGroupReports
                .filter((i) => i.class_subject_group.length) // filter out subjects for which there is no entry in the class_subject_group array, having had all groups filtered out in getStudentReports function, as student id is not assigned to any of the groups
                .map((classSubject) => {
                  return (
                    <PupilSubjectComment
                      key={`${selectedStudent.id}.${classSubject.id}`}
                      classSubject={classSubject}
                      classId={classId}
                      studentNames={studentNames}
                      studentComment={
                        confirmedComments?.[selectedStudent.id]?.[
                          classSubject.subject.id
                        ]
                      }
                      // studentComments={confirmedComments?.[selectedStudent.id]}
                      selectedStudent={selectedStudent}
                      updateConfirmedComments={updateConfirmedComments}
                    />
                  );
                })}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PupilComments;
