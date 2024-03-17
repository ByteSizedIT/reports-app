"use client";

import ModalOuter from "../modal-parent-components/ModalOuter";
import ModalInnerAdd from "../modal-parent-components/ModalInnerAdd";
import { ClassSubjectGroup } from "@/types/types";

const WriteReportModal = ({
  group,
  updateShowReportModal,
  saveReportToState,
  thisClassDataState,
}: {
  group: ClassSubjectGroup;
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
  return (
    <ModalOuter
      updateShowModal={updateShowReportModal}
      height="h-3/4"
      width="w-3/4"
    >
      <ModalInnerAdd
        title={`${thisClassDataState.subject.description} ${group.report_group.description} Report Group`}
        updateShowModal={updateShowReportModal}
        saveContent={saveReportToState}
      ></ModalInnerAdd>
    </ModalOuter>
  );
};
export default WriteReportModal;
