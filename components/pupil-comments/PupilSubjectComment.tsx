"use client";

import { useState, useEffect } from "react";
import { EditorState } from "lexical";

import Editor from "../Editor";
import Button from "../Button";
import DeleteModal from "../class-pg/DeleteModal";

import { Student, StudentComment } from "@/types/types";

import useEditorCounts from "@/app/hooks/lexical/useEditorCounts";
import { createClient } from "@/utils/supabase/clients/browserClient";
import { objectsEqual } from "@/utils/functions/compareObjects";

export const PupilSubjectComment = ({
  classSubject,
  classId,
  studentNames,
  studentComment,
  selectedStudent,
  updateConfirmedComments,
}: {
  classSubject: any;
  classId: number;
  studentNames: Array<string>;
  studentComment?: StudentComment | undefined;
  selectedStudent: Student;
  updateConfirmedComments: (data: StudentComment, subjectId: number) => void;
}) => {
  const initialEditor = studentComment
    ? JSON.parse(studentComment.student_comment)
    : JSON.parse(classSubject.class_subject_group?.[0]?.group_comment);

  const [editorState, setEditorState] = useState<EditorState>(initialEditor);
  const [savedState, setSavedState] = useState<EditorState>(initialEditor);
  const [editorHTML, setEditorHTML] = useState<string | "">();
  const [revertedEditorState, setRevertedEditorState] = useState(undefined);
  const [isPending, setIsPending] = useState(false);
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const { words, chars } = useEditorCounts(editorState);

  function updateEditorState(update: EditorState) {
    setEditorState(update);
  }

  function updateEditorHTML(update: string) {
    setEditorHTML(update);
  }

  const supabase = createClient();

  async function updateDBStudentComments(editorState: EditorState) {
    if (studentComment) {
      const { error, data } = await supabase
        .from("student_comment")
        .update([
          {
            student_comment: JSON.stringify(editorState),
            group_comment_updated: true,
            html_student_comment: editorHTML,
          },
        ])
        .eq("id", studentComment?.id)
        .select()
        .single();

      if (error) {
        throw new Error(
          `Error updating existing student comment: ${JSON.stringify(error)}`
        );
      }
      setRevertedEditorState(undefined);
      return data;
    } else {
      const updated = !objectsEqual(
        JSON.parse(JSON.stringify(editorState)),
        savedState
      );
      const { data, error } = await supabase
        .from("student_comment")
        .insert([
          {
            student_id: selectedStudent.id,
            class_id: classId,
            student_comment: JSON.stringify(editorState),
            class_subject_group_id: classSubject.class_subject_group[0].id,
            group_comment_updated: updated,
            html_student_comment: editorHTML,
          },
        ])
        .select()
        .single();
      if (error) {
        throw new Error(`Error inserting new Student Comment`);
      }
      return data;
    }
  }

  async function saveStudentComment(editorState: EditorState) {
    setIsPending(true);
    try {
      const data = await updateDBStudentComments(editorState);
      updateConfirmedComments(data, classSubject.subject.id);
      setSavedState(JSON.parse(JSON.stringify(editorState)));
    } catch (error) {
      if (error instanceof Error) {
        console.error(
          `Error updating individual student comment: ${error.message}`
        );
      } else {
        console.error("An unexpected error occurred:", error);
      }
    } finally {
      setIsPending(false);
    }
  }

  async function revertToGroupComment() {
    setIsPending(true);
    if (studentComment)
      try {
        const data = await deleteStudentCommentFromDB();
        updateConfirmedComments(data, classSubject.subject.id);
        setRevertedEditorState(
          classSubject.class_subject_group?.[0]?.group_comment
        );
      } catch (error) {
        console.error("Failed to delete student comment from DB:", error);
      } finally {
        setIsPending(false);
        setShowDeleteModal(false);
      }
  }

  async function deleteStudentCommentFromDB() {
    const { data, error } = await supabase
      .from("student_comment")
      .update([
        {
          student_comment: classSubject.class_subject_group?.[0]?.group_comment,
          group_comment_updated: false,
        },
      ])
      .eq("id", studentComment?.id)
      .select()
      .single();

    if (error) {
      throw new Error(
        `Error deleting existing student comment: ${JSON.stringify(error)}`
      );
    }
    return data;
  }

  function updateShowDeleteModal(bool: boolean) {
    setShowDeleteModal(bool);
  }

  return (
    <>
      {showDeleteModal && (
        <DeleteModal
          updateShowDeleteModal={updateShowDeleteModal}
          message={`Are you sure you want to revert to the generic group comment. This will delete ${selectedStudent.forename}'s current individual comment`}
          handleDelete={revertToGroupComment}
        />
      )}
      <div
        key={classSubject.id}
        className="border border-slate-500 rounded-md p-8"
      >
        <h2>{classSubject.subject.description}</h2>
        <p className="text-center">
          {classSubject.class_subject_group?.[0]?.report_group?.description}{" "}
          report group{" "}
          {studentComment?.group_comment_updated
            ? "(edited for student)"
            : "(unedited group comment)"}
        </p>
        <div className="flex flex-col items-center mt-4 gap-4">
          <Editor
            editorState={editorState}
            updateEditorState={updateEditorState}
            updateEditorHTML={updateEditorHTML}
            studentNames={studentNames}
            parentModal={false}
            revertedEditorState={revertedEditorState}
          />
          <p>{`words: ${words} | chars: ${chars} `}</p>
          <div className="flex gap-2">
            <Button
              disabled={
                (objectsEqual(
                  JSON.parse(JSON.stringify(editorState)),
                  savedState
                ) &&
                  studentComment !== undefined) ||
                chars < 1
              }
              color="primary-button"
              label="Save"
              pendingLabel="Saving"
              width="w-fit md:w-48"
              topMargin
              pending={isPending}
              onClick={() => saveStudentComment(editorState)}
            />
            <div className="relative">
              <Button
                disabled={studentComment?.group_comment_updated !== true}
                color="secondary-button"
                label="Revert"
                pendingLabel="Saving"
                width="w-fit md:w-48"
                topMargin
                pending={isPending}
                onClick={() => updateShowDeleteModal(true)}
                id="revertButton"
                ariaDescribedBy="revertTooltip"
                onMouseEnter={() => setTooltipVisible(true)}
                onMouseLeave={() => setTooltipVisible(false)}
                onFocus={() => setTooltipVisible(true)}
                onBlur={() => setTooltipVisible(false)}
              />
              <div
                id="revertTooltip"
                role="tooltip"
                className={`absolute bottom-full mb-2 w-48 bg-branding-background text-white text-center rounded py-1 px-2 transition-opacity duration-200  ${
                  tooltipVisible ? "opacity-100" : "opacity-0"
                }`}
              >
                Revert to the previous group comment text
                <div
                  className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[5px] border-t-branding-background"
                  aria-hidden="true"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
