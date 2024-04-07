import { notFound, redirect } from "next/navigation";

import { createClient } from "@/utils/supabase/server-client";

// import { QueryResult, QueryData, QueryError } from "@supabase/supabase-js";

import { ClassDetails, SubjectDetails } from "@/types/types";

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

  // Fetch data for given class
  const classQuery = supabase
    .from("class")
    .select(
      `
      id, 
      description, 
      academic_year_end, 
      year_group, 
      organisation_id,
      class_subject(
        id, 
        subject(*),
        class_subject_group(
          id,
          group_comment, 
          report_group(*),
          class_subject_group_student(
            student(*)
          )
        )
      )
        `
    )
    .eq("id", id)
    .returns<ClassDetails>();
  // type ClassSubjectGroups = QueryData<typeof classQuery>;
  const { data: classData, error } = await classQuery;
  // TODO: add error handling

  console.log(
    classData?.map((item) => ({
      ...item,
      class_subject: JSON.stringify(item.class_subject),
    }))
  );

  if (classData?.[0]?.organisation_id !== userInfoData?.[0]?.organisation_id) {
    notFound();
  }

  const organisationSubjectQuery = supabase
    .from("organisation_subject")
    .select("organisation_id, subject(*)")
    .eq("organisation_id", userInfoData?.[0]?.organisation_id)
    .returns<SubjectDetails | null>();
  const { data: organisationSubjectData, error: subjectError } =
    await organisationSubjectQuery;
  // TODO: add error handling

  console.log(
    organisationSubjectData?.map((item) => ({
      ...item,
    }))
  );

  return (
    <div className="w-full mt-8">
      <h1 className="text-center">
        {`${classData?.[0]?.description} (${classData?.[0]?.year_group} / ${classData?.[0]?.academic_year_end})`}
      </h1>
      {classData && <ClientComponent classData={classData} />}
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
