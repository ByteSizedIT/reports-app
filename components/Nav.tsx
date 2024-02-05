"use client";

import { usePathname } from "next/navigation";

import Logo from "./Logo";

const Nav = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();

  return (
    <nav className="w-full flex justify-between items-center h-16 px-8 py-4 text-sm flex-none">
      <Logo />
      {pathname !== "/login" && pathname !== "/signup" && children}
    </nav>
  );
};
export default Nav;
