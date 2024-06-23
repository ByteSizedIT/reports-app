"use client";

import { useState, useMemo } from "react";

import { EditorState } from "lexical";

import Editor from "../Editor";
import { StudentComment } from "@/types/types";

export const PupilSubjectReport = ({
  item,
  studentNames,
  studentComments,
  selectedStudent,
}: {
  item: any;
  studentNames: Array<string>;
  studentComments: Array<StudentComment>;
  selectedStudent: number;
}) => {
  const [editorState, setEditorState] = useState(
    () =>
      studentComments.find(
        (comment) =>
          comment.class_subject_group_id ===
            item.class_subject_group?.[0]?.id &&
          comment.student_id === selectedStudent
      )?.student_comment || item.class_subject_group?.[0]?.group_comment
  );

  const studentComment = useMemo(
    () =>
      studentComments.find(
        (comment) =>
          comment.class_subject_group_id ===
            item.class_subject_group?.[0]?.id &&
          comment.student_id === selectedStudent
      ),
    [item.class_subject_group, studentComments, selectedStudent]
  );

  function updateEditorState(update: EditorState) {
    setEditorState(update);
  }

  return (
    <div key={item.id} className="border border-slate-500 rounded-md p-8">
      <h2>{item.subject.description}</h2>
      <p className="text-center">
        {item.class_subject_group?.[0]?.report_group?.description} report group{" "}
        {studentComment ? "(edited for student)" : ""}
      </p>
      <div className="flex flex-col items-center">
        <Editor
          editorState={editorState}
          updateEditorState={updateEditorState}
          studentNames={studentNames}
        />
      </div>
    </div>
  );
};
