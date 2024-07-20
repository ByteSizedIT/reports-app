"use client";

import { useState } from "react";

import { Droppable } from "@hello-pangea/dnd";

import { MdDeleteForever } from "react-icons/md";
import { FaPen, FaCheck } from "react-icons/fa";

import { ClassDetails, ClassSubjectGroupStudent } from "@/types/types";

import StudentEntry from "./Student";

import DeleteModal from "./DeleteModal";
import WriteReportModal from "./WriteReportModal";
import Button from "../Button";

import { createClient } from "@/utils/supabase/clients/browserClient";
import deepClone from "@/utils/functions/deepClone";
import MessageModal from "./MessageModal";
import { EditorState } from "lexical";

interface ColumnProps {
  group: ClassSubjectGroupStudent;
  reportButton?: boolean;
  classDataState: ClassDetails;
  updateClassDataState: (newData: ClassDetails) => void;
  displayedSubjectIndex: number;
}

const Column = ({
  group,
  reportButton,
  classDataState,
  updateClassDataState,
  displayedSubjectIndex,
}: ColumnProps) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showWarningModal, setWarningModal] = useState(false);
  const [warningMessage, setWarningMessage] = useState("");
  const [showReportModal, setShowReportModal] = useState(false);

  const supabase = createClient();

  function deleteColumn() {
    deleteReportGroupFromDB();
  }

  async function deleteReportGroupFromDB() {
    try {
      const deleteClassSubjectGroupResponse = await supabase
        .from("class_subject_group")
        .delete()
        .eq("id", group.id);

      if (deleteClassSubjectGroupResponse.error) {
        throw new Error(
          `Error deleting column ${group.report_group.description} from class_subject_group table, id no. ${group.id}: ${deleteClassSubjectGroupResponse.error.message}`
        );
      }

      const {
        data: classSubjectGroupInstances,
        error: fetchClassSubjectGroupError,
      } = await supabase
        .from("class_subject_group")
        .select("*")
        .eq("report_group_id", group.report_group.id);

      if (fetchClassSubjectGroupError) {
        throw new Error(
          `Error fetching class_subject_groups as part of deleting columns: ${fetchClassSubjectGroupError.message}`
        );
      }

      if (!classSubjectGroupInstances?.length) {
        const deleteGroupResponse = await supabase
          .from("report_group")
          .delete()
          .eq("id", group.report_group.id);

        if (deleteGroupResponse.error) {
          throw new Error(
            `Error deleting column ${group.report_group.description} from report_group table, id no. ${group.report_group.id}: ${deleteGroupResponse.error.message}`
          );
        }

        if (deleteClassSubjectGroupResponse.error) {
          throw new Error(
            `Error deleting column ${group.report_group.description} from class_subject_group table, id no. ${group.report_group.id}:`
          );
        }
      }
      deleteReportGroupFromGroupedSubjectState();
    } catch (error) {
      console.error(error);
    }
  }

  function deleteReportGroupFromGroupedSubjectState() {
    const copyGroupedSubjectDataState = deepClone(classDataState);
    const index = copyGroupedSubjectDataState[0].class_subject[
      displayedSubjectIndex
    ].class_subject_group.findIndex(
      (item) => item.report_group.id === group.report_group.id
    );
    copyGroupedSubjectDataState[0].class_subject[
      displayedSubjectIndex
    ].class_subject_group.splice(index, 1);
    updateClassDataState(copyGroupedSubjectDataState);
    updateShowDeleteModal(false);
  }

  function updateShowDeleteModal(bool: boolean) {
    if (group.class_subject_group_student.length === 0 || bool === false)
      setShowDeleteModal(bool);
    else
      setWarningModal(true),
        setWarningMessage(
          `The ${group.report_group.description} report group has students assigned. Please reassign them before deleting the group`
        );
  }

  function updateShowWarningModal(bool: boolean) {
    setWarningModal(bool);
  }

  function updateShowReportModal(bool: boolean) {
    setShowReportModal(bool);
  }

  function saveReportToState(updatedComment: EditorState | {}) {
    console.log({ classDataState });
    const classDataCopy = deepClone(classDataState);
    classDataCopy[0].class_subject[displayedSubjectIndex].class_subject_group[
      classDataCopy[0].class_subject[
        displayedSubjectIndex
      ].class_subject_group.findIndex((item) => item.id === group.id)
    ].group_comment = JSON.stringify(updatedComment);
    updateClassDataState(classDataCopy);
  }

  return (
    <>
      {showDeleteModal && (
        <DeleteModal
          group={group}
          updateShowDeleteModal={updateShowDeleteModal}
          message={`Are you sure you want to delete the '${group.report_group.description}' column?`}
          handleDelete={deleteColumn}
        />
      )}
      {showWarningModal && (
        <MessageModal
          message={warningMessage}
          updateShowModal={updateShowWarningModal}
        />
      )}
      <div className="border-2 border-slate-500 rounded-lg min-w-36 md:min-w-72 p-2 pb-8 h-full relative">
        <div className="flex flex-col items-center">
          <h4
            key={group.report_group.id}
            className="m-2 font-bold w-full text-center"
          >
            {group?.report_group.description}
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
                {group.class_subject_group_student.map((student, index) => (
                  <StudentEntry
                    key={student.student.id}
                    student={student}
                    index={index}
                  />
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
          {reportButton && (
            <Button
              label="Comment"
              color="primary-button"
              topMargin
              bottomMargin
              onClick={() => updateShowReportModal(true)}
              disabled={group.class_subject_group_student.length < 1}
            >
              {group.group_comment ? <FaCheck /> : <FaPen />}
            </Button>
          )}
        </div>
        {showReportModal && (
          <WriteReportModal
            group={group}
            thisClassDataState={
              classDataState[0].class_subject[displayedSubjectIndex]
            }
            updateShowReportModal={updateShowReportModal}
            saveGroupCommentToState={saveReportToState}
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
