import { notFound } from "next/navigation";

import PupilComments from "@/components/pupil-comments/PupilComments";

import {
  getAuthenticatedUser,
  getUserInfo,
} from "@/utils/supabase/auth/authService";
import { getClassDetails } from "@/utils/supabase/db-server-queries/getClassDetails";
import { getStudentComments } from "@/utils/supabase/db-server-queries/getStudentComments";

import { StudentsCommentsBySubject } from "@/types/types";

const PupilCommentsPage = async ({
  params: { id: classId },
}: {
  params: { id: string };
}) => {
  const userId = await getAuthenticatedUser();

  // Protect page, checking users' organisation matches that requested
  const userInfoData = await getUserInfo(userId);
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
