import { type EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/server-client";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  // When a user clicks their confirmation email link, exchange their secure code for an Auth token.
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = searchParams.get("next") ?? "/";

  const redirectTo = request.nextUrl.clone();
  redirectTo.pathname = next;
  redirectTo.searchParams.delete("token_hash");
  redirectTo.searchParams.delete("type");

  if (token_hash && type) {
    const supabase = createClient();

    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    });

    if (!error) {
      console.log(`Error confirming account. Error: ${error}`);
      // TODO: Send to logging service, e.g Sentry
      redirectTo.searchParams.delete("next");
      return NextResponse.redirect(redirectTo);
    }
  }
  redirectTo.pathname = "/account-confirmation-error";
  return NextResponse.redirect(redirectTo);
}
