"use client";

import { useEffect, useState } from "react";
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

  return <pre>{JSON.stringify(classes, null, 2)}</pre>;
}
