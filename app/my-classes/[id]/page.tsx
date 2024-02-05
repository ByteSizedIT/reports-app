import { supabaseStaticClient } from "@/utils/supabase/static";

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
  console.log({ id });
  return (
    <div className="w-full mt-8">
      <h1 className="text-center text-3xl sm:text-4xl font-bold">
        Class ID {id}
      </h1>
    </div>
  );
};

export default ClassPage;
