"use client";

import { useState } from "react";

import { ClassSubjectGroup } from "@/types/types";

const ClientComponent = ({
  groupedSubjectData,
}: {
  groupedSubjectData: Array<ClassSubjectGroup>;
}) => {
  const [groupedSubjectDataState, setGroupedSubjectDataState] =
    useState(groupedSubjectData);

  function updateGroupedSubjectDataState(newData: Array<ClassSubjectGroup>) {
    setGroupedSubjectDataState(newData);
  }

  return (
    <>
      {groupedSubjectData?.map((subject, index) => (
        <div key={index}>{subject.description}</div>
      ))}
    </>
  );
};
export default ClientComponent;
