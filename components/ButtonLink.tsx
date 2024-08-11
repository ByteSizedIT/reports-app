"use client";

import Link from "next/link";

type Props = {
  label?: string;
  color?: string;
  leftMargin?: boolean;
  topMargin?: boolean;
  bottomMargin?: boolean;
  small?: boolean;
  disabled?: boolean;
  href: string;
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

const ButtonLink = ({
  label,
  color,
  leftMargin,
  topMargin,
  bottomMargin,
  small,
  disabled = false,
  href,
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
  const handleClick = (e: React.MouseEvent) => {
    if (disabled) {
      e.preventDefault();
      return;
    }
  };

  return (
    <Link
      className={`rounded-md no-underline 
      ${color}
      ${leftMargin && "ml-2"} 
      ${topMargin && "mt-2"} 
      ${bottomMargin && "mb-2"} 
      ${small ? "px-2 py-1" : "px-4 py-2"}
      disabled:opacity-50 
      ${width}
      ${height}
    `}
      href={disabled ? "#" : href}
      onClick={handleClick}
      id={id}
      aria-describedby={ariaDescribedBy}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onFocus={onFocus}
      onBlur={onBlur}
    >
      <div className="flex justify-center items-center gap-2">
        {label}
        {children}
      </div>
    </Link>
  );
};

export default ButtonLink;
