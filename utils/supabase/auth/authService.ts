import { createClient } from "@/utils/supabase/clients/serverClient";
import { UserInfo } from "@/types/types";
import { PostgrestSingleResponse } from "@supabase/supabase-js";

export async function getAuthenticatedUser() {
  const supabase = createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    console.warn(
      "No user found or user is not authenticated",
      userError?.message
    );
    throw new Error("Failed to fetch user information.");
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

  if (userInfoError) {
    console.error("Error fetching user info:", userInfoError.message);
    throw new Error("Failed to fetch user information.");
  }

  if (!userInfoData.organisation_id) {
    console.error("No organisation ID found for user:", userId);
    throw new Error("User information is incomplete.");
  }

  return userInfoData;
}
