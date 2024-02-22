import { supabaseStaticClient } from "@/utils/supabase/static";

import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

import { QueryResult, QueryData, QueryError } from "@supabase/supabase-js";

import { ClassGroup, ClassSubjectGroup } from "@/types/types";

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

  // Fetch data for class
  const supabase = createClient(cookieStore);
  const { data: thisClass } = await supabase
    .from("class")
    .select()
    .eq("id", id)
    .single();
  // console.log({ thisClass });

  // Query to fetch subjects and subject reporting groups for class
  const classSubjectGroupsQuery = supabase
    .from("class_subject_group")
    .select(
      `
      id,
      group_comment,
      report_group(*),
      class_subject(
        subject(*)
      )
    `
    )
    .eq("class_subject.class_id", id);
  // type ClassSubjectGroups = QueryData<typeof classSubjectGroupsQuery>;

  // Query to fetch students (array) for class subject reporting groups
  const studentsQuery = (groupId: number) =>
    supabase
      .from("class_subject_group_student")
      .select("student_id")
      .eq("class_subject_group_id", groupId);

  // Query to fetch student details using the extracted student IDs
  const studentQuery = (studentIds: Array<number>) =>
    supabase
      .from("student")
      .select("id, forename, surname, pronoun, dob, grad_year")
      .in("id", studentIds);
  // type Student = QueryData<typeof classSubjectGroupsQuery>;

  // Query to fetch Student details for all subject reporting groups
  async function fetchStudentDetailsForAllGroups(
    classSubjectReportGroups: ClassGroup[]
  ) {
    // Use Promise.all() to execute fetchStudentDetails for each group concurrently
    const results = await Promise.all(
      classSubjectReportGroups.map(fetchStudentDetails)
    );
    return results;
  }

  // Fetch subjects and subject reporting groups for class
  const { data, error } = await classSubjectGroupsQuery;
  if (error) throw error;
  const classSubjectReportGroups: Array<ClassGroup> = data;
  // const classSubjectReportGroups: ClassSubjectGroups & { students: Student[] } =
  //   data;

  // Fetch Students details
  async function fetchStudentDetails(group: ClassGroup) {
    const { data: students, error } = await studentsQuery(group.id);
    if (error) throw error;
    // Extract student IDs from the result
    const studentIds = students.map((student) => student.student_id);
    // Fetch student details using the extracted student IDs
    const { data: studentDetails, error: studentError } = await studentQuery(
      studentIds
    );
    if (studentError) throw studentError;
    console.log({ studentDetails });

    return {
      ...group,
      students: studentDetails,
    };
  }

  // Fetch Student details

  const updatedGroups = await fetchStudentDetailsForAllGroups(
    classSubjectReportGroups
  );

  if (error) throw error;

  // console.log(
  //   "1....",
  //   updatedGroups?.map(
  //     (item: {
  //       id: number;
  //       group_comment: string | null;
  //       class_subject: object;
  //       report_group: object;
  //       students?: Array<{}>;
  //     }) => ({
  //       ...item,
  //       class_subject: JSON.stringify(item.class_subject),
  //       report_group: JSON.stringify(item["report_group"]),
  //       students: JSON.stringify(item.students),
  //     })
  //   ),
  //   error
  // );

  // console.log({ updatedGroups, error });
  // console.log(
  //   "class with subjects printed out: ",
  //   updatedGroups?.map(
  //     (item: {
  //       id: number;
  //       group_comment: string | null;
  //       class_subject: object;
  //       report_group: object;
  //       students?: Array<{}>;
  //     }) => ({
  //       ...item,
  //       class_subject: JSON.stringify(item.class_subject),
  //       report_group: JSON.stringify(item["report_group"]),
  //       students: JSON.stringify(item.students),
  //     })
  //   ),
  //   error
  // );

  // Group data, nesting a subjects groups (and students) under 1 subject section
  const groupedSubjectData = updatedGroups?.reduce(
    (acc: Array<ClassSubjectGroup>, item: any) => {
      // Get the subject name
      const classSubjectId = item.class_subject.subject.id;

      // Find the index of the class_subject in the accumulator
      const index = acc.findIndex((subject) => subject.id === classSubjectId);
      // If the class_subject is not in the accumulator, add it
      if (index === -1) {
        acc.push({
          ...item.class_subject.subject,
          report_groups: [
            {
              ...item.report_group,
              "class_subject.id": item.id,
              students: item.students || [],
            },
          ],
        });
      } else {
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

  console.log("2", { groupedSubjectData });
  console.log("3", JSON.stringify(groupedSubjectData, null, 2));

  return (
    <div className="w-full mt-8">
      <h1 className="text-center text-3xl sm:text-4xl font-bold">
        {thisClass.description}
      </h1>
      {groupedSubjectData && (
        <ClientComponent groupedSubjectData={groupedSubjectData} />
      )}
    </div>
  );
};

export default ClassPage;
