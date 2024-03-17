import { supabaseStaticClient } from "@/utils/supabase/static";

import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

// import { QueryResult, QueryData, QueryError } from "@supabase/supabase-js";

import { ClassDetails } from "@/types/types";

import ClientComponent from "@/components/class-pg/ClientComponent";

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

export const revalidate = 0;

const ClassPage = async ({ params: { id } }: { params: { id: string } }) => {
  const cookieStore = cookies();

  // Fetch data for given class

  const supabase = createClient(cookieStore);

  // subject_id, report_group_id student_id
  const classQuery = supabase
    .from("class")
    .select(
      `
      id, 
      description, 
      academic_year_end, 
      year_group, 
      class_subject(
        id, 
        subject(*),
        class_subject_group(
          id,
          group_comment, 
          report_group(*),
          class_subject_group_student(
            student(*)
          )
        )
      )
        `
    )
    .eq("id", id)
    .returns<ClassDetails>();
  // type ClassSubjectGroups = QueryData<typeof classQuery>;

  const { data: classData, error } = await classQuery;

  console.log(
    classData?.map((item) => ({
      ...item,
      class_subject: JSON.stringify(item.class_subject),
    }))
  );

  return (
    <div className="w-full mt-8">
      <h1 className="text-center">
        {`${classData?.[0]?.description} (${classData?.[0]?.year_group} / ${classData?.[0]?.academic_year_end})`}
      </h1>
      {classData && <ClientComponent classData={classData} />}
    </div>
  );
};

export default ClassPage;
