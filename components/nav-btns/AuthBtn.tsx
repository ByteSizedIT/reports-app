import { createClient } from "@/utils/supabase/clients/serverClient";
import Link from "next/link";
import { redirect } from "next/navigation";

import MyClassesBtn from "./MyClassesBtn";

export default async function AuthButton() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const signOut = async () => {
    "use server";

    const supabase = createClient();
    await supabase.auth.signOut();
    return redirect("/login");
  };

  return user ? (
    // <div className="w-full m-8 flex items-center justify-between">
    //   <p>Hey, {user.email}!</p>
    <form className="flex items-center gap-4" action={signOut}>
      <MyClassesBtn />
      <button className="py-2 px-4 rounded-md no-underline bg-btn-background hover:bg-btn-background-hover">
        Logout
      </button>
    </form>
  ) : (
    // </div>
    <div className="flex items-center gap-4">
      {" "}
      <Link
        href="/login"
        className="py-2 px-3 flex rounded-md no-underline bg-btn-background hover:bg-btn-background-hover"
      >
        Log In
      </Link>
      <Link
        href="/signup"
        className="py-2 px-3 flex rounded-md no-underline bg-btn-background hover:bg-btn-background-hover"
      >
        Sign Up
      </Link>
    </div>
  );
}
