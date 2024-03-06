"use client";

import ModalOuter from "../ModalOuter";
import ModalInnerAdd from "../ModalInnerAdd";

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
        updateShowModal={updateShowReportModal}
        saveContent={saveReportToState}
      >
        <h3 className="text-black">
          {thisGroupedSubjectDataState.description} {group.description} Report
          Group
        </h3>
        <form></form>
      </ModalInnerAdd>
    </ModalOuter>
  );
};
export default WriteReportModal;
