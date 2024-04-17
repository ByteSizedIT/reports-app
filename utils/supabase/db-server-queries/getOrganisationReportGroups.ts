"use server";

import { createClient } from "@/utils/supabase/clients/serverClient";

import { ReportGroup } from "@/types/types";

export const getOrganisationReportGroups = async (id: number) => {
  const supabase = createClient();
  const { data: organisationReportGroups, error } = await supabase
    .from("report_group")
    .select("*")
    .eq("organisation_id", id)
    .returns<Array<ReportGroup> | null>();

  console.log(organisationReportGroups?.map((item) => ({ ...item })));

  if (!error) return organisationReportGroups;
  console.log(`Error fetching class details: `, error);
  throw new Error(error.message);
};
