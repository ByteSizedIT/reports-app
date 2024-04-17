import Link from "next/link";

const WithoutSession = () => {
  return (
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
};
export default WithoutSession;
