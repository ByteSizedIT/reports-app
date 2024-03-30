import { signUp } from "../actions";
import Link from "next/link";

export default function Login({
  searchParams,
}: {
  searchParams: { message: string };
}) {
  return (
    <>
      <Link
        href="/"
        className="absolute left-8 top-16 py-2 px-4 rounded-md no-underline text-foreground bg-btn-background hover:bg-btn-background-hover flex items-center group text-sm"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1"
        >
          <polyline points="15 18 9 12 15 6" />
        </svg>{" "}
        Back
      </Link>
      <div className="flex flex-col w-full justify-center items-center">
        <form className="animate-in flex-1 flex flex-col md:w-full max-w-lg justify-center gap-2 py-6 text-foreground">
          <label className="text-md" htmlFor="email">
            Email
          </label>
          <input
            className="rounded-md px-4 py-2 bg-inherit border mb-6"
            type="email"
            name="email"
            autoComplete="username"
            placeholder="you@example.com"
            required
          />
          <label className="text-md" htmlFor="password">
            Password
          </label>
          <input
            className="rounded-md px-4 py-2 bg-inherit border mb-6"
            type="password"
            name="password"
            autoComplete="new-password"
            placeholder="••••••••"
            required
          />
          <button
            formAction={signUp}
            className="bg-green-700  rounded-md px-4 py-2 text-foreground mb-2"
          >
            Sign Up
          </button>
          <p className="text-center text-sm text-foreground/50">
            Have an account?{" "}
            <Link href="/login" className="text-white">
              Log In Now
            </Link>
          </p>

          {searchParams?.message && (
            <p className="mt-4 p-4 bg-foreground/10 text-foreground text-center">
              {searchParams.message}
            </p>
          )}
        </form>
      </div>
      {/* </div> */}
    </>
  );
}
