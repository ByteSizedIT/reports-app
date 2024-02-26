import { supabaseStaticClient } from "@/utils/supabase/static";

import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

// import { QueryResult, QueryData, QueryError } from "@supabase/supabase-js";

import { ClassReportGroup, ClassSubjectGroup } from "@/types/types";

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

const ClassPage = async ({ params: { id } }: { params: { id: string } }) => {
  const cookieStore = cookies();

  // Fetch data for given class
  const supabase = createClient(cookieStore);
  // const { data: thisClass } = await supabase
  //   .from("class")
  //   .select()
  //   .eq("id", id)
  //   .single();
  // console.log("1. Class details: ", { thisClass });

  // Query to fetch subject-reporting groups for given class
  const classSubjectGroupsQuery = supabase
    .from("class_subject_group")
    .select(
      `
      id,
      group_comment,
      class_id,
      class(*),
      report_group(*),
      class_subject(
        subject(*)
      )
    `
    )
    .eq("class_id", id); // by itself is a left join
  // type ClassSubjectGroups = QueryData<typeof classSubjectGroupsQuery>;

  // Query to fetch students ids (array) for given class subject-reporting group
  const studentsQuery = (groupId: number) =>
    supabase
      .from("class_subject_group_student")
      .select("student_id")
      .eq("class_subject_group_id", groupId);
  // type Students = QueryData<typeof studentsQuery>;

  // Query to fetch detailed student info given array of student IDs
  const studentQuery = (studentIds: Array<number>) =>
    supabase
      .from("student")
      .select("id, forename, surname, pronoun, dob, grad_year")
      .in("id", studentIds);
  // type Student = QueryData<typeof studentQuery>;

  // Function to add Students details for given class's subject-reporting group
  async function fetchStudentDetails(group: ClassReportGroup) {
    const { data: students, error } = await studentsQuery(group.id);
    if (error) throw error;
    // Extract student IDs from the result
    const studentIds = students.map((student) => student.student_id);
    // Fetch student details using the extracted student IDs
    const { data: studentDetails, error: studentError } = await studentQuery(
      studentIds
    );
    if (studentError) throw studentError;
    // console.log(
    //   "3. Fetched student details for given class-subject-reporting group: ",
    //   { studentDetails }
    // );

    return {
      ...group,
      students: studentDetails,
    };
  }

  // Function to fetch Students details for all a class's subject-reporting groups
  async function fetchStudentDetailsForAllGroups(
    classSubjectReportGroups: ClassReportGroup[]
  ) {
    // Use Promise.all() to execute fetchStudentDetails for each group concurrently
    const results = await Promise.all(
      classSubjectReportGroups.map(fetchStudentDetails)
    );
    return results;
  }

  // Fetch subjects and subject reporting groups for given class
  const { data, error } = await classSubjectGroupsQuery;
  if (error) throw error;
  const classSubjectReportGroups: Array<ClassReportGroup> = data;
  // const classSubjectReportGroups: ClassSubjectGroups & { students: Student[] } =
  //   data;
  // console.log(
  //   "2. Initial subject-report groups for given class",
  //   classSubjectReportGroups?.map((item: ClassReportGroup) => ({
  //     ...item,
  //     class_subject: JSON.stringify(item.class_subject),
  //     report_group: JSON.stringify(item["report_group"]),
  //   })),
  //   error
  // );

  // Fetch Student details, updating the class's subject-reporting groups with them
  const updatedGroups = await fetchStudentDetailsForAllGroups(
    classSubjectReportGroups
  );

  if (error) throw error;

  // console.log(
  //   "4: Updated subject-report groups, with students added, for given class",
  //   {
  //     updatedGroups,
  //     error,
  //   }
  // );
  // console.log(
  //   "5. Updated subject-report groups, with students added, for given class - objects printed out: ",
  //   updatedGroups?.map((item: ClassReportGroup) => ({
  //     ...item,
  //     class_subject: JSON.stringify(item.class_subject),
  //     report_group: JSON.stringify(item["report_group"]),
  //     students: JSON.stringify(item.students),
  //   })),
  //   error
  // );

  // console.log({ updatedGroups });
  // Refactor data, nesting reporting groups (and students) under 1 property for each subject
  const groupedSubjectData = updatedGroups?.reduce(
    (acc: Array<ClassSubjectGroup>, item: any) => {
      // Get the subject name
      const classSubjectId = item.class_subject?.subject?.id;

      // Find the index of the class_subject in the accumulator
      const index = acc.findIndex((subject) => subject.id === classSubjectId);
      // If the class_subject is not in the accumulator, add it
      if (index === -1) {
        acc.push({
          ...item.class_subject?.subject,
          report_groups: [
            {
              ...item.report_group,
              "class_subject.id": item.id,
              students: item.students || [],
            },
          ],
        });
      } else {
        // Else add it
        (acc[index]?.["report_groups"]).push({
          ...item["report_group"],
          "class_subject.id": item.id,
          students: item.students || [],
        });
      }
      return acc;
    },
    []
  );

  // console.log(
  //   "6. Refactored data, grouped by subject with reporting groups nested",
  //   { groupedSubjectData }
  // );
  console.log(
    "7. Refactored data, grouped by subject with reporting groups nested - objects printed out",
    JSON.stringify(groupedSubjectData, null, 2)
  );

  return (
    <div className="w-full mt-8">
      <h1 className="text-center text-3xl sm:text-4xl font-bold">
        {/* {thisClass.description} */}
        {classSubjectReportGroups?.[0]?.class?.[0]?.description}
      </h1>
      {groupedSubjectData && (
        <ClientComponent groupedSubjectData={groupedSubjectData} />
      )}
    </div>
  );
};

export default ClassPage;
