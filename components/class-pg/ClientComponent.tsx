"use client";

import { useState } from "react";

import { ClassSubjectGroup } from "@/types/types";

import Subjects from "./Subjects";
import SubjectReportGroups from "./SubjectReportGroups";

const ClientComponent = ({
  groupedSubjectData,
}: {
  groupedSubjectData: Array<ClassSubjectGroup>;
}) => {
  const [groupedSubjectDataState, setGroupedSubjectDataState] =
    useState(groupedSubjectData);

  const [displayedSubjectId, setDisplayedSubjectId] = useState<
    number | undefined
  >(undefined);

  function updateGroupedSubjectDataState(newData: Array<ClassSubjectGroup>) {
    setGroupedSubjectDataState(newData);
  }

  function updateDisplayedId(id: number) {
    setDisplayedSubjectId(id);
  }

  return (
    <>
      <Subjects
        groupedSubjectDataState={groupedSubjectDataState}
        updateDisplayedSubject={updateDisplayedId}
      />
      <SubjectReportGroups
        groupedSubjectDataState={groupedSubjectDataState}
        updateGroupedSubjectDataState={updateGroupedSubjectDataState}
        displayedSubjectId={displayedSubjectId}
      />
    </>
  );
};
export default ClientComponent;
