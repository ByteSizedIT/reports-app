"use client";

import Link from "next/link";

const MyClassesBtn = () => {
  return (
    <Link href="/my-classes">
      <button className="py-2 px-4 rounded-md no-underline bg-btn-background hover:bg-btn-background-hover">
        My Classes
      </button>
    </Link>
  );
};
export default MyClassesBtn;
