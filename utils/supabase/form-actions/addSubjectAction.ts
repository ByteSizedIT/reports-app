"use server";

import { createClient } from "@/utils/supabase/clients/serverClient";

export const addSubjectAction = async (
  state: { errorMessage: string },
  formData: FormData
) => {
  const formDataObj: { [key: string]: any } = {};
  formData.forEach((value, key) => {
    formDataObj[key] = value;
  });

  const supabase = createClient();

  // Confirm user is authenticated
  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError) {
    console.log(
      `Error adding New Class. Failed on getUser from supabase: ${userError}`
    );
    return {
      errorMessage: `⚠️ Could not authenticate user. You must be signed in to perform this action: ${userError.message}`,
    };
  }

  console.log({ userData });

  return;
};
