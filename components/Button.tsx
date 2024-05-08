"use client";

import Spinner from "./Spinner";

type Props = {
  label?: string;
  pendingLabel?: string;
  color?: string;
  trailingButton?: boolean;
  pending?: boolean;
  small?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  children?: any;
};

const Button = ({
  label,
  pendingLabel,
  color,
  trailingButton,
  pending,
  small,
  disabled,
  onClick,
  children,
}: Props) => {
  return (
    <button
      className={`rounded-md no-underline px-4 py-2 mb-2 ${
        trailingButton ? "ml-2" : ""
      } disabled:opacity-50 ${color}`}
      disabled={pending || disabled}
      onClick={() => (onClick ? onClick() : null)}
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
  );
};

export default Button;
