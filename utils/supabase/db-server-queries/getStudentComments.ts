"use server";

import { createClient } from "@/utils/supabase/clients/serverClient";

// import { QueryResult, QueryData, QueryError } from "@supabase/supabase-js";
import { StudentComment } from "@/types/types";

// Fetch data for given class
export const getStudentComments = async (id: string) => {
  const supabase = createClient();
  const response = await supabase
    .from("student_comment")
    .select("*")
    .eq("class_id", id)
    .returns<Array<StudentComment>>();
  const { data: studentComments, error } = response;

  if (!error) return studentComments;
  console.log(`Error fetching class details: `, error);
  throw new Error(error.message);
};
