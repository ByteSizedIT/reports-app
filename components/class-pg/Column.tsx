"use client";

import { Droppable } from "@hello-pangea/dnd";

import { ReportGroup } from "@/types/types";

import StudentEntry from "./Student";

const Column = ({
  group,
  reportButton,
}: {
  group: ReportGroup;
  reportButton?: boolean;
}) => {
  console.log("Inside Column component, group passed in is ...", { group });

  return (
    <div className="border-2 border-slate-500 rounded-lg flex flex-col items-center min-w-36 md:min-w-72 p-4 h-full">
      <h3 key={group.id} className="m-2 font-bold w-full text-center">
        {group?.description}
      </h3>
      <Droppable
        droppableId={group.id.toString()}
        isDropDisabled={!reportButton}
      >
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className="min-h-1 min-w-1"
          >
            {group.students.map((student, index) => (
              <StudentEntry key={student.id} student={student} index={index} />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
      {reportButton && (
        <button
          className="py-2 px-4 border border-slate-500 rounded-md no-underline bg-green-700 enabled:hover:bg-green-800 disabled:opacity-50"
          onClick={() =>
            console.log(
              "Need to create function to open write modal",
              group.students
            )
          }
          disabled={group.students.length < 1}
        >
          Report
        </button>
      )}
    </div>
  );
};

export default Column;
