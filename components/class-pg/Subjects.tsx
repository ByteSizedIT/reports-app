"use client";

import { useState } from "react";

import { ClassDetails, SubjectDetails } from "@/types/types";
import AddSubjectModal from "./AddSubjectModal";

const Subjects = ({
  organisationSubjectDataState,
  updateOrganisationSubjectDataState,
  classDataState,
  updateClassDataState,
  displayedSubjectId,
  updateDisplayedSubjectId,
}: {
  organisationSubjectDataState: SubjectDetails | [];
  updateOrganisationSubjectDataState: (newData: SubjectDetails) => void;
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
              <button
                key={c.id}
                className={`py-1 px-2
               ${
                 displayedSubjectId === c.id
                   ? "border-2 border-green-700"
                   : "border border-slate-500"
               }  rounded-md no-underline bg-btn-background hover:bg-btn-background-hover`}
                onClick={() => updateDisplayedSubjectId(c.id)}
              >
                {c.subject.description}
              </button>
            )
          )}
        <button
          className="px-2 rounded-md no-underline bg-green-700 hover:bg-green-800"
          onClick={() => {
            console.log("Add subject Clicked: functionality to be added");
            updateShowSubjectModal(true);
          }}
        >
          {"+"}
        </button>
      </div>
      {showSubjectModal && (
        <AddSubjectModal
          organisationSubjectDataState={organisationSubjectDataState}
          updateOrganisationSubjectDataState={
            updateOrganisationSubjectDataState
          }
          updateShowSubjectModal={updateShowSubjectModal}
          classDataState={classDataState}
          updateClassDataState={updateClassDataState}
        />
      )}
    </>
  );
};
export default Subjects;
