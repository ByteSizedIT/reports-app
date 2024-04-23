"use server";

import { createClient } from "@/utils/supabase/clients/serverClient";

import { Student } from "@/types/types";

// Fetch Students for given class
export const getClassStudentDetails = async (class_id: number) => {
  const supabase = createClient();
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
  console.log(`Error fetching class details: `, error);
  throw new Error(error.message);
};
