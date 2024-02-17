import { supabaseStaticClient } from "@/utils/supabase/static";

import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

export const generateStaticParams = async () => {
  const supabase = supabaseStaticClient();
  const { data: classes } = await supabase.from("class").select("id::text");
  // nb "id::text" is SQL syntax to cast id as string, or data type of text, similar to what cld be achieved using JS below
  // const { data: classes } = await supabase.from("class").select("id");
  // const stringIDs = classes?.map((c) => {
  //   id: c.id.toString();
  // });
  // return stringIds ?? [];
  return classes ?? [];
};

const ClassPage = async ({ params: { id } }: { params: { id: string } }) => {
  const cookieStore = cookies();

  // Fetch data for class
  const supabase = createClient(cookieStore);
  const { data: thisClass } = await supabase
    .from("class")
    .select()
    .eq("id", id)
    .single();

  // console.log({ thisClass });

  // Fetch subjects and subject reporting groups for class
  const { data: groups, error } = await supabase
    .from("class_subject_group")
    .select(
      `
      id,
      group_comment,
      report_group(*),
      class_subject(
        subject(*)
      )
    `
    )
    .eq("class_subject.class_id", id);

  console.log({ groups });
  console.log({
    groups: groups?.map(
      (item: {
        id: number;
        group_comment: string | null;
        class_subject: object;
        report_group: object;
      }) => ({
        ...item,
        class_subject: JSON.stringify(item.class_subject),
        report_group: JSON.stringify(item["report_group"]),
      })
    ),
    error,
  });

  return (
    <div className="w-full mt-8">
      <h1 className="text-center text-3xl sm:text-4xl font-bold">
        Class ID {id}
      </h1>
    </div>
  );
};

export default ClassPage;
