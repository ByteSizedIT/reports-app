import { redirect } from "next/navigation";

import { createClient } from "@/utils/supabase/clients/serverClient";
import { UserInfo } from "@/types/types";
import { PostgrestSingleResponse } from "@supabase/supabase-js";

// Protect page, checking user is authenticated - ref supabase docs https://supabase.com/docs/guides/auth/server-side/nextjs *
export async function getAuthenticatedUser() {
  const supabase = createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/login");
  }

  return user;
}

export async function getUserInfo(userId: string): Promise<UserInfo | null> {
  const supabase = createClient();

  const {
    data: userInfoData,
    error: userInfoError,
  }: PostgrestSingleResponse<UserInfo> = await supabase
    .from("user_info")
    .select(
      `uuid, role_id, organisation_id(id, name, address1, address2, postcode, tel_num)`
    )
    .eq("uuid", userId)
    .single();

  if (userInfoError || !userInfoData) {
    console.error("Error fetching user info:", userInfoError.message);
    throw new Error("Error fetching user information.");
  }

  return userInfoData;
}
