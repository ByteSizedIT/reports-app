"use server";

import { createClient } from "@/utils/supabase/server-client";

import { SubjectDetails } from "@/types/types";

export const getOrganisationSubjects = async (id: number) => {
  const supabase = createClient();
  const { data: organisationSubjectData, error } = await supabase
    .from("organisation_subject")
    .select("organisation_id, subject(*)")
    .eq("organisation_id", id)
    .returns<SubjectDetails | null>();

  console.log(
    organisationSubjectData?.map((item) => ({
      ...item,
    }))
  );

  if (!error) return organisationSubjectData;
  console.log(`Error fetching class details: `, error);
  throw new Error(error.message);
};
