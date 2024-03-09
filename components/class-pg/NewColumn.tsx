"use client";

import { useState } from "react";

import { FaPlus } from "react-icons/fa";

import OuterModal from "../modal-parent-components/ModalOuter";
import AddColumnModal from "./AddColumnModal";

const NewColumn = () => {
  const [showAddModal, setShowAddModal] = useState(false);

  function updateShowAddModal(bool: boolean) {
    setShowAddModal(bool);
  }

  function addColumnToState() {
    console.log("Need to add functionality Add ReportGroup column to state");
  }

  return (
    <>
      {showAddModal && (
        <AddColumnModal
          updateShowAddModal={updateShowAddModal}
          addColumnToState={addColumnToState}
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
