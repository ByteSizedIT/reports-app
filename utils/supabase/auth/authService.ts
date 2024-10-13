import { redirect } from "next/navigation";

import { createClient } from "@/utils/supabase/clients/serverClient";
import { UserInfo, UserInfoOrgData } from "@/types/types";
import { PostgrestSingleResponse } from "@supabase/supabase-js";

export async function getAuthenticatedUser() {
  const supabase = createClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  // * see Notes below
  // const {
  //   data: { user },
  //   error: userError,
  // } = await supabase.auth.getUser();

  // if (userError || !user) {
  //   redirect("/login");
  // }

  if (!session?.user.id) redirect("/login");

  return session?.user.id;
}

export async function getUserInfo(userId: string): Promise<UserInfo> {
  const supabase = createClient();

  const {
    data: userInfoData,
    error: userInfoError,
  }: PostgrestSingleResponse<UserInfo> = await supabase
    .from("user_info")
    .select("*")
    .eq("uuid", userId)
    .single();

  if (userInfoError || !userInfoData) {
    console.error("Error fetching user info:", userInfoError.message);
    throw new Error("Error fetching user information.");
  }

  return userInfoData as UserInfo;
}

export async function getUserInfoOrgData(
  userId: string
): Promise<UserInfoOrgData | null> {
  const supabase = createClient();

  const {
    data: userInfoOrgData,
    error: userInfoOrgError,
  }: PostgrestSingleResponse<UserInfoOrgData> = await supabase
    .from("user_info")
    .select(
      `uuid, role_id, organisation_id(id, name, address1, address2, postcode, tel_num)`
    )
    .eq("uuid", userId)
    .single();

  if (userInfoOrgError || !userInfoOrgData) {
    console.error("Error fetching user info:", userInfoOrgError.message);
    throw new Error("Error fetching user information.");
  }

  return userInfoOrgData;
}

// * Notes
// ref supabase docs https://supabase.com/docs/guides/auth/server-side/nextjs:
// Be careful when protecting pages. The server gets the user session from the cookies, which can be spoofed by anyone.
// Always use supabase.auth.getUser() to protect pages and user data.
// Never trust supabase.auth.getSession() inside Server Components. It isn't guaranteed to revalidate the Auth token.
// It's safe to trust getUser() because it sends a request to the Supabase Auth server every time to revalidate the Auth token.

// Nb using getUser to revalidate Auth token and therefore protect pages in middleware. Therefore using getSession from cookies to ascertain user id in individual server components, rather than a repeated server request
