/**
 * Modified Code from https://github.com/facebook/lexical/blob/main/packages/lexical-playground/src/ui/DropDown.tsx
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import * as React from "react";
import {
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { createPortal } from "react-dom";

import DropDownItems from "./DropdownItems";

import { HiMiniChevronDown } from "react-icons/hi2";
import { PiTextT } from "react-icons/pi";

const dropDownPadding = 4;

// FUNCTIONAL COMPONENT FOR RENDERING A DROPDOWN MENU
export default function DropDown({
  disabled = false,
  buttonLabel,
  buttonAriaLabel,
  IconComponent,
  children,
  stopCloseOnClickSelf,
  modal,
  small,
}: {
  disabled?: boolean;
  buttonLabel?: string;
  buttonAriaLabel?: string;
  IconComponent?: React.ComponentType<{ className?: string }>;
  children: ReactNode;
  stopCloseOnClickSelf?: boolean;
  modal: boolean;
  small?: boolean;
}): JSX.Element {
  const dropDownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [showDropDown, setShowDropDown] = useState(false);

  const handleClose = () => {
    setShowDropDown(false);
    if (buttonRef?.current) {
      buttonRef.current.focus();
    }
  };

  useEffect(() => {
    const button = buttonRef.current;
    const dropDown = dropDownRef.current;

    if (showDropDown && button !== null && dropDown !== null) {
      const { top, left } = button.getBoundingClientRect();
      dropDown.style.top = `${top + button.offsetHeight + dropDownPadding}px`;
      dropDown.style.left = `${Math.min(
        left,
        window.innerWidth - dropDown.offsetWidth - 20
      )}px`;
    }
  }, [dropDownRef, buttonRef, showDropDown]);

  useEffect(() => {
    const button = buttonRef.current;

    if (button !== null && showDropDown) {
      const handle = (event: MouseEvent) => {
        const target = event.target;
        if (stopCloseOnClickSelf) {
          if (
            dropDownRef.current &&
            dropDownRef.current.contains(target as Node)
          ) {
            return;
          }
        }
        if (!button.contains(target as Node)) {
          setShowDropDown(false);
        }
      };
      document.addEventListener("click", handle);

      return () => {
        document.removeEventListener("click", handle);
      };
    }
  }, [dropDownRef, buttonRef, showDropDown, stopCloseOnClickSelf]);

  useEffect(() => {
    const handleButtonPositionUpdate = () => {
      if (showDropDown) {
        const button = buttonRef.current;
        const dropDown = dropDownRef.current;
        if (button !== null && dropDown !== null) {
          const { top } = button.getBoundingClientRect();
          const newPosition = top + button.offsetHeight + dropDownPadding;
          if (newPosition !== dropDown.getBoundingClientRect().top) {
            dropDown.style.top = `${newPosition}px`;
          }
        }
      }
    };

    document.addEventListener("scroll", handleButtonPositionUpdate);

    return () => {
      document.removeEventListener("scroll", handleButtonPositionUpdate);
    };
  }, [buttonRef, dropDownRef, showDropDown]);

  return (
    <>
      <button
        type="button"
        disabled={disabled}
        aria-label={buttonAriaLabel || buttonLabel}
        className={`flex rounded-lg ${
          !small ? "w-32" : ""
        } h-9 px-2 py-1 cursor-pointer items-center justify-between whitespace-nowrap overflow-hidden
        ${
          showDropDown ? "border-2 border-green-700" : "border border-slate-500"
        }
        ${modal ? "modal-secondary-button" : "secondary-button"}
        ${disabled ? "cursor-not-allowed" : "hover::bg-gray-200"}
        ${buttonLabel === "font-family" ? "" : ""}`}
        onClick={() => setShowDropDown(!showDropDown)}
        ref={buttonRef}
      >
        {IconComponent && (
          <IconComponent className="text-xl sm:text-2xl mr-2" />
        )}
        {buttonLabel && (
          <span className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap">
            {buttonLabel}
          </span>
        )}
        <HiMiniChevronDown />
      </button>

      {showDropDown &&
        createPortal(
          <DropDownItems dropDownRef={dropDownRef} onClose={handleClose}>
            {children}
          </DropDownItems>,
          document.body
        )}
    </>
  );
}
