import { Session } from "@supabase/supabase-js";

import { signOut } from "./action";

import MyClassesBtn from "./MyClassesBtn";

const WithSession = ({ session }: { session: Session }) => {
  return (
    <div className="w-full flex items-center justify-between">
      <p className="pl-8">Hey, {session.user.email}!</p>
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
