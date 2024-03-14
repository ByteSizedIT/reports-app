"use client";

import { useState } from "react";

import { Droppable } from "@hello-pangea/dnd";

import { MdDeleteForever } from "react-icons/md";
import { FaPen } from "react-icons/fa";

import { ClassSubjectGroup, ReportGroup } from "@/types/types";

import StudentEntry from "./Student";

import DeleteColumnModal from "./DeleteColumnModal";
import WriteReportModal from "./WriteReportModal";

import { supabaseBrowserClient } from "@/utils/supabase/client";
import deepClone from "@/utils/functions/deepClone";

interface ColumnProps {
  group: ReportGroup;
  reportButton?: boolean;
  groupedSubjectDataState: Array<ClassSubjectGroup>;
  updateGroupedSubjectDataState: (newData: Array<ClassSubjectGroup>) => void;
  displayedSubjectIndex: number;
}

const Column = ({
  group,
  reportButton,
  groupedSubjectDataState,
  updateGroupedSubjectDataState,
  displayedSubjectIndex,
}: ColumnProps) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  const supabase = supabaseBrowserClient();

  function updateShowDeleteModal(bool: boolean) {
    setShowDeleteModal(bool);
  }

  function deleteColumn() {
    deleteReportGroupFromDB();
  }

  async function deleteReportGroupFromDB() {
    try {
      const deleteClassSubjectGroupResult = await supabase
        .from("class_subject_group")
        .delete()
        .eq("id", group["class_subject_group.id"]);

      if (deleteClassSubjectGroupResult.error) {
        throw new Error(
          `Error deleting column ${group.description} from class_subject_group table, id no. ${group["class_subject_group.id"]}: ${deleteClassSubjectGroupResult.error.message}`
        );
      }

      const {
        data: classSubjectGroupInstances,
        error: fetchClassSubjectGroupError,
      } = await supabase
        .from("class_subject_group")
        .select("*")
        .eq("report_group_id", group.id);

      if (fetchClassSubjectGroupError) {
        throw new Error(
          `Error fetching class_subject_groups as part of deleting columns: ${fetchClassSubjectGroupError.message}`
        );
      }

      if (!classSubjectGroupInstances?.length) {
        const [deleteGroupResult, deleteClassSubjectGroupResult] =
          await Promise.all([
            supabase.from("report_group").delete().eq("id", group.id),
            supabase
              .from("class_subject_group")
              .delete()
              .eq("id", group["class_subject_group.id"]),
          ]);

        if (deleteGroupResult.error) {
          throw new Error(
            `Error deleting column ${group.description} from report_group table, id no. ${group.id}: ${deleteGroupResult.error.message}`
          );
        }

        if (deleteClassSubjectGroupResult.error) {
          throw new Error(
            `Error deleting column ${group.description} from class_subject_group table, id no. ${group["class_subject_group.id"]}: ${deleteClassSubjectGroupResult.error.message}`
          );
        }
      }

      deleteReportGroupFromGroupedSubjectState();
    } catch (error) {
      console.error(error);
    }
  }

  function deleteReportGroupFromGroupedSubjectState() {
    const copyGroupedSubjectDataState = deepClone(groupedSubjectDataState);
    const index = copyGroupedSubjectDataState[
      displayedSubjectIndex
    ].report_groups.findIndex((item) => item.id === group.id);
    copyGroupedSubjectDataState[displayedSubjectIndex].report_groups.splice(
      index,
      1
    );
    updateGroupedSubjectDataState(copyGroupedSubjectDataState);
    updateShowDeleteModal(false);
  }

  function updateShowReportModal(bool: boolean) {
    setShowReportModal(bool);
  }

  function saveReportToState() {
    // console.log("Need to add functionality to add report to state");
  }

  return (
    <>
      {showDeleteModal && (
        <DeleteColumnModal
          group={group}
          updateShowDeleteModal={updateShowDeleteModal}
          deleteColumn={deleteColumn}
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
            thisGroupedSubjectDataState={
              groupedSubjectDataState[displayedSubjectIndex]
            }
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
