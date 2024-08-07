"use client";

import { useState, useEffect, useMemo } from "react";

import { EditorState } from "lexical";

import Editor from "../Editor";
import Button from "../Button";

import { Student, StudentComment } from "@/types/types";

import useEditorCounts from "@/app/hooks/lexical/useEditorCounts";

import { createClient } from "@/utils/supabase/clients/browserClient";

import { objectsEqual } from "@/utils/functions/compareObjects";

export const PupilSubjectReport = ({
  classSubject,
  classId,
  studentNames,
  studentComment,
  selectedStudent,
  updateStudentCommentsState,
}: {
  classSubject: any;
  classId: number;
  studentNames: Array<string>;
  studentComment:
    | {
        id: number;
        student_id: number;
        student_comment: string;
        class_id: number;
        class_subject_group_id: number;
        group_comment_updated: boolean;
      }
    | undefined;
  selectedStudent: number;
  updateStudentCommentsState: (
    id: number,
    studentId: number,
    classId: number,
    classSubjectGroupId: number,
    studentComment: string,
    groupCommentUpdated: boolean
  ) => void;
}) => {
  const [editorState, setEditorState] = useState<EditorState>(() =>
    studentComment
      ? JSON.parse(studentComment.student_comment)
      : JSON.parse(classSubject.class_subject_group?.[0]?.group_comment)
  );

  const [savedState, setSavedState] = useState<EditorState>(() =>
    studentComment
      ? JSON.parse(studentComment.student_comment)
      : JSON.parse(classSubject.class_subject_group?.[0]?.group_comment)
  );

  const [isPending, setIsPending] = useState(false);

  const { words, chars } = useEditorCounts(editorState);

  function updateEditorState(update: EditorState) {
    setEditorState(update);
  }

  const supabase = createClient();

  // Insert data into Supabase
  const insertData = async (editorState: EditorState) => {
    try {
      setIsPending(true);
      if (studentComment) {
        const { error, data } = await supabase
          .from("student_comment")
          .update([
            {
              student_comment: JSON.stringify(editorState),
              group_comment_updated: true,
            },
          ])
          .eq("id", studentComment?.id) // class_subject_group.id
          .select()
          .single();

        if (error) {
          throw new Error(
            `Error updating existing student comment: ${JSON.stringify(error)}`
          );
        } else {
          updateStudentCommentsState(
            data.id,
            data.student_id,
            data.class_id,
            data.class_subject_group_id,
            data.student_comment,
            data.group_comment_updated
          );
          console.log(`Existing Student Comment successfully updated: `, data);
          setSavedState(JSON.parse(JSON.stringify(editorState)));
        }
      } else {
        const updated = !objectsEqual(
          JSON.parse(JSON.stringify(editorState)),
          savedState
        );
        const { data, error } = await supabase
          .from("student_comment")
          .insert([
            {
              student_id: selectedStudent,
              class_id: classId,
              student_comment: JSON.stringify(editorState),
              class_subject_group_id: classSubject.class_subject_group[0].id,
              group_comment_updated: updated,
            },
          ])
          .select()
          .single();
        if (error) {
          throw new Error(`Error inserting new Student Comment`);
        } else {
          updateStudentCommentsState(
            data.id,
            data.student_id,
            data.class_id,
            data.class_subject_group_id,
            data.student_comment,
            data.group_comment_updated
          );
          console.log(`New Student Comment inserted: `, data);
          setSavedState(JSON.parse(JSON.stringify(editorState)));
        }
      }
    } catch (error) {
      if (error instanceof Error) {
        // Handle standard JavaScript Error
        console.error(
          `Error updating individual student comment: ${error.message}`
        );
      } else {
        // Handle non-standard errors
        console.error("An unexpected error occurred:", error);
      }
    } finally {
      setIsPending(false);
    }
  };

  useEffect(() => {
    console.log(
      { savedState, editorState },
      JSON.parse(JSON.stringify(editorState))
    );
  }, [savedState, editorState]);

  return (
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
          studentNames={studentNames}
          parentModal={false}
        />
        <p>{`words: ${words} | chars: ${chars} `}</p>
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
          width="w-fit md:w-32"
          topMargin
          pending={isPending}
          onClick={() => insertData(editorState)}
        />
      </div>
    </div>
  );
};
