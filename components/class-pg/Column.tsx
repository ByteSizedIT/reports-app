"use client";

import { useState } from "react";

import { Droppable } from "@hello-pangea/dnd";

import { MdDeleteForever } from "react-icons/md";
import { FaPen } from "react-icons/fa";

import { ClassSubjectGroup, ReportGroup } from "@/types/types";

import StudentEntry from "./Student";
import ModalOuter from "../ModalOuter";
import ModalInnerConfirmation from "../ModalInnerConfirmation";

interface ColumnProps {
  group: ReportGroup;
  reportButton?: boolean;
  thisGroupedSubjectDataState: ClassSubjectGroup;
  updateGroupedSubjectDataState: (newData: Array<ClassSubjectGroup>) => void;
}

const Column = ({
  group,
  reportButton,
  thisGroupedSubjectDataState,
  updateGroupedSubjectDataState,
}: ColumnProps) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  console.log("Inside Column component, group passed in is ...", { group });
  console.log({ thisGroupedSubjectDataState });

  function updateShowDeleteModal(bool: boolean) {
    setShowDeleteModal(bool);
  }

  function deleteColumnFromState() {
    console.log("Need to add functionality to delete from state");
  }

  const confirmDeleteMessage = `Are you sure you want to delete the '${group.description}' column?`;

  return (
    <>
      {showDeleteModal && (
        <ModalOuter
          updateShowModal={updateShowDeleteModal}
          height="h-1/3"
          width="w-1/3"
        >
          <ModalInnerConfirmation
            message={confirmDeleteMessage}
            confirmSelection={deleteColumnFromState}
            updateShowModal={updateShowDeleteModal}
          />
        </ModalOuter>
      )}
      <div className="border-2 border-slate-500 rounded-lg min-w-36 md:min-w-72 p-2 pb-8 h-full relative">
        <div className="flex flex-col items-center">
          <h4 key={group.id} className="m-2 font-bold w-full text-center">
            {group?.description}
          </h4>
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
                  <StudentEntry
                    key={student.id}
                    student={student}
                    index={index}
                  />
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
          {reportButton && (
            <button
              className="py-1 px-2 mb-2 border border-slate-500 rounded-md no-underline bg-green-700 enabled:hover:bg-green-800 disabled:opacity-50"
              disabled={group.students.length < 1}
            >
              <div className="flex items-center">
                <FaPen /> <p className="pl-2"> Report</p>
              </div>
            </button>
          )}
        </div>
        {reportButton && (
          <MdDeleteForever
            className="text-green-700 hover:text-green-800 text-xl sm:text-2xl absolute bottom-2 right-2"
            onClick={() => updateShowDeleteModal(true)}
          />
        )}
      </div>
    </>
  );
};

export default Column;
