import { redirect } from "next/navigation";

import { createClient } from "@/utils/supabase/clients/serverClient";

import { getPronounEnums } from "@/utils/supabase/db-server-queries/getPronounEnum";

import AddNewClassForm from "@/components/my-classes/new-class/AddNewClassForm";

const AddNewClass = async () => {
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

  // const pronounEnums = await getPronounEnums();

  return (
    <div className="w-full mt-8">
      <h1 className="text-center text-3xl sm:text-4xl font-bold">
        Add New Class
      </h1>
      {/* <AddNewClassForm
        userInfo={userInfo}
        myClasses={myClasses}
        pronouns={pronounEnums}
      /> */}
    </div>
  );
};

export default AddNewClass;
