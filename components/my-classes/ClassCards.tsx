"use client";

import { useState } from "react";

import Link from "next/link";

import ExistingClassCard from "./ExistingClassCard";
import NewClassCard from "./NewClassCard";
import AddNewClassModal from "./new-class/AddNewClassModal";

import { Class } from "@/types/types";

const ClassCards = ({
  myClasses,
  organisationId,
}: {
  myClasses: Array<Class> | null;
  organisationId: number;
}) => {
  const [showNewClassModal, setShowNewClassModal] = useState(false);

  function updateShowNewClassModal(bool: boolean) {
    setShowNewClassModal(bool);
  }

  return (
    <>
      <div className="flex flex-wrap my-8 justify-around gap-8">
        <button
          onClick={() => updateShowNewClassModal(true)}
          className="p-6 border w-5/12 md:w-1/4 rounded-lg hover:bg-gray-100 hover:text-black transition"
        >
          <NewClassCard />
        </button>

        {myClasses?.map((c: Class) => (
          <Link
            key={c.id}
            href={`/my-classes/${c.id}`}
            className="p-6 border w-5/12 md:w-1/4 rounded-lg hover:bg-gray-100 hover:text-black transition"
          >
            <ExistingClassCard
              title={c.description}
              subtitle={c.year_group}
              text={c.academic_year_end}
            />
          </Link>
        ))}
      </div>
      {showNewClassModal && (
        <AddNewClassModal
          updateShowNewClassModal={updateShowNewClassModal}
          myClasses={myClasses}
          organisationId={organisationId}
        />
      )}
    </>
  );
};

export default ClassCards;
