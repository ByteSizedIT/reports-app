"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { createClient } from "@/utils/supabase/clients/serverClient";

import { PreSaveClass, Student, PreSaveStudent } from "@/types/types";

export const newClassAction = async (
  newClassName: string,
  yearGroup: string,
  organisationId: number,
  academicYearEnd: number,
  userId: string,
  newClassRegister: Array<Student | PreSaveStudent>
) => {
  const supabase = createClient();

  // Confirm user is authenticated
  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError) {
    console.log(
      `Error adding New Class. Failed on getUser from supabase: ${userError}`
    );
    return {
      errorMessage: `⚠️ Could not authenticate user. You must be signed in to perform this action: ${userError.message}`,
    };
  }

  console.log({ userData });

  // Insert New Class
  // ...prep data: create new class object
  const newClass: PreSaveClass = {
    description: newClassName,
    year_group: yearGroup,
    organisation_id: organisationId,
    academic_year_end: academicYearEnd,
    owner: userId,
  };

  const { data: insertedClassData, error: insertClassError } = await supabase
    .from("class")
    .insert({
      ...newClass,
    })
    .select();

  if (insertClassError) {
    console.log(
      `Error adding New Class. Failed on inserting new entry into Class table in supabase: ${insertClassError}`
    );
    return {
      errorMessage: `⚠️ Could not insert new class: ${insertClassError.message}`,
    };
  }

  console.log({ insertedClassData });

  // Insert New Students
  // ...prep data: group new class register in to list of new students and list of existing students
  const { existingStudents, newStudents } = newClassRegister.reduce<{
    existingStudents: Array<Student | PreSaveStudent>;
    newStudents: Array<PreSaveStudent>;
  }>(
    (acc, obj) => {
      if (obj.hasOwnProperty("id")) {
        acc.existingStudents.push(obj);
      } else {
        acc.newStudents.push(obj);
      }
      return acc;
    },
    { existingStudents: [], newStudents: [] }
  );

  console.log({ existingStudents, newStudents });

  const { data: insertedStudentsData, error: insertStudentsError } =
    await supabase.from("student").insert(newStudents).select();

  if (insertStudentsError) {
    console.log(
      `Error adding New Class. Failed on inserting new entries into Student table in supabase: ${insertStudentsError}`
    );
    return {
      errorMessage: `⚠️ Could not insert new students: ${insertStudentsError.message}`,
    };
  }

  console.log({ insertedStudentsData });

  // Add new and existing students to class_student table
  // ...prep data: create list of class_student objects
  const classStudents = [...existingStudents, ...insertedStudentsData].map(
    (student) => ({
      class_id: insertedClassData?.[0].id,
      student_id: student.id,
    })
  );

  const { data: insertedClassStudentsData, error: insertClassStudentsError } =
    await supabase.from("class_student").insert(classStudents).returns();

  if (insertClassStudentsError) {
    console.log(
      `Error adding New Class. Failed on inserting new entries into class_student table in supabase: ${insertClassStudentsError}`
    );
    return {
      errorMessage: `⚠️ Could not insert class_students: ${insertClassStudentsError.message}`,
    };
  }

  // revalidatePath("/my-classes", "layout");
  redirect(`/my-classes/${insertedClassData?.[0].id}`);
};
