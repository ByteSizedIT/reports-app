import * as React from "react";
import { useState, useEffect, useMemo, useCallback } from "react";

type DropDownContextType = {
  registerItem: (ref: React.RefObject<HTMLButtonElement>) => void;
};

export const DropDownContext = React.createContext<DropDownContextType | null>(
  null
);

// FUNCTIONAL COMPONENT FOR MANAGING/RENDERING A LIST OF DROPDOWN ITEMS WITHIN A DROPDOWN MENU
const DropDownItems = ({
  children,
  dropDownRef,
  onClose,
}: {
  children: React.ReactNode;
  dropDownRef: React.Ref<HTMLDivElement>;
  onClose: () => void;
}) => {
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
        className="z-50 block fixed shadow-lg border border-green-700 inset-shadow-sm rounded-lg min-w-32 min-h-10 bg-white"
        ref={dropDownRef}
        onKeyDown={handleKeyDown}
      >
        {children}
      </div>
    </DropDownContext.Provider>
  );
};

export default DropDownItems;
