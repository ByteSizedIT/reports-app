"use client";

import FormSubmitButton from "../FormSubmitButton";

const ModalInnerAdd = ({
  title,
  children,
  updateShowModal,
  saveContent,
  formAction,
  formState,
}: {
  title: string;
  children?: React.ReactNode;
  updateShowModal: (bool: boolean) => void;
  saveContent?: () => void;
  formAction?: (payload: FormData) => void;
  formState?: { errorMessage: string };
}) => {
  return (
    <>
      {/* <div className="flex flex-col h-full items-center text-black text-xs sm:text-base"> */}
      <h4>{title}</h4>
      <form
        className="w-full h-full flex flex-col sm:w-3/4 md:w-1/2 mt-4 md:mt-8"
        action={formAction}
      >
        <div className="flex flex-1 flex-col items-center">{children}</div>
        <div className="flex justify-center">
          {formAction ? (
            <FormSubmitButton label="Save" pendingLabel="Saving" />
          ) : (
            <button
              type="button"
              className="ml-2 mb-2 py-2 px-4 rounded-md no-underline bg-btn-background hover:bg-green-700 focus:bg-green-700 text-foreground"
              onClick={saveContent}
            >
              Save
            </button>
          )}
          <button
            type="button"
            className="ml-2 mb-2 py-2 px-4 rounded-md no-underline bg-btn-background hover:bg-green-700 focus:bg-green-700 text-white"
            onClick={() => updateShowModal(false)}
          >
            Cancel
          </button>
        </div>
        {formState?.errorMessage && (
          <p
            className="p-2 bg-foreground/10 text-foreground text-center text-sm text-red-500"
            aria-live="assertive"
          >
            {formState.errorMessage}
          </p>
        )}
      </form>
      {/* </div> */}
    </>
  );
};
export default ModalInnerAdd;
