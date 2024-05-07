"use client";

import { useFormState } from "react-dom";

import FormSubmitButton from "@/components/authentication/FormSubmitButton";

import { signUp } from "../actions";
import Link from "next/link";

const initialState = { errorMessage: "", infoMessage: "" };

export default function Login() {
  const [state, formAction] = useFormState(signUp, initialState);

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
        <form
          className="animate-in flex-1 flex flex-col md:w-full max-w-lg justify-center gap-2 py-12 text-foreground"
          action={formAction}
        >
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
          <FormSubmitButton label="Sign Up" pendingLabel="Signing Up" />
          {state?.errorMessage && (
            <p
              className="p-2 bg-foreground/10 text-foreground text-center text-sm text-red-500"
              aria-live="assertive"
            >
              {state.errorMessage}
            </p>
          )}

          {state?.infoMessage && (
            <p
              className="p-2 bg-foreground/10 text-foreground text-center"
              aria-live="assertive"
            >
              {state.infoMessage}
            </p>
          )}

          <p className="text-center text-sm text-foreground/50">
            Already have an account?{" "}
            <Link href="/login" className="text-foreground">
              Log In Now
            </Link>
          </p>
        </form>
      </div>
    </>
  );
}
