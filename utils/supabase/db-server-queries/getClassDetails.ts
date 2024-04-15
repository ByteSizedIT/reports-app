"use server";

import { createClient } from "@/utils/supabase/server-client";

// import { QueryResult, QueryData, QueryError } from "@supabase/supabase-js";
import { ClassDetails } from "@/types/types";

// Fetch data for given class
export const getClassDetails = async (id: string) => {
  const supabase = createClient();
  const response = await supabase
    .from("class")
    .select(
      `
      id, 
      description, 
      academic_year_end, 
      year_group, 
      organisation_id,
      class_student(*),
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
  const { data: classData, error } = response;

  console.log(
    classData?.map((item) => ({
      ...item,
      class_student: JSON.stringify(item.class_student),
      class_subject: JSON.stringify(item.class_subject),
    }))
  );

  if (!error) return classData;
  console.log(`Error fetching class details: `, error);
  throw new Error(error.message);
};
