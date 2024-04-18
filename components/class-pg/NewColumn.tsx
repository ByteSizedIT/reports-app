"use client";

import { useState } from "react";

import { FaPlus } from "react-icons/fa";

import AddColumnModal from "./AddColumnModal";

import { ClassDetails } from "@/types/types";

const NewColumn = ({
  classDataState,
  displayedSubjectIndex,
  updateClassDataState,
}: {
  classDataState: ClassDetails;
  displayedSubjectIndex: number;
  updateClassDataState: (newData: ClassDetails) => void;
}) => {
  const [showAddModal, setShowAddModal] = useState(false);

  function updateShowAddModal(bool: boolean) {
    setShowAddModal(bool);
  }

  return (
    <>
      {showAddModal && (
        <AddColumnModal
          updateShowAddModal={updateShowAddModal}
          classDataState={classDataState}
          displayedSubjectIndex={displayedSubjectIndex}
          updateClassDataState={updateClassDataState}
        />
      )}
      <button
        className="border-2 border-slate-500 rounded-lg flex justify-center items-center min-w-36 md:min-w-72 p-4 h-full"
        onClick={() => updateShowAddModal(true)}
      >
        <FaPlus className="text-green-700 text-3xl sm:text-4xl" />
      </button>
    </>
  );
};
export default NewColumn;
