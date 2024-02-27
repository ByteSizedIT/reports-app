"use client";

import { DragDropContext } from "@hello-pangea/dnd";

import type { DropResult } from "@hello-pangea/dnd";

import { ClassSubjectGroup, ReportGroup } from "@/types/types";

import Column from "./Column";

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

    const { draggableId, source, destination } = result;

    // check if there is no destination - it was dropeed outside

    if (!destination) return;

    // check whether location of draggable didn't changed

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const column =
      displayedSubjectReportGroups[
        displayedSubjectReportGroups.findIndex(
          (group) => group.id === Number(source.droppableId)
        )
      ];

    // create copy of studentsArr and move student from old index to new index

    const newStudentsArr = Array.from(column.students);

    const movedItem = newStudentsArr.splice(source.index, 1); // move 1 item from the position of sourceindex
    newStudentsArr.splice(destination.index, 0, ...movedItem); // add item back into the destination index, removing 0 items

    // update state with updated copy of studentsArr

    const newData = [...groupedSubjectDataState];

    newData[displayedSubjectIndex].report_groups[
      displayedSubjectReportGroups.findIndex(
        (group) => group.id === Number(source.droppableId)
      )
    ].students = [...newStudentsArr];

    updateGroupedSubjectDataState(newData);
  }

  return (
    <>
      <div className="w-full flex justify-center items-center text-base sm:text-xl bold mt-6 mb-4 gap-2">
        <h2>
          {`
      ${
        displayedSubjectId !== undefined
          ? groupedSubjectDataState[displayedSubjectIndex].description + " "
          : ""
      }
    Report Groups`}
        </h2>
        <button
          className="px-2 rounded-md no-underline bg-green-700 hover:bg-green-900"
          onClick={() => {
            console.log("Add Subject Clicked: functionality to be added");
          }}
        >
          {"+"}
        </button>
      </div>
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
                  />
                ))}
          </div>
        </div>
      </DragDropContext>
    </>
  );
};
export default SubjectReportGroups;
