"use client";

import Link from "next/link";

import { usePathname } from "next/navigation";

const MyClassesBtn = () => {
  const pathname = usePathname();

  if (pathname === "/my-classes") return;

  return (
    <Link href="/my-classes">
      <button className="py-2 px-4 rounded-md no-underline bg-btn-background hover:bg-btn-background-hover">
        My Classes
      </button>
    </Link>
  );
};
export default MyClassesBtn;
