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

import { HiMiniChevronDown } from "react-icons/hi2";
import { PiTextT } from "react-icons/pi";

type DropDownContextType = {
  registerItem: (ref: React.RefObject<HTMLButtonElement>) => void;
};

const DropDownContext = React.createContext<DropDownContextType | null>(null);

const dropDownPadding = 4;

// FUNCTION COMPONENT FOR CREATING A SINGLE DROPDOWN ITEM (button)
export function DropDownItem({
  children,
  className,
  onClick,
  title,
}: {
  children: React.ReactNode;
  className: string;
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
  title?: string;
}) {
  const ref = useRef<HTMLButtonElement>(null);

  const dropDownContext = React.useContext(DropDownContext);

  if (dropDownContext === null) {
    throw new Error("DropDownItem must be used within a DropDown");
  }

  const { registerItem } = dropDownContext;

  useEffect(() => {
    if (ref && ref.current) {
      registerItem(ref);
    }
  }, [ref, registerItem]);

  return (
    <button
      className={`${className}`}
      onClick={onClick}
      ref={ref}
      title={title}
      type="button"
    >
      {children}
    </button>
  );
}

// FUNCTIONAL COMPONENT FOR MANAGING/RENDERING A LIST OF DROPDOWN ITEMS WITHIN A DROPDOWN MENU
function DropDownItems({
  children,
  dropDownRef,
  onClose,
}: {
  children: React.ReactNode;
  dropDownRef: React.Ref<HTMLDivElement>;
  onClose: () => void;
}) {
  const [items, setItems] = useState<React.RefObject<HTMLButtonElement>[]>();
  const [highlightedItem, setHighlightedItem] =
    useState<React.RefObject<HTMLButtonElement>>();

  // Function is used by DropDownItem components to register themselves when they are mounted. Context (DropDownContext) use below to share the registerItem function with children (DropDownItem components) to register themselves on mount
  const registerItem = useCallback(
    (itemRef: React.RefObject<HTMLButtonElement>) => {
      setItems((prev) => (prev ? [...prev, itemRef] : [itemRef]));
    },
    [setItems]
  );

  // For why use use Memo when registerItem is already memoized in a useCallback, see xx-reference-notes-xx/dropdown.txt
  const contextValue = useMemo(
    () => ({
      registerItem,
    }),
    [registerItem]
  );

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!items) {
      return;
    }
    const key = event.key;
    if (["Escape", "ArrowUp", "ArrowDown", "Tab"].includes(key)) {
      event.preventDefault();
    }
    if (key === "Escape" || key === "Tab") {
      onClose();
    } else if (key === "ArrowUp") {
      setHighlightedItem((prev) => {
        if (!prev) {
          return items[0];
        }
        const index = items.indexOf(prev) - 1;
        return items[index === -1 ? items.length - 1 : index];
      });
    } else if (key === "ArrowDown") {
      setHighlightedItem((prev) => {
        if (!prev) {
          return items[0];
        }
        return items[items.indexOf(prev) + 1];
      });
    }
  };

  useEffect(() => {
    if (items && !highlightedItem) {
      setHighlightedItem(items[0]);
    }
    if (highlightedItem?.current) {
      highlightedItem.current.focus(); // need to explicitly set focus when navigating with arrow keys (in handle )
    }
  }, [items, highlightedItem]);

  return (
    <DropDownContext.Provider value={contextValue}>
      <div
        className="z-50 block fixed shadow-lg border border-green-700 inset-shadow-sm rounded-lg min-h-10 bg-white"
        ref={dropDownRef}
        onKeyDown={handleKeyDown}
      >
        {children}
      </div>
    </DropDownContext.Provider>
  );
}

// FUNCTIONAL COMPONENT FOR RENDERING A DROPDOWN MENU
export default function DropDown({
  disabled = false,
  buttonLabel,
  buttonAriaLabel,
  children,
  stopCloseOnClickSelf,
  modal,
}: {
  disabled?: boolean;
  buttonAriaLabel?: string;
  buttonLabel?: string;
  children: ReactNode;
  stopCloseOnClickSelf?: boolean;
  modal: boolean;
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
        className={`flex rounded-lg px-2 py-1 cursor-pointer items-center justify-between whitespace-nowrap overflow-hidden
        ${
          showDropDown ? "border-2 border-green-700" : "border border-slate-500"
        }
        ${modal ? "modal-secondary-button" : "secondary-button"}
        ${disabled ? "cursor-not-allowed" : "hover::bg-gray-200"}
        ${buttonLabel === "font-family" ? "" : ""}`}
        onClick={() => setShowDropDown(!showDropDown)}
        ref={buttonRef}
      >
        <PiTextT className="text-xl sm:text-2xl" />
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
