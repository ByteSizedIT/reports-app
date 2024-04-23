import { redirect } from "next/navigation";

import { createClient } from "@/utils/supabase/clients/serverClient";

import ClassCards from "@/components/ClassCards";

const MyClasses = async () => {
  const supabase = createClient();

  // Protect page, checking user is authenticated - ref supabase docs https://supabase.com/docs/guides/auth/server-side/nextjs *
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/login");
  }

  const { data: userInfo } = await supabase
    .from("user_info")
    .select("*")
    .eq("uuid", user.id)
    .single();

  const { data: myClasses } = await supabase
    .from("class")
    .select("*")
    .eq("organisation_id", userInfo.organisation_id);

  return (
    <div className="w-full flex flex-col mt-8">
      <h1 className="text-center text-3xl sm:text-4xl font-bold">My Classes</h1>
      <ClassCards
        myClasses={myClasses}
        organisationId={userInfo.organisation_id}
      />
    </div>
  );
};

export default MyClasses;
