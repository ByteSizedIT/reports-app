"use server";

import { createClient } from "@/utils/supabase/clients/serverClient";

// import { QueryResult, QueryData, QueryError } from "@supabase/supabase-js";
import { ClassDetails } from "@/types/types";

// Fetch data for given class
export const getClassDetails = async (classId: string) => {
  const supabase = createClient();
  const response = (await supabase
    .from("class")
    .select(
      `
      id, 
      description, 
      academic_year_end, 
      year_group, 
      organisation_id,
      class_student(*, student(*)),
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
    .eq("id", classId)
    .single()) as { data: ClassDetails; error: any };

  const { data: classData, error } = response;

  if (!error) return classData;
  console.log(`Error fetching class details: `, error);
  throw new Error(error.message);
};
