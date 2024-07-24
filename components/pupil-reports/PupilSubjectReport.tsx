"use client";

import { useState, useEffect, useMemo } from "react";

import { EditorState } from "lexical";

import Editor from "../Editor";
import Button from "../Button";

import { StudentComment } from "@/types/types";

import useEditorCounts from "@/app/hooks/lexical/useEditorCounts";

export const PupilSubjectReport = ({
  item,
  studentNames,
  studentComment,
}: {
  item: any;
  studentNames: Array<string>;
  studentComment: StudentComment | undefined;
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

  // TODO: Insert into Supabase
  const insertData = async (editorState: {}) => {
    console.log("TODO: Insert into Supabase");
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
          onClick={() => insertData(editorState || {})}
        />
      </div>
    </div>
  );
};
