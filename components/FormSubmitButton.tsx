"use client";

// useFormStatus to show pending state while signUp and logIn forms are being submitted - returns the status for a specific <form>, so it must be defined as a child of each <form> element.
import { useFormStatus } from "react-dom";
import Spinner from "./Spinner";

const FormSubmitButton = ({
  label,
  pendingLabel,
  bottomMargin,
}: {
  label: string;
  pendingLabel: string;
  bottomMargin?: boolean;
}) => {
  const { pending } = useFormStatus();
  return (
    <>
      <button
        className={`bg-branding-background rounded-md px-4 py-2 text-branding-foreground foreground hover:bg-branding-background-hover disabled:opacity-50 ${
          bottomMargin && "mb-2"
        }`}
        disabled={pending}
        aria-live="off"
        aria-atomic="true"
      >
        {pending ? (
          <div className="flex justify-center items-center gap-2">
            {pendingLabel}
            <Spinner />
          </div>
        ) : (
          label
        )}
      </button>
      {/* <p className="sr-only" aria-live="assertive">
        {pending ? "logging in" : "login failed"}
      </p> */}
    </>
  );
};
export default FormSubmitButton;
