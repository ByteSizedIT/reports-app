"use client";

import { ClassSubjectGroup } from "@/types/types";

const Subjects = ({
  groupedSubjectDataState,
  displayedSubjectId,
  updateDisplayedSubject,
}: {
  groupedSubjectDataState: Array<ClassSubjectGroup>;
  displayedSubjectId: number | undefined;
  updateDisplayedSubject: (id: number) => void;
}) => {
  // console.log({ groupedSubjectDataState });
  return (
    <>
      <p className="mb-2">Select or add a subject to report...</p>
      <div className="flex items-center justify-center gap-2 flex-wrap mb-6 sm:mb-8">
        {groupedSubjectDataState.length > 0 &&
          groupedSubjectDataState?.map(
            (s: ClassSubjectGroup, index: number) => (
              <button
                key={s.id}
                className={`py-1 px-2
               ${
                 displayedSubjectId === s.id
                   ? "border-2 border-green-700"
                   : "border border-slate-500"
               }  rounded-md no-underline bg-btn-background hover:bg-btn-background-hover`}
                onClick={() => updateDisplayedSubject(s.id)}
              >
                {s.description}
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

    // {/* <div className="flex items-center justify-center gap-2 flex-wrap mb-6 sm:mb-12">
    //   {groupedSubjectDataState.length > 0 &&
    //     groupedSubjectDataState?.map(
    //       (s: ClassSubjectGroup, index: number) => (
    //         <button
    //           key={s.id}
    //           className="py-1 px-2 border border-slate-500 rounded-md no-underline bg-btn-background hover:bg-btn-background-hover"
    //           onClick={() => updateDisplayedSubject(s.id)}
    //         >
    //           {s.description}
    //         </button>
    //       )
    //     )}
    // </div> */}
  );
};
export default Subjects;
