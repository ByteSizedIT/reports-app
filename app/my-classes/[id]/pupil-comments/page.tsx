import { notFound, redirect } from "next/navigation";

import PupilComments from "@/components/pupil-comments/PupilComments";

import { createClient } from "@/utils/supabase/clients/serverClient";
import { getClassDetails } from "@/utils/supabase/db-server-queries/getClassDetails";
import { getStudentComments } from "@/utils/supabase/db-server-queries/getStudentComments";

import { StudentsCommentsBySubject } from "@/types/types";

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
  const { data: userInfoData, error: userInfoError } = await supabase
    .from("user_info")
    .select("*")
    .eq("uuid", user.id)
    .single();
  // const { data: userInfoData, error: userInfoError } = await userQuery;
  // TODO: add error handling

  const classData = await getClassDetails(classId);
  if (classData.organisation_id !== userInfoData?.organisation_id) {
    notFound();
  }

  const {
    organisation_id: orgId,
    description: className,
    year_group: classYearGroup,
    academic_year_end: academicYearEnd,
    class_student: classStudents,
    class_subject: classSubjects,
  } = classData;

  const studentComments = await getStudentComments(classId);

  // Create object that groups studentComments by student, then classId
  const studentCommentsBySubject = studentComments.reduce(
    (accum, obj) => ({
      ...accum,
      [obj.student_id]: {
        ...accum[obj.student_id],
        [obj.class_subject_group_id.class_subject.subject.id]: obj,
      },
    }),
    {} as StudentsCommentsBySubject
  );

  return (
    <div className="w-full md:m-8 min-h-full flex flex-col">
      <h1>Personalise Pupil Comments</h1>
      <h2 className="text-center pb-4">
        {`${className} Class (${classYearGroup} / ${academicYearEnd})`}
      </h2>
      <h3>
        Select individual pupils on left to review/edit their comments for each
        subject
      </h3>
      <PupilComments
        orgId={orgId}
        classId={Number(classId)}
        className={className}
        classYearGroup={classYearGroup}
        academicYearEnd={academicYearEnd}
        classStudents={classStudents}
        classSubjects={classSubjects}
        studentsCommentsBySubject={studentCommentsBySubject}
      />
    </div>
  );
};

export default PupilCommentsPage;
