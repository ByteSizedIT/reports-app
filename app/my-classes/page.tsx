import {
  getAuthenticatedUser,
  getUserInfo,
} from "@/utils/supabase/auth/authService";

import { createClient } from "@/utils/supabase/clients/serverClient";

import ClassCards from "@/components/my-classes/ClassCards";

const MyClasses = async () => {
  const supabase = createClient();

  // Protect page, checking user is authenticated - ref supabase docs https://supabase.com/docs/guides/auth/server-side/nextjs *
  const userId = await getAuthenticatedUser();

  // Check users' organisation to request matching classes
  const userInfoData = await getUserInfo(userId);

  const { data: myClasses } = await supabase
    .from("class")
    .select("*")
    .eq("organisation_id", userInfoData?.organisation_id);

  return (
    <div className="w-full flex flex-col mt-8">
      <h1 className="text-center text-3xl sm:text-4xl font-bold">My Classes</h1>
      <ClassCards
        myClasses={myClasses}
        organisationId={userInfoData?.organisation_id}
      />
    </div>
  );
};

export default MyClasses;
