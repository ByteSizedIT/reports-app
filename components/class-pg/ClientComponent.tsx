"use client";

import { useState } from "react";

import { ClassDetails } from "@/types/types";

import Subjects from "./Subjects";
import SubjectReportGroups from "./SubjectReportGroups";

const ClientComponent = ({ classData }: { classData: ClassDetails }) => {
  const [classDataState, setClassDataState] = useState(classData);

  const [displayedSubjectId, setDisplayedSubjectId] = useState<
    number | undefined
  >(undefined);

  function updateClassDataState(newData: ClassDetails) {
    setClassDataState(newData);
  }

  function updateDisplayedId(id: number) {
    setDisplayedSubjectId(id);
  }

  return (
    <div className="w-full flex-col justify-center text-center mt-6 mb-6 ">
      <Subjects
        classDataState={classDataState}
        displayedSubjectId={displayedSubjectId}
        updateDisplayedSubject={updateDisplayedId}
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
