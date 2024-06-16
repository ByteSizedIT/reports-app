"use client";

import { useState, useEffect, useMemo } from "react";

import { createClient } from "@/utils/supabase/clients/browserClient";

import Button from "../Button";

import ModalOuter from "../ModalOuter";

import { Student, ClassSubjectGroupStudent } from "@/types/types";

import Editor from "../Editor";
import { $getRoot, $getSelection, EditorState } from "lexical";

const WriteReportModal = ({
  group,
  updateShowReportModal,
  saveReportToState,
  thisClassDataState,
}: {
  group: ClassSubjectGroupStudent;
  updateShowReportModal: (bool: boolean) => void;
  saveReportToState: () => void;
  thisClassDataState: {
    id: any;
    subject: { id: number; description: string };
    class_subject_group: {
      report_group: { id: number; description: string };
      class_subject_group_student: {
        student: Student;
      }[];
    }[];
  };
}) => {
  const [isPending, setIsPending] = useState(false);
  const [editorState, setEditorState] = useState<EditorState | undefined>(
    undefined
  );
  const [counts, setCounts] = useState({ chars: 0, words: 0 });

  const supabase = createClient();

  function updateEditorState(update: EditorState) {
    setEditorState(update);
  }

  const studentNames = useMemo(
    () =>
      group.class_subject_group_student.map(
        (student) => student.student.forename
      ),
    [group.class_subject_group_student]
  );

  // Update character & word counts
  useEffect(() => {
    const editorStateTextString = editorState?.read(() =>
      $getRoot().getTextContent()
    );
    const charCount = editorStateTextString?.length;
    const wordCount = editorStateTextString
      ?.trim()
      .split(" ")
      .filter((word) => word !== "").length;

    setCounts({ chars: charCount || 0, words: wordCount || 0 });
  }, [editorState]);

  // Insert data into Supabase
  const insertData = async (editorState: {}) => {
    try {
      setIsPending(true);
      const { data, error } = await supabase
        .from("class_subject_group")
        .update([{ group_comment: JSON.stringify(editorState) }])
        .eq("id", 290);
      if (error) {
        console.error("Error inserting data:", error.message);
      } else {
        console.log("Data inserted successfully:", data);
      }
    } catch (error) {
      console.error("Error inserting data:");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <ModalOuter
      updateShowModal={updateShowReportModal}
      height="h-3/4"
      width="w-3/4"
    >
      <h2>
        {`${thisClassDataState.subject.description} ${group.report_group.description} Group Report`}
      </h2>
      <div className="relative h-full w-full md:w-3/4 mx-auto mt-4 p-2">
        <Editor
          updateEditorState={updateEditorState}
          studentNames={studentNames}
        />
      </div>
      <p className="mb-4">{`chars: ${counts.chars} | words: ${counts.words}`}</p>
      <div className="flex justify-center">
        <Button
          label="Save"
          pendingLabel="Saving"
          color="primary-button"
          pending={isPending}
          onClick={async () => {
            await insertData(editorState || {});
            updateShowReportModal(false);
          }}
        />
        <Button
          label="Cancel"
          color="modal-secondary-button"
          leftMargin
          onClick={() => updateShowReportModal(false)}
        />
      </div>
    </ModalOuter>
  );
};
export default WriteReportModal;
