import { createClient } from "@/utils/supabase/server";

import { cookies } from "next/headers";
import { notFound } from "next/navigation";

import ClassCards from "@/components/ClassCards";

export const revalidate = 0;

const MyClasses = async () => {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { data: myClasses } = await supabase.from("class").select("*");

  if (!myClasses) notFound();

  return (
    <div className="w-full flex flex-col mt-8">
      <h1 className="text-center text-3xl sm:text-4xl font-bold">My Classes</h1>
      <ClassCards myClasses={myClasses} />
    </div>
  );
};

export default MyClasses;
