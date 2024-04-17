"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { FaPlus } from "react-icons/fa";

import { createClient } from "@/utils/supabase/clients/browserClient";

export default function ClassCards({ myClasses }: { myClasses: any }) {
  const [classes, setClasses] = useState(myClasses);

  const supabase = createClient();

  //   useEffect(() => {
  //     setClasses(myClasses);
  //   }, [myClasses]);

  useEffect(() => {
    const channel = supabase
      .channel("*")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "class" },
        (payload) => setClasses((classes: any) => [...classes, payload.new])
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  //   return <pre>{JSON.stringify(classes, null, 2)}</pre>;

  return (
    <div className="flex flex-wrap my-8 justify-around gap-8">
      <Link
        href={`/add-new-class`}
        className="p-6 border w-5/12 md:w-1/4 rounded-lg hover:bg-gray-100 hover:text-black transition"
      >
        <div className="w-full flex flex-col items-center justify-center aspect-square">
          {/* <h4>Add New</h4> */}
          <FaPlus className="text-green-700 text-3xl sm:text-4xl " />
        </div>
      </Link>
      {classes.map(
        (c: { id: number; description: string; year_group: string }) => (
          <Link
            key={c.id}
            href={`/my-classes/${c.id}`}
            className="p-6 border w-5/12 md:w-1/4 rounded-lg hover:bg-gray-100 hover:text-black transition"
          >
            <div className="w-full flex flex-col items-center justify-center aspect-square">
              <h4>{c.description}</h4>
              <p className="text-gray-700">{c.year_group}</p>
              <div className=""></div>
            </div>
          </Link>
        )
      )}
    </div>
  );
}
