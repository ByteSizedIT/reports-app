import { SupabaseClient } from "@supabase/supabase-js";

import { Student } from "@/types/types";

// Function to fetch Students for given class
export const getClassStudentDetails = async (
  supabase: SupabaseClient,
  class_id: number
) => {
  const { data: classStudentData, error } = await supabase
    .from("class_student")
    .select("student(*)")
    .eq("class_id", class_id)
    .returns<
      Array<{
        student: Student;
      }>
    >();

  if (!error) return classStudentData;
  console.log(`Error fetching previous class's students details: `, error);
  throw new Error(error.message);
};
