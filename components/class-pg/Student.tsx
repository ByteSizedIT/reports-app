"use client";

import { Draggable } from "@hello-pangea/dnd";

const StudentEntry = ({
  student,
  index,
}: {
  student: {
    student: {
      id: number;
      dob: string;
      pronoun: string;
      surname: string;
      forename: string;
      grad_year: number;
      organisation_id: number;
    };
  };
  index: number;
}) => {
  return (
    <Draggable draggableId={student.student.id.toString()} index={index}>
      {(provided, snapshot) => (
        <p
          className={`text-center rounded-md border ${
            snapshot.isDragging ? " border-green-700" : " border-slate-500"
          } mb-2 p-2 bg-background dark:bg-black`}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          ref={provided.innerRef}
        >
          {`${student.student.forename}  ${student.student.surname}`.slice(
            0,
            15
          )}{" "}
          {`${student.student.forename} ${student.student.surname}`.length > 15
            ? "..."
            : ""}
        </p>
      )}
    </Draggable>
  );
};
export default StudentEntry;
