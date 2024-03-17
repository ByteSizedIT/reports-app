"use client";

import { ClassDetails } from "@/types/types";

const Subjects = ({
  classDataState,
  displayedSubjectId,
  updateDisplayedSubject,
}: {
  classDataState: ClassDetails;
  displayedSubjectId: number | undefined;
  updateDisplayedSubject: (id: number) => void;
}) => {
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
                onClick={() => updateDisplayedSubject(c.id)}
              >
                {c.subject.description}
              </button>
            )
          )}
        <button
          className="px-2 rounded-md no-underline bg-green-700 hover:bg-green-800"
          onClick={() => {
            console.log("Add subject Clicked: functionality to be added");
          }}
        >
          {"+"}
        </button>
      </div>
    </>
  );
};
export default Subjects;
