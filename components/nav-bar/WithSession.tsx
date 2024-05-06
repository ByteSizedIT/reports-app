import { Session } from "@supabase/supabase-js";

import { signOut } from "./action";

import MyClassesBtn from "./MyClassesBtn";

import { useAppContext } from "@/app/context";

const WithSession = ({ session }: { session: Session }) => {
  const user = useAppContext();

  return (
    <div className="w-full flex items-center justify-end">
      <p className="p-8 hidden sm:block">
        {/* Logged in: {session.user.email} */}
        Logged in: {user?.user?.email}
        <span className="hidden md:inline">
          {" "}
          | {user?.userInfo?.organisation_id}{" "}
        </span>
      </p>
      <div className="flex items-center gap-4">
        <MyClassesBtn />
        <form action={signOut}>
          <button className="py-2 px-4 rounded-md no-underline bg-btn-background hover:bg-btn-background-hover">
            Logout
          </button>
        </form>
      </div>
    </div>
  );
};
export default WithSession;
