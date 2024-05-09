"use client";

// TODO: Add functionality to write/save reports

import { useState } from "react";
// import { useFormState } from "react-dom";

// import FormSubmitButton from "../FormSubmitButton";
import Button from "../Button";

import ModalOuter from "../modal-parent-components/ModalOuter";

import { ClassSubjectGroupStudent } from "@/types/types";

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
        student: { id: number };
      }[];
    }[];
  };
}) => {
  const [isPending, setIsPending] = useState(false);

  return (
    <ModalOuter
      updateShowModal={updateShowReportModal}
      height="h-3/4"
      width="w-3/4"
    >
      <h2>
        {`${thisClassDataState.subject.description} ${group.report_group.description} Group Report`}
      </h2>
      <form
        // action={formAction}
        className="w-full h-full flex flex-col sm:w-3/4 md:w-1/2 mt-4 md:mt-8"
      ></form>
      <div className="flex justify-center">
        <Button
          label="Save"
          pendingLabel="Saving"
          color="primary-button"
          pending={isPending}
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
