"use client";

import { useState } from "react";

import { Droppable } from "@hello-pangea/dnd";

import { MdDeleteForever } from "react-icons/md";
import { FaPen } from "react-icons/fa";

import { ClassSubjectGroup, ReportGroup } from "@/types/types";

import StudentEntry from "./Student";

import ModalInnerAdd from "../modal-parent-components/ModalInnerAdd";
import DeleteColumnModal from "./DeleteColumnModal";
import WriteReportModal from "./WriteReportModal";

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
  const [showReportModal, setShowReportModal] = useState(false);

  console.log("Inside Column component, group passed in is ...", { group });
  console.log({ thisGroupedSubjectDataState });

  function updateShowDeleteModal(bool: boolean) {
    setShowDeleteModal(bool);
  }

  function deleteColumnFromState() {
    console.log("Need to add functionality to delete from state");
  }

  function updateShowReportModal(bool: boolean) {
    setShowReportModal(bool);
  }

  function saveReportToState() {
    console.log("Need to add functionality to add report to state");
  }

  return (
    <>
      {showDeleteModal && (
        <DeleteColumnModal
          group={group}
          updateShowDeleteModal={updateShowDeleteModal}
          deleteColumnFromState={deleteColumnFromState}
        />
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
              onClick={() => updateShowReportModal(true)}
              disabled={group.students.length < 1}
            >
              <div className="flex items-center">
                <FaPen /> <p className="pl-2"> Report</p>
              </div>
            </button>
          )}
        </div>
        {showReportModal && (
          <WriteReportModal
            group={group}
            thisGroupedSubjectDataState={thisGroupedSubjectDataState}
            updateShowReportModal={updateShowReportModal}
            saveReportToState={saveReportToState}
          />
        )}
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
