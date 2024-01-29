import AuthButton from "./AuthButton";

const Nav = () => {
  return (
    <nav className="w-full flex justify-between items-center px-8 py-4 text-sm flex-none">
      <p className="cursor-pointer">LOGO</p>
      <AuthButton />
    </nav>
  );
};
export default Nav;
