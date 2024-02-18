"use client";

import { useState, useEffect } from "react";

import { ClassSubjectGroup } from "@/types/types";

import Subjects from "./Subjects";

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

  useEffect(() => {
    console.log(displayedSubjectId);
  }, [displayedSubjectId]);

  return (
    <>
      <Subjects
        groupedSubjectDataState={groupedSubjectDataState}
        updateDisplayedSubject={updateDisplayedId}
      />
    </>
  );
};
export default ClientComponent;
