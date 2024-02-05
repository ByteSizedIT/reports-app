"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { FaPlus } from "react-icons/fa";

import { supabaseBrowserClient } from "@/utils/supabase/client";

export default function ClassCards({ myClasses }: { myClasses: any }) {
  const [classes, setClasses] = useState(myClasses);

  const supabase = supabaseBrowserClient();

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
    <div className="flex flex-wrap m-8 justify-center gap-8 flex-1">
      <Link
        href={`/add-new-class`}
        className="p-6 border w-full sm:w-1/2 md:w-1/3 lg:w-1/4 xl:w-1/4 rounded-lg hover:bg-gray-100 hover:text-black transition"
      >
        <div className="w-full h-full flex flex-col items-center justify-evenly">
          <h4 className="text-xl font-semibold">Add New Class</h4>
          <FaPlus className="text-green-700 text-3xl sm:text-4xl " />
        </div>
      </Link>
      {classes.map(
        (c: { id: number; description: string; year_group: string }) => (
          <Link
            key={c.id}
            href={`/my-classes/${c.id}`}
            className="p-6 border w-full sm:w-1/2 md:w-1/3 lg:w-1/4 xl:w-1/4 rounded-lg hover:bg-gray-100 hover:text-black transition"
          >
            <div className="w-full h-full flex flex-col items-center justify-center">
              <h4 className="text-xl font-semibold">{c.description}</h4>
              <p className="text-gray-600">Year Group: {c.year_group}</p>
              <div className=""></div>
            </div>
          </Link>
        )
      )}
    </div>
  );
}
