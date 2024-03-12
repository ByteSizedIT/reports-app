"use client";

import ModalOuter from "../modal-parent-components/ModalOuter";
import ModalInnerAdd from "../modal-parent-components/ModalInnerAdd";

import { ReportGroup, ClassSubjectGroup } from "@/types/types";

const WriteReportModal = ({
  group,
  updateShowReportModal,
  saveReportToState,
  thisGroupedSubjectDataState,
}: {
  group: ReportGroup;
  updateShowReportModal: (bool: boolean) => void;
  saveReportToState: () => void;
  thisGroupedSubjectDataState: ClassSubjectGroup;
}) => {
  return (
    <ModalOuter
      updateShowModal={updateShowReportModal}
      height="h-3/4"
      width="w-3/4"
    >
      <ModalInnerAdd
        title={`${thisGroupedSubjectDataState.description} ${group.description} Report Group`}
        updateShowModal={updateShowReportModal}
        saveContent={saveReportToState}
      ></ModalInnerAdd>
    </ModalOuter>
  );
};
export default WriteReportModal;
