"use server";

import { createClient } from "@/utils/supabase/server-client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

import { FormDataSchema } from "@/schemas/zod";

export async function logIn(
  state: { errorMessage: string },
  formData: FormData
) {
  const result = FormDataSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!result?.success) {
    console.log(
      `Error running LogIn server action. Error: ${result.error.message}`
    );
    return {
      errorMessage: `⚠️ ${JSON.parse(result.error.message)[0].message}`,
    };
  }

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
    // return redirect("/login?message=Could not authenticate user");
    return { errorMessage: `⚠️ Could not authenticate user: ${error.message}` };
  }
  revalidatePath("/", "layout");
  return redirect("/");
}

export async function signUp(
  state: { errorMessage: string; infoMessage: string },
  formData: FormData
) {
  const result = FormDataSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!result?.success) {
    console.log(
      `Error running LogIn server action. Error: ${result.error.message}`
    );
    return {
      errorMessage: `⚠️ ${JSON.parse(result.error.message)[0].message}`,
      infoMessage: "",
    };
  }

  const origin = headers().get("origin");

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
    // return redirect("/signup?message=Could not authenticate user");
    return {
      errorMessage: `⚠️ Could not authenticate user: ${error.message}`,
      infoMessage: "",
    };
  }
  revalidatePath("/", "layout");
  // return redirect("/signup?message=Check email to continue sign in process");
  return {
    errorMessage: "",
    infoMessage: `ℹ️ Check email to continue sign in process`,
  };
}
