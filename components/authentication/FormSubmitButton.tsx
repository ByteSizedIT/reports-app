"use client";

// useFormStatus to show pending state while signUp and logIn forms are being submitted - returns the status for a specific <form>, so it must be defined as a child of each <form> element.
import { useFormStatus } from "react-dom";

const FormSubmitButton = ({ buttonLabel }: { buttonLabel: string }) => {
  const { pending } = useFormStatus();
  return (
    <button
      className="bg-green-700 rounded-md px-4 py-2 text-foreground mb-2 aria-disabled:opacity-50"
      aria-disabled={pending}
    >
      {buttonLabel}
    </button>
  );
};
export default FormSubmitButton;
