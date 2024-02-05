import { createClient } from "@/utils/supabase/server";

import { cookies } from "next/headers";
import { notFound } from "next/navigation";

export const revalidate = 0;

const MyClasses = async () => {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { data: myClasses } = await supabase.from("class").select("*");

  if (!myClasses) notFound();

  return <pre>{JSON.stringify(myClasses, null, 2)}</pre>;
};

export default MyClasses;
