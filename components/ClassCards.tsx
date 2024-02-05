"use client";

import { useEffect, useState } from "react";
import { supabaseBrowserClient } from "@/utils/supabase/client";

export default function ClassCards({ myClasses }: { myClasses: any }) {
  const [classes, setClasses] = useState(myClasses);

  const supabase = supabaseBrowserClient();

  return <pre>{JSON.stringify(classes, null, 2)}</pre>;
}
