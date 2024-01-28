import AuthButton from "./AuthButton";

const Nav = () => {
  return (
    <nav className="w-full flex justify-between h-16 items-center px-8 text-sm flex-none">
      <p className="cursor-pointer">LOGO</p>
      <AuthButton />
    </nav>
  );
};
export default Nav;
