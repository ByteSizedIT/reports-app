"use client";

import { useState } from "react";

import { ClassDetails, SubjectDetails } from "@/types/types";

import Subjects from "./Subjects";
import SubjectReportGroups from "./SubjectReportGroups";

const ClientComponent = ({
  classData,
  organisationSubjectData,
}: {
  classData: ClassDetails;
  organisationSubjectData: SubjectDetails | null;
}) => {
  const [classDataState, setClassDataState] = useState(classData);
  const [organisationSubjectDataState, setOrganisationSubjectDataState] =
    useState(organisationSubjectData || []);
  const [displayedSubjectId, setDisplayedSubjectId] = useState<
    number | undefined
  >(undefined);

  function updateClassDataState(newData: ClassDetails) {
    setClassDataState(newData);
  }

  function updateDisplayedSubjectId(subjectId: number) {
    setDisplayedSubjectId(subjectId);
  }

  function updateOrganisationSubjectDataState(newData: SubjectDetails) {
    setOrganisationSubjectDataState(newData);
  }

  return (
    <div className="w-full flex-col justify-center text-center mt-6 mb-6 ">
      <Subjects
        organisationSubjectDataState={organisationSubjectDataState}
        updateOrganisationSubjectDataState={updateOrganisationSubjectDataState}
        classDataState={classDataState}
        updateClassDataState={updateClassDataState}
        displayedSubjectId={displayedSubjectId}
        updateDisplayedSubjectId={updateDisplayedSubjectId}
      />
      <SubjectReportGroups
        classDataState={classDataState}
        updateClassDataState={updateClassDataState}
        displayedSubjectId={displayedSubjectId}
      />
    </div>
  );
};
export default ClientComponent;
