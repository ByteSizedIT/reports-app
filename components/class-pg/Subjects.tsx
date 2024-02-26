"use client";

import { ClassSubjectGroup } from "@/types/types";

const Subjects = ({
  groupedSubjectDataState,
  updateDisplayedSubject,
}: {
  groupedSubjectDataState: Array<ClassSubjectGroup>;
  updateDisplayedSubject: (id: number) => void;
}) => {
  console.log({ groupedSubjectDataState });
  return (
    <div>
      <div className="w-full flex justify-center items-center text-base sm:text-xl bold mt-6 mb-4 gap-2">
        <h2>Class Subjects{""}</h2>
        <button
          className="px-2 rounded-md no-underline bg-green-700 hover:bg-green-800"
          onClick={() => {
            console.log("Add subject Clicked: functionality to be added");
          }}
        >
          {"+"}
        </button>
      </div>

      <div className="flex items-center justify-center gap-2 flex-wrap mb-6 sm:mb-12">
        {groupedSubjectDataState.length > 0 &&
          groupedSubjectDataState?.map(
            (s: ClassSubjectGroup, index: number) => (
              <button
                key={s.id}
                className="py-1 px-2 border border-slate-500 rounded-md no-underline bg-btn-background hover:bg-btn-background-hover"
                onClick={() => updateDisplayedSubject(s.id)}
              >
                {s.description}
              </button>
            )
          )}
      </div>
    </div>
  );
};
export default Subjects;
