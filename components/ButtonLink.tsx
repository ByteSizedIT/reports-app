"use client";

import { useState } from "react";
import Link from "next/link";

type Props = {
  tooltipText: string;
  label?: string;
  color?: string;
  disabled?: boolean;
  href: string;
  children?: React.ReactNode;
  width?: string;
  height?: string;
  id?: string;
  ariaDescribedBy?: string;
};

const ButtonLink = ({
  tooltipText,
  label,
  color,
  disabled = false,
  href,
  width,
  height,
  id,
  ariaDescribedBy,
}: Props) => {
  const [tooltipVisible, setTooltipVisible] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    if (disabled) {
      e.preventDefault();
      return;
    }
  };

  return (
    <div className="relative text-center">
      <Link
        className={`block rounded-md no-underline px-4 py-2
              ${color}
              ${disabled ? "opacity-50" : ""}
              ${width}
              ${height}
              `}
        href={disabled ? "#" : href}
        onClick={handleClick}
        id={id}
        aria-describedby={ariaDescribedBy}
        onMouseEnter={() => setTooltipVisible(true)}
        onMouseLeave={() => setTooltipVisible(false)}
        onFocus={() => setTooltipVisible(true)}
        onBlur={() => setTooltipVisible(false)}
      >
        {label}
      </Link>
      {disabled && tooltipVisible && (
        <div
          id={ariaDescribedBy}
          role="tooltip"
          className={`absolute bottom-full mb-2 w-full bg-branding-background text-white text-center rounded-xl py-1 px-2 transition-opacity duration-200`}
        >
          {tooltipText}
          <div
            className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[5px] border-t-branding-background"
            aria-hidden="true"
          />
        </div>
      )}
    </div>
  );
};

export default ButtonLink;
