"use server";

import { createClient } from "@/utils/supabase/server-client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

export async function logIn(formData: FormData) {
  // TODO: Validate inputs instead of casting types
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const supabase = createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.log(
      `Error running LogIn server action for ${email}. Error: ${error}`
    );
    // TODO: Send to logging service, e.g Sentry
    return redirect("/login?message=Could not authenticate user");
  }
  revalidatePath("/", "layout");
  return redirect("/");
}

export async function signUp(formData: FormData) {
  "use server";

  const origin = headers().get("origin");

  // TODO: Validate inputs instead of casting types
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const supabase = createClient();

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
    },
  });

  if (error) {
    console.log(
      `Error running signUp server action for ${email}. Error: ${error}`
    );
    // TODO: Send to logging service, e.g Sentry
    return redirect("/signup?message=Could not authenticate user");
  }
  revalidatePath("/", "layout");
  return redirect("/signup?message=Check email to continue sign in process");
}
