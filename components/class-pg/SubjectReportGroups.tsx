"use client";

import { useState } from "react";

import { DragDropContext } from "@hello-pangea/dnd";
import type { DropResult } from "@hello-pangea/dnd";

import { ClassDetails } from "@/types/types";

import Column from "./Column";
import NewColumn from "./NewColumn";

import { supabaseBrowserClient } from "@/utils/supabase/client";

const SubjectReportGroups = ({
  classDataState,
  updateClassDataState,
  displayedSubjectId,
}: {
  classDataState: ClassDetails;
  updateClassDataState: (newData: ClassDetails) => void;
  displayedSubjectId: number | undefined;
}) => {
  const [reportsComplete, setReportsComplete] = useState(() =>
    classDataState[0].class_subject
      .flatMap((subject) => subject.class_subject_group)
      .every((group) => group.group_comment !== null)
  );

  const displayedSubjectIndex = classDataState[0].class_subject.findIndex(
    (s) => s.id === displayedSubjectId
  );
  const displayedSubjectReportGroups =
    classDataState[0]?.class_subject?.[displayedSubjectIndex]
      ?.class_subject_group;

  function onDragStart() {}
  function onDragUpdate() {}
  function onDragEnd(result: DropResult) {
    // syncronously update state to reflect the drag/drop result
    // NB this code optimistically updates UI without updates yet persisting in DB

    const { draggableId, source, destination } = result;

    // check if there is no destination - it was dropped outside
    if (!destination) return;

    // check whether location of draggable didn't changed
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    updateDBStudentGroupings(
      Number(source.droppableId),
      Number(destination.droppableId),
      Number(draggableId)
    );

    const startColumn =
      displayedSubjectReportGroups[
        displayedSubjectReportGroups.findIndex(
          (group) => group.id === Number(source.droppableId)
        )
      ];

    const finishColumn =
      displayedSubjectReportGroups[
        displayedSubjectReportGroups.findIndex(
          (group) => group.id === Number(destination.droppableId)
        )
      ];

    const newClassData = [...classDataState];

    // create copy of studentsArr in start column
    const newStartStudentsArr = Array.from(
      startColumn.class_subject_group_student
    );

    // move student from source index in copy of start studentArr
    const movedItem = newStartStudentsArr.splice(source.index, 1);

    if (startColumn.report_group.id === finishColumn.report_group.id) {
      // if student is dragged and dropped within same reportGroup column...
      // ... add student into the destination index in the start studentArr, removing 0 items
      newStartStudentsArr.splice(destination.index, 0, ...movedItem);
    } else {
      // if student is dragged and dropped between differeing reportGroup columns...
      // ... move student to new index in copy of destination studentArr, removing 0 items
      const newFinishStudentsArr = Array.from(
        finishColumn.class_subject_group_student
      );
      newFinishStudentsArr.splice(destination.index, 0, ...movedItem);

      // update destination studentArr in a copy of classData
      newClassData[0].class_subject[displayedSubjectIndex].class_subject_group[
        displayedSubjectReportGroups.findIndex(
          (group) => group.id === Number(destination.droppableId)
        )
      ].class_subject_group_student = [...newFinishStudentsArr];
    }

    // update startStudentsArr in a copy of classData
    newClassData[0].class_subject[displayedSubjectIndex].class_subject_group[
      displayedSubjectReportGroups.findIndex(
        (group) => group.id === Number(source.droppableId)
      )
    ].class_subject_group_student = [...newStartStudentsArr];

    // update state with newClassData
    updateClassDataState(newClassData);
  }

  async function updateDBStudentGroupings(
    oldColumnId: number,
    newColumnId: number,
    studentId: number
  ) {
    const supabase = supabaseBrowserClient();
    try {
      const { data, error } = await supabase
        .from("class_subject_group_student")
        .update({
          class_subject_group_id: newColumnId,
          student_comment: null,
        })
        .eq("class_subject_group_id", oldColumnId)
        .eq("student_id", studentId);

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error(
        `Error updating row: ${
          error instanceof Error ? error.message : "Unknown error occurred"
        }`
      );
    }
  }

  return (
    <>
      {displayedSubjectId && (
        <>
          <p className="mb-2">
            Drag and drop students between groups, click `Report` to write...
          </p>
          <DragDropContext
            // onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            onDragUpdate={onDragUpdate}
          >
            <div className="flex gap-4">
              <div className="flex gap-4 overflow-x-auto">
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
        </>
      )}
    </>
  );
};
export default SubjectReportGroups;
