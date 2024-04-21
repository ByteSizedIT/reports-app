"use client";

import { useState } from "react";

import { FaPlus } from "react-icons/fa";

import CardAsLink from "./CardAsLink";
import CardAsButton from "./CardAsButton";
import AddNewClassModal from "./AddNewClassModal";

import { Class } from "@/types/types";

const ClassCards = ({ myClasses }: { myClasses: Array<Class> | null }) => {
  const [showNewClassModal, setShowNewClassModal] = useState(false);

  function updateShowNewClassModal(bool: boolean) {
    setShowNewClassModal(bool);
  }

  function saveNewClass() {}

  return (
    <>
      <div className="flex flex-wrap my-8 justify-around gap-8">
        <CardAsButton title="Add Class" onCardClick={updateShowNewClassModal}>
          <FaPlus className="text-green-700 text-2xl sm:text-3xl " />
        </CardAsButton>

        {myClasses?.map(
          (c: { id: number; description: string; year_group: string }) => (
            <CardAsLink
              key={c.id}
              href={`/my-classes/${c.id}`}
              title={c.description}
              subtitle={c.year_group}
            />
          )
        )}
      </div>
      {showNewClassModal && (
        <AddNewClassModal
          updateShowNewClassModal={updateShowNewClassModal}
          myClasses={myClasses}
          saveNewClass={saveNewClass}
        />
      )}
    </>
  );
};

export default ClassCards;
