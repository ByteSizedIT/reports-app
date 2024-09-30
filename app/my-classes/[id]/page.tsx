import { getClassDetails } from "@/utils/supabase/db-server-queries/getClassDetails";
import { getOrganisationSubjects } from "@/utils/supabase/db-server-queries/getOrganisationSubjects";
import { getOrganisationReportGroups } from "@/utils/supabase/db-server-queries/getOrganisationReportGroups";

import { notFound } from "next/navigation";

import { createClient } from "@/utils/supabase/clients/serverClient";

import ClientComponent from "@/components/class-pg/ClientComponent";
import {
  getAuthenticatedUser,
  getUserInfo,
} from "@/utils/supabase/auth/authService";

const ClassPage = async ({
  params: { id: classId },
}: {
  params: { id: string };
}) => {
  const supabase = createClient();

  // Protect page, checking user is authenticated - ref supabase docs https://supabase.com/docs/guides/auth/server-side/nextjs *
  const { id: userId } = await getAuthenticatedUser();

  const userInfoData = await getUserInfo(userId);

  const classData = await getClassDetails(classId);

  // Protect page, checking users' organisation matches that requested in params
  if (classData.organisation_id !== userInfoData?.organisation_id) {
    notFound();
  }

  const organisationSubjectData = await getOrganisationSubjects(
    userInfoData?.organisation_id
  );

  const organisationReportGroupData = await getOrganisationReportGroups(
    userInfoData?.organisation_id
  );

  return (
    <div className="w-full mt-8">
      <h1>Create Group Comments</h1>
      <h2 className="text-center pb-4">
        {`${classData?.description} (${classData?.year_group} / ${classData?.academic_year_end})`}
      </h2>
      <h3>Create pupil groups by subject and write initial shared comments</h3>
      {classData && (
        <ClientComponent
          classData={classData}
          organisationSubjectData={organisationSubjectData}
          organisationReportGroupData={organisationReportGroupData}
        />
      )}
    </div>
  );
};

export default ClassPage;

// *
// https://supabase.com/docs/guides/auth/server-side/nextjs
// Be careful when protecting pages. The server gets the user session from the cookies, which can be spoofed by anyone.
// Always use supabase.auth.getUser() to protect pages and user data.
// Never trust supabase.auth.getSession() inside Server Components. It isn't guaranteed to revalidate the Auth token.
// It's safe to trust getUser() because it sends a request to the Supabase Auth server every time to revalidate the Auth token.
