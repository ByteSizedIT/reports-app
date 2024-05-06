"use client";

import { usePathname } from "next/navigation";

import SessionCondition from "./SessionCondition";

import Logo from "../Logo";

const NavBar = () => {
  const pathname = usePathname();

  // return (
  //   <nav className="w-full flex justify-between items-center h-16 py-4 text-sm">
  //     <Logo />
  //     {pathname !== "/login" && pathname !== "/signup" && <SessionCondition />}
  //   </nav>
  // );

  if (pathname === "/login" || pathname === "/signup")
    return (
      <nav className="w-full flex items-center h-16 py-4 text-sm">
        <Logo />
      </nav>
    );

  return (
    <nav className="w-full flex justify-between items-center h-16 py-4 text-sm">
      <Logo />
      <SessionCondition />
    </nav>
  );
};
export default NavBar;
