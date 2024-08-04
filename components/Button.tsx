"use client";

import Spinner from "./Spinner";

type Props = {
  label?: string;
  pendingLabel?: string;
  color?: string;
  leftMargin?: boolean;
  topMargin?: boolean;
  bottomMargin?: boolean;
  activeBorder?: boolean;
  selectedBorder?: string;
  pending?: boolean;
  small?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  children?: React.ReactNode;
  width?: string;
  height?: string;
  id?: string;
  ariaDescribedBy?: string;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  onFocus?: () => void;
  onBlur?: () => void;
};

const Button = ({
  label,
  pendingLabel,
  color,
  leftMargin,
  topMargin,
  bottomMargin,
  activeBorder,
  pending,
  small,
  disabled,
  onClick,
  children,
  width,
  height,
  id,
  ariaDescribedBy,
  onMouseEnter,
  onMouseLeave,
  onFocus,
  onBlur,
}: Props) => {
  return (
    <button
      className={`rounded-md no-underline 
      ${color}
      ${leftMargin && "ml-2"} 
      ${topMargin && "mt-2"} 
      ${bottomMargin && "mb-2"} 
      ${activeBorder ? "border-2 border-green-700" : "border border-slate-500"}
      ${small ? "px-2 py-1" : "px-4 py-2"}
      disabled:opacity-50 
      ${width}
      ${height}
    `}
      disabled={pending || disabled}
      onClick={onClick}
      id={id}
      aria-describedby={ariaDescribedBy}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onFocus={onFocus}
      onBlur={onBlur}
    >
      {pending ? (
        <div className="flex justify-center items-center gap-2">
          {pendingLabel}
          <Spinner />
        </div>
      ) : (
        <div className="flex justify-center items-center gap-2">
          {label}
          {children}
        </div>
      )}
    </button>
  );
};

export default Button;
