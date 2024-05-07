"use client";

// useFormStatus to show pending state while signUp and logIn forms are being submitted - returns the status for a specific <form>, so it must be defined as a child of each <form> element.
import { useFormStatus } from "react-dom";
import Spinner from "../Spinner";

const FormSubmitButton = ({ buttonLabel }: { buttonLabel: string }) => {
  const { pending } = useFormStatus();
  return (
    <>
      <button
        className="bg-green-700 rounded-md px-4 py-2 text-foreground mb-2 disabled:opacity-50"
        disabled={pending}
        aria-live="off"
        aria-atomic="true"
      >
        {pending ? <Spinner /> : buttonLabel}
      </button>
      {/* <p className="sr-only" aria-live="assertive">
        {pending ? "logging in" : "login failed"}
      </p> */}
    </>
  );
};
export default FormSubmitButton;
