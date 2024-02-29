"use client";

import { useState } from "react";

import { ClassSubjectGroup, Class } from "@/types/types";

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
    <div className="w-full flex-col justify-center text-center mt-6 mb-6 ">
      <Subjects
        groupedSubjectDataState={groupedSubjectDataState}
        displayedSubjectId={displayedSubjectId}
        updateDisplayedSubject={updateDisplayedId}
      />
      <SubjectReportGroups
        groupedSubjectDataState={groupedSubjectDataState}
        updateGroupedSubjectDataState={updateGroupedSubjectDataState}
        displayedSubjectId={displayedSubjectId}
      />
    </div>
  );
};
export default ClientComponent;
