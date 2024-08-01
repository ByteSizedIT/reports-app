"use client";

import { useState, useEffect, useMemo } from "react";

import { EditorState } from "lexical";

import Editor from "../Editor";
import Button from "../Button";

import { Student, StudentComment } from "@/types/types";

import useEditorCounts from "@/app/hooks/lexical/useEditorCounts";

import { createClient } from "@/utils/supabase/clients/browserClient";

export const PupilSubjectReport = ({
  item,
  studentNames,
  studentComment,
  selectedStudent,
}: {
  item: any;
  studentNames: Array<string>;
  studentComment: StudentComment | undefined;
  selectedStudent: number;
}) => {
  const [editorState, setEditorState] = useState<EditorState | undefined>(() =>
    studentComment
      ? JSON.parse(studentComment.student_comment)
      : JSON.parse(item.class_subject_group?.[0]?.group_comment)
  );

  const [isPending, setIsPending] = useState(false);

  const { words, chars } = useEditorCounts(editorState);

  function updateEditorState(update: EditorState) {
    setEditorState(update);
  }

  const supabase = createClient();

  // Insert data into Supabase
  const insertData = async (editorState: EditorState | null) => {
    try {
      setIsPending(true);
      if (studentComment) {
        const { error, data } = await supabase
          .from("student_comment")
          .update([{ student_comment: JSON.stringify(editorState) }])
          .eq("id", studentComment?.id) // class_subject_group.id
          .select()
          .single();

        if (error) {
          throw new Error(
            `Error updating existing student comment: ${JSON.stringify(error)}`
          );
        } else {
          console.log(`Existing Student Comment successfully updated: `, data);
        }
      } else {
        const { data, error } = await supabase.from("student_comment").insert([
          {
            student_id: selectedStudent,
            student_comment: JSON.stringify(editorState),
            class_subject_group_id: item.class_subject_group[0].id,
          },
        ]);
        if (error) {
          throw new Error(`Error inserting new Student Comment`);
        } else {
          console.log(`New Student Comment inserted: `, data);
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

  return (
    <div key={item.id} className="border border-slate-500 rounded-md p-8">
      <h2>{item.subject.description}</h2>
      <p className="text-center">
        {item.class_subject_group?.[0]?.report_group?.description} report group{" "}
        {studentComment ? "(edited for student)" : ""}
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
          disabled={chars < 1}
          color="primary-button"
          label="Save"
          pendingLabel="Saving"
          width="w-fit md:w-32"
          topMargin
          pending={isPending}
          onClick={() => insertData(editorState || null)}
        />
      </div>
    </div>
  );
};
