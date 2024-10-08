"use client";

import { useState, useEffect } from "react";

import { DragDropContext } from "@hello-pangea/dnd";
import type { DropResult } from "@hello-pangea/dnd";

import { ClassDetails } from "@/types/types";

import Column from "./Column";
import NewColumn from "./NewColumn";
import MessageModal from "./MessageModal";
import Button from "../Button";

import { createClient } from "@/utils/supabase/clients/browserClient";
import Link from "next/link";

const SubjectReportGroups = ({
  classDataState,
  updateClassDataState,
  displayedSubjectId,
}: {
  classDataState: ClassDetails;
  updateClassDataState: (newData: ClassDetails) => void;
  displayedSubjectId: number | undefined;
}) => {
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [warningMessage, setWarningMessage] = useState("");
  const [groupReportsComplete, setGroupReportsComplete] = useState(false);

  const displayedSubjectIndex = classDataState.class_subject.findIndex(
    (s) => s.id === displayedSubjectId
  );
  const displayedSubjectReportGroups =
    classDataState.class_subject?.[displayedSubjectIndex]?.class_subject_group;

  useEffect(() => {
    if (displayedSubjectId) {
      const reportsWritten = classDataState.class_subject
        .flatMap((subject) => subject.class_subject_group)
        .filter(
          (subject) => subject.report_group.description !== "Class Register"
        )

        .every((group) => group.group_comment !== null);
      setGroupReportsComplete(reportsWritten);
    }
  }, [classDataState, displayedSubjectId, displayedSubjectReportGroups]);

  function onDragStart() {}
  function onDragUpdate() {}
  function onDragEnd(result: DropResult) {
    // syncronously update state to reflect the drag/drop result
    // NB this code optimistically updates UI without updates yet persisting in DB

    const { draggableId, source, destination } = result;

    updateLocalColumns(
      source.droppableId,
      source.index,
      draggableId,
      false,
      destination?.droppableId,
      destination?.index
    );
  }

  function updateLocalColumns(
    oldColumn: string,
    oldColumnIndex: number,
    studentId: string,
    resolvingError: boolean,
    newColumn?: string,
    newColumnIndex?: number
  ) {
    // check if there is no destination - it was dropped outside
    if (!newColumn || newColumnIndex === undefined) return;

    // check whether location of draggable didn't changed
    if (newColumn === oldColumn && newColumnIndex === oldColumnIndex) {
      return;
    }

    const startColumn =
      displayedSubjectReportGroups[
        displayedSubjectReportGroups.findIndex(
          (group) => group.id === Number(oldColumn)
        )
      ];

    const finishColumn =
      displayedSubjectReportGroups[
        displayedSubjectReportGroups.findIndex(
          (group) => group.id === Number(newColumn)
        )
      ];

    const newClassData = { ...classDataState };

    // create copy of studentsArr in start column
    const newStartStudentsArr = Array.from(
      startColumn.class_subject_group_student
    );

    // move student from source index in copy of start studentArr
    const movedItem = newStartStudentsArr.splice(oldColumnIndex, 1);

    if (startColumn.report_group.id === finishColumn.report_group.id) {
      // if student is dragged and dropped within same reportGroup column...
      // ... add student into the destination index in the start studentArr, removing 0 items
      newStartStudentsArr.splice(newColumnIndex, 0, ...movedItem);
    } else {
      // if student is dragged and dropped between differing reportGroup columns...
      // ... move student to new index in copy of destination studentArr, removing 0 items
      const newFinishStudentsArr = Array.from(
        finishColumn.class_subject_group_student
      );
      newFinishStudentsArr.splice(newColumnIndex, 0, ...movedItem);

      // update destination studentArr in a copy of classData
      newClassData.class_subject[displayedSubjectIndex].class_subject_group[
        displayedSubjectReportGroups.findIndex(
          (group) => group.id === Number(newColumn)
        )
      ].class_subject_group_student = [...newFinishStudentsArr];
    }

    // update startStudentsArr in a copy of classData
    newClassData.class_subject[displayedSubjectIndex].class_subject_group[
      displayedSubjectReportGroups.findIndex(
        (group) => group.id === Number(oldColumn)
      )
    ].class_subject_group_student = [...newStartStudentsArr];

    // update state with newClassData
    updateClassDataState(newClassData);

    if (!resolvingError)
      updateDBStudentGroupings(
        oldColumn,
        oldColumnIndex,
        studentId,
        newColumn,
        newColumnIndex
      );
  }

  async function updateDBStudentGroupings(
    oldColumnId: string,
    oldColumnIndex: number,
    studentId: string,
    newColumnId: string,
    newColumnIndex: number
  ) {
    const supabase = createClient();
    try {
      const { data, error } = await supabase
        .from("class_subject_group_student")
        .update({
          class_subject_group_id: newColumnId,
          student_comment: null,
        })
        .eq("class_subject_group_id", oldColumnId)
        .eq("student_id", Number(studentId));

      if (error) {
        throw error;
      }
    } catch (error) {
      updateLocalColumns(
        newColumnId,
        newColumnIndex,
        studentId,
        true,
        oldColumnId,
        oldColumnIndex
      );
      console.error(
        `Error updating row: ${
          error instanceof Error ? error.message : "Unknown error occurred"
        }`
      );
      setShowWarningModal(true);
      const student = displayedSubjectReportGroups
        .flatMap((group) => group.class_subject_group_student)
        .find((student) => student.student.id === Number(studentId))?.student;
      const oldColumnName = displayedSubjectReportGroups.find(
        (group) => group.id === Number(oldColumnId)
      )?.report_group.description;
      const newColumnName = displayedSubjectReportGroups.find(
        (group) => group.id === Number(newColumnId)
      )?.report_group.description;

      setWarningMessage(
        `Failed to save ${student?.forename} ${student?.surname.slice(
          0,
          1
        )}'s move from the ${oldColumnName} group to ${newColumnName}. Please try again. Contact support if the problem persists.`
      );
    }
  }

  function updateShowWarningModal(bool: boolean) {
    setShowWarningModal(bool);
  }

  return (
    <>
      {displayedSubjectId && (
        <div className="mb-6">
          <p className="mb-2">
            Drag and drop students between groups, click `Comment` to write...
          </p>
          <DragDropContext
            // onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            onDragUpdate={onDragUpdate}
          >
            <div className="flex gap-4">
              <div className="mb-6 flex gap-4 overflow-x-auto">
                {displayedSubjectId !== undefined &&
                  displayedSubjectReportGroups
                    .sort((a, b) => a.report_group.id - b.report_group.id)
                    .map((group, index) => (
                      <Column
                        key={group.report_group.id}
                        group={group}
                        reportButton={index !== 0}
                        classDataState={classDataState}
                        updateClassDataState={updateClassDataState}
                        displayedSubjectIndex={displayedSubjectIndex}
                      />
                    ))}
                <NewColumn
                  classDataState={classDataState}
                  displayedSubjectIndex={displayedSubjectIndex}
                  updateClassDataState={updateClassDataState}
                />
              </div>
            </div>
          </DragDropContext>

          <Link
            href={`/my-classes/${classDataState.id}/pupil-comments`}
            prefetch={false}
          >
            <Button
              disabled={!groupReportsComplete}
              label="Personalise Pupil Comments"
              color="primary-button"
              topMargin
              bottomMargin
            />
          </Link>
        </div>
      )}
      {showWarningModal && (
        <MessageModal
          message={warningMessage}
          updateShowModal={updateShowWarningModal}
        />
      )}
    </>
  );
};
export default SubjectReportGroups;
