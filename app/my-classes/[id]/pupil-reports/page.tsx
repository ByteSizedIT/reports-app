import { redirect, notFound } from "next/navigation";

import { createClient } from "@/utils/supabase/clients/serverClient";

import { getClassDetails } from "@/utils/supabase/db-server-queries/getClassDetails";
import { getStudentComments } from "@/utils/supabase/db-server-queries/getStudentComments";

import { Organisation } from "@/types/types";

import PupilReports from "@/components/pupil-reports/PupilReports";

type UserOrgDetails = {
  uuid: string;
  role_id: string;
  organisation_id: Organisation | Organisation[]; // Allow for both single obj and array. Will always be single as org_id is a unique identifier, but Supabase/ts seem to infer that the type is an array. Therefore managed here and bolow
};

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
  const userQuery = supabase
    .from("user_info")
    .select(`uuid, role_id, organisation_id(*)`)
    .eq("uuid", user.id)
    .single();
  const { data: userInfoData, error: userInfoError } = await userQuery;
  // TODO: add error handling

  const typedUserInfoData = userInfoData as UserOrgDetails;

  console.log(userInfoData);

  // Check if organisation_id is an array or an object - Will always be single as org_id is a unique identifier, but Supabase/ts seem tto infer that the type is an array. Therefore managed here and in
  const usersOrganisation = Array.isArray(typedUserInfoData?.organisation_id)
    ? typedUserInfoData.organisation_id[0] // If it's an array, access the first element
    : typedUserInfoData?.organisation_id; // Otherwise, it's a single object

  const classData = await getClassDetails(id);
  if (classData?.[0]?.organisation_id !== usersOrganisation.id) {
    notFound();
  }

  const studentComments = await getStudentComments(id);

  const classSubjectGroupsDict = classData[0].class_subject.reduce(
    (accum, subject) => {
      const groups = subject.class_subject_group.map((group) => group.id);

      let subjectsByGroupId = groups.reduce((innerAccum, group) => {
        return { ...innerAccum, [group]: subject.subject.description };
      }, {});

      return { ...accum, ...subjectsByGroupId };
    },
    {}
  );

  return (
    <div className="w-full md:m-8">
      <h1>Generated Pupil Reports</h1>
      <h2 className="text-center pb-4">
        {`${classData?.[0]?.description} Class (${classData?.[0]?.year_group} / ${classData?.[0]?.academic_year_end})`}
      </h2>
      <h3>
        Select individual pupils on left to view/print their generated report
      </h3>
      <PupilReports
        classStudents={classData[0].class_student}
        classByLine={`${classData[0].description} | ${classData[0].year_group} | ${classData[0].academic_year_end}`}
        organisation={usersOrganisation}
        studentComments={studentComments}
        classSubjectGroupsDict={classSubjectGroupsDict}
      />
    </div>
  );
};

export default PupilReportsPage;
