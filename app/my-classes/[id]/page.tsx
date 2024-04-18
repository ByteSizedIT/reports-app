import { getClassDetails } from "@/utils/supabase/db-server-queries/getClassDetails";
import { getOrganisationSubjects } from "@/utils/supabase/db-server-queries/getOrganisationSubjects";
import { getOrganisationReportGroups } from "@/utils/supabase/db-server-queries/getOrganisationReportGroups";

import { notFound, redirect } from "next/navigation";

import { createClient } from "@/utils/supabase/clients/serverClient";

import ClientComponent from "@/components/class-pg/ClientComponent";

const ClassPage = async ({ params: { id } }: { params: { id: string } }) => {
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

  const organisationSubjectData = await getOrganisationSubjects(
    userInfoData?.[0].organisation_id
  );

  const organisationReportGroupData = await getOrganisationReportGroups(
    userInfoData?.[0].organisation_id
  );

  return (
    <div className="w-full mt-8">
      <h1 className="text-center">
        {`${classData?.[0]?.description} (${classData?.[0]?.year_group} / ${classData?.[0]?.academic_year_end})`}
      </h1>
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
