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

  function onDragStart() {}
  function onDragEnd() {}
  function onDragUpdate(result: DropResult) {
    // must syncronously update state to reflect the drag/drop result
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
        // onDragUpdate={onDragUpdate}
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
