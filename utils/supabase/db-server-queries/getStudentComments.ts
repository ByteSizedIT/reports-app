"use server";

import { createClient } from "@/utils/supabase/clients/serverClient";

// import { QueryResult, QueryData, QueryError } from "@supabase/supabase-js";
import { StudentComment } from "@/types/types";

// Fetch data for given class
export const getStudentComments = async (classId: string) => {
  const supabase = createClient();
  const response = await supabase
    .from("student_comment")
    .select(`*, class_subject_group_id(class_subject(subject(*)))`)
    .eq("class_id", classId)
    .returns<Array<StudentComment>>();
  const { data: studentComments, error } = response;

  if (!error) return studentComments;
  console.log(`Error fetching class details: `, error);
  throw new Error(error.message);
};
