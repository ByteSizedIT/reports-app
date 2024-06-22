"use client";

import { useState } from "react";

import { EditorState } from "lexical";

import Editor from "../Editor";

export const PupilSubjectReport = ({
  item,
  index,
  studentNames,
  studentComment,
}: {
  item: any;
  index: number;
  studentNames: Array<string>;
  studentComment: Array<string> | undefined;
}) => {
  const [editorState, setEditorState] = useState(
    studentComment?.[index] || item.class_subject_group?.[0]?.group_comment
  );

  function updateEditorState(update: EditorState) {
    setEditorState(update);
  }

  return (
    <div key={item.id} className="border border-slate-500 rounded-md p-8">
      <h2>{item.subject.description}</h2>
      <p className="text-center">
        {item.class_subject_group?.[0]?.report_group?.description} report group{" "}
        {studentComment?.[index] ? "(edited for student)" : ""}
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
