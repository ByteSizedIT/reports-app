import { redirect, notFound } from "next/navigation";

import { createClient } from "@/utils/supabase/clients/serverClient";

import { getClassDetails } from "@/utils/supabase/db-server-queries/getClassDetails";
import { getStudentComments } from "@/utils/supabase/db-server-queries/getStudentComments";
import PupilSelect from "@/components/pupil-reports/PupilReports";

const PupilReportsPage = async ({
  params: { id },
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

  const classData = await getClassDetails(id);
  if (classData?.[0]?.organisation_id !== userInfoData?.[0]?.organisation_id) {
    notFound();
  }

  const studentComments = await getStudentComments(id);

  return (
    <div className="w-full md:m-8">
      <h1>Generated Pupil Reports</h1>
      <h2 className="text-center pb-4">
        {`${classData?.[0]?.description} Class (${classData?.[0]?.year_group} / ${classData?.[0]?.academic_year_end})`}
      </h2>
      <h3>
        Select individual pupils on left to view/print their generated report
      </h3>
      <PupilSelect classStudents={classData[0].class_student} />
    </div>
  );
};

export default PupilReportsPage;
