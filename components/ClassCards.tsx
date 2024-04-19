"use client";

import { FaPlus } from "react-icons/fa";

import Card from "./Card";

const ClassCards = ({ myClasses }: { myClasses: any }) => {
  return (
    <div className="flex flex-wrap my-8 justify-around gap-8">
      <Card title="Add Class" href="/add-new-class">
        <FaPlus className="text-green-700 text-2xl sm:text-3xl " />
      </Card>
      {myClasses.map(
        (c: { id: number; description: string; year_group: string }) => (
          <Card
            key={c.id}
            href={`/my-classes/${c.id}`}
            title={c.description}
            subtitle={c.year_group}
          />
        )
      )}
    </div>
  );
};

export default ClassCards;
