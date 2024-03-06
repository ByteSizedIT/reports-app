"use client";

import { DragDropContext } from "@hello-pangea/dnd";

import type { DropResult } from "@hello-pangea/dnd";

import { ClassSubjectGroup, ReportGroup } from "@/types/types";

import Column from "./Column";
import NewColumn from "./NewColumn";

const SubjectReportGroups = ({
  groupedSubjectDataState,
  updateGroupedSubjectDataState,
  displayedSubjectId,
}: {
  groupedSubjectDataState: Array<ClassSubjectGroup>;
  updateGroupedSubjectDataState: (newData: Array<ClassSubjectGroup>) => void;
  displayedSubjectId: number | undefined;
}) => {
  const displayedSubjectIndex = groupedSubjectDataState.findIndex(
    (subject) => subject.id === displayedSubjectId
  );
  const displayedSubjectReportGroups =
    groupedSubjectDataState?.[displayedSubjectIndex]?.report_groups;

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

    const newGroupedSubjectData = [...groupedSubjectDataState];

    const newStartStudentsArr = Array.from(startColumn.students); // create copy of studentsArr in start column

    const movedItem = newStartStudentsArr.splice(source.index, 1); // move student from source index in copy of start studentArr

    if (startColumn.id === finishColumn.id) {
      // if student is dragged and dropped within same reportGroup column...
      // ... add student into the destination index in the start studentArr, removing 0 items
      newStartStudentsArr.splice(destination.index, 0, ...movedItem);
    } else {
      // if studfent is dragged and dropped between differeing reportGroup columns...
      // ... move student to new index in copy of destination studentArr, removing 0 items
      const newFinishStudentsArr = Array.from(finishColumn.students);
      newFinishStudentsArr.splice(destination.index, 0, ...movedItem);

      // update destination studentArr in a copy of classData
      newGroupedSubjectData[displayedSubjectIndex].report_groups[
        displayedSubjectReportGroups.findIndex(
          (group) => group.id === Number(destination.droppableId)
        )
      ].students = [...newFinishStudentsArr];
    }

    // update startStudentsArr in a copy of classData
    newGroupedSubjectData[displayedSubjectIndex].report_groups[
      displayedSubjectReportGroups.findIndex(
        (group) => group.id === Number(source.droppableId)
      )
    ].students = [...newStartStudentsArr];

    // update state with newClassData
    updateGroupedSubjectDataState(newGroupedSubjectData);
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
                  groupedSubjectDataState?.[displayedSubjectIndex]?.[
                    "report_groups"
                  ]
                    .sort((a, b) => a.id - b.id)
                    .map((group: ReportGroup, index) => (
                      <Column
                        key={group.id}
                        group={group}
                        reportButton={index !== 0}
                        thisGroupedSubjectDataState={
                          groupedSubjectDataState[displayedSubjectIndex]
                        }
                        updateGroupedSubjectDataState={
                          updateGroupedSubjectDataState
                        }
                      />
                    ))}
                <NewColumn />
              </div>
            </div>
          </DragDropContext>
        </>
      )}
    </>
  );
};
export default SubjectReportGroups;
