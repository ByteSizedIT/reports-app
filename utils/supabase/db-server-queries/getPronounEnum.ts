import { SupabaseClient } from "@supabase/supabase-js";

// Function to fetch enum values
export const getPronounEnums = async (supabase: SupabaseClient) => {
  const { data: pronounEnums, error } = await supabase.rpc("get_pronoun_enums");

  if (!error) return pronounEnums;
  console.log(`Error fetching class details: `, error);
  throw new Error(error.message);
};
