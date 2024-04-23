"use server";

import { createClient } from "@/utils/supabase/clients/serverClient";

// Function to fetch enum values
export const getPronounEnums = async () => {
  const supabase = createClient();
  const { data: pronounEnums, error } = await supabase.rpc("get_pronoun_enums");

  if (!error) return pronounEnums;
  console.log(`Error fetching class details: `, error);
  throw new Error(error.message);
};
