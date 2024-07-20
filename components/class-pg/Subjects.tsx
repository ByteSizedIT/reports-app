"use client";

import { useState } from "react";

import { ClassDetails, ReportGroup, SubjectDetails } from "@/types/types";

import AddSubjectModal from "./AddSubjectModal";
import Button from "../Button";
import { FaPlus } from "react-icons/fa";

const Subjects = ({
  organisationSubjectDataState,
  updateOrganisationSubjectDataState,
  organisationReportGroupData,
  classDataState,
  updateClassDataState,
  displayedSubjectId,
  updateDisplayedSubjectId,
}: {
  organisationSubjectDataState: SubjectDetails | [];
  updateOrganisationSubjectDataState: (newData: SubjectDetails) => void;
  organisationReportGroupData: Array<ReportGroup> | null;
  classDataState: ClassDetails;
  updateClassDataState: (newData: ClassDetails) => void;
  displayedSubjectId: number | undefined;
  updateDisplayedSubjectId: (id: number) => void;
}) => {
  const [showSubjectModal, setshowSubjectModal] = useState(false);

  function updateShowSubjectModal(bool: boolean) {
    setshowSubjectModal(bool);
  }

  return (
    <>
      <p className="mb-2">Select or add a subject to report...</p>
      <div className="flex items-center justify-center gap-2 flex-wrap mb-6 sm:mb-8">
        {classDataState[0].class_subject.length > 0 &&
          classDataState[0].class_subject?.map(
            (c: { id: number; subject: any }, index: number) => (
              <Button
                key={c.id}
                label={c.subject.description}
                color="secondary-button"
                activeBorder={displayedSubjectId === c.id}
                small
                onClick={() => updateDisplayedSubjectId(c.id)}
              />
            )
          )}
        <Button
          color="primary-button"
          small
          onClick={() => {
            updateShowSubjectModal(true);
          }}
        >
          <FaPlus />
        </Button>
      </div>
      {showSubjectModal && (
        <AddSubjectModal
          organisationSubjectDataState={organisationSubjectDataState}
          updateOrganisationSubjectDataState={
            updateOrganisationSubjectDataState
          }
          organisationReportGroupData={organisationReportGroupData}
          updateShowSubjectModal={updateShowSubjectModal}
          classDataState={classDataState}
          updateClassDataState={updateClassDataState}
          updateDisplayedSubjectId={updateDisplayedSubjectId}
        />
      )}
    </>
  );
};
export default Subjects;
