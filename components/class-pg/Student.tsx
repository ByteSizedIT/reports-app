"use client";

import { Draggable } from "@hello-pangea/dnd";

import { Student } from "@/types/types";

const StudentEntry = ({
  student,
  index,
}: {
  student: Student;
  index: number;
}) => {
  return (
    <Draggable draggableId={student.id.toString()} index={index}>
      {(provided, snapshot) => (
        <p
          className={`text-center rounded-md border ${
            snapshot.isDragging ? " border-green-700" : " border-slate-500"
          } mb-2 p-2 bg-black`}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          ref={provided.innerRef}
        >
          {`${student.forename}  ${student.surname}`.slice(0, 15)}{" "}
          {`${student.forename} ${student.surname}`.length > 15 ? "..." : ""}
        </p>
      )}
    </Draggable>
  );
};
export default StudentEntry;
