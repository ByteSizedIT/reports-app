import { notFound, redirect } from "next/navigation";

import PupilComments from "@/components/pupil-comments/PupilComments";

import { createClient } from "@/utils/supabase/clients/serverClient";
import { getClassDetails } from "@/utils/supabase/db-server-queries/getClassDetails";
import { getStudentComments } from "@/utils/supabase/db-server-queries/getStudentComments";

import { CommentsByStudentIds } from "@/types/types";

const PupilCommentsPage = async ({
  params: { id: classId },
}: {
  params: { id: string };
}) => {
  const supabase = createClient();

  // Protect page, checking user is authenticated - ref supabase docs https://supabase.com/docs/guides/auth/server-side/nextjs *
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) {
    redirect("/login");
  }

  // Protect page, checking users's organisation matches that requested
  const userQuery = supabase.from("user_info").select("*").eq("uuid", user.id);
  const { data: userInfoData, error: userInfoError } = await userQuery;
  // TODO: add error handling

  const classData = await getClassDetails(classId);
  if (classData?.[0]?.organisation_id !== userInfoData?.[0]?.organisation_id) {
    notFound();
  }

  const studentComments = await getStudentComments(classId);

  // Create object that groups studentComments by student
  const commentsByStudentIds = studentComments.reduce((acc, obj) => {
    // If the group doesn't exist, create a new array
    if (!acc[obj.student_id]) {
      acc[obj.student_id] = [];
    }
    // Push the current object into the group array
    acc[obj.student_id].push(obj);
    return acc;
  }, {} as CommentsByStudentIds);

  return (
    <div className="w-full md:m-8 min-h-full flex flex-col">
      <h1>Personalise Pupil Comments</h1>
      <h2 className="text-center pb-4">
        {`${classData?.[0]?.description} Class (${classData?.[0]?.year_group} / ${classData?.[0]?.academic_year_end})`}
      </h2>
      <h3>
        Select individual pupils on left to review/edit their comments for each
        subject
      </h3>
      <PupilComments
        classId={classData[0].id}
        classStudents={classData[0].class_student}
        classSubjects={classData[0].class_subject}
        commentsByStudentIds={commentsByStudentIds}
      />
    </div>
  );
};

export default PupilCommentsPage;
