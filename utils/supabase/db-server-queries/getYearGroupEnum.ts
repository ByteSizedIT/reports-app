import { SupabaseClient } from "@supabase/supabase-js";

// Function to fetch enum values
export const getYearGroupEnums = async (supabase: SupabaseClient) => {
  const { data: yearGroupEnums, error } = await supabase.rpc(
    "get_year_group_enums"
  );

  if (!error) return yearGroupEnums;
  console.log(`Error fetching year group details: `, error);
  throw new Error(error.message);
};
