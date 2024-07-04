/**
 * Modified Code from https://github.com/facebook/lexical/blob/main/packages/lexical-playground/src/ui/DropDown.tsx
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { useMemo, useState, useEffect, useCallback } from "react";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { ClearEditorPlugin } from "@lexical/react/LexicalClearEditorPlugin";
import { mergeRegister } from "@lexical/utils";
import {
  $getSelectionStyleValueForProperty,
  $patchStyleText,
} from "@lexical/selection";
import {
  LexicalEditor,
  $getRoot,
  $getSelection,
  $isParagraphNode,
  $isRangeSelection,
  CAN_UNDO_COMMAND,
  CAN_REDO_COMMAND,
  UNDO_COMMAND,
  REDO_COMMAND,
  CLEAR_EDITOR_COMMAND,
  COMMAND_PRIORITY_CRITICAL,
  FORMAT_TEXT_COMMAND,
} from "lexical";

import { CiUndo, CiRedo } from "react-icons/ci";
import {
  AiOutlineBold,
  AiOutlineItalic,
  AiOutlineUnderline,
} from "react-icons/ai";
import { MdDeleteForever } from "react-icons/md";

import DropDown, { DropDownItem } from "@/components/ui/Dropdown";
import Button from "@/components/Button";

const FONT_FAMILY_OPTIONS: [string, string][] = [
  ["Arial", "Arial"],
  ["Courier New", "Courier New"],
  ["Georgia", "Georgia"],
  ["Times New Roman", "Times New Roman"],
  ["Trebuchet MS", "Trebuchet MS"],
  ["Verdana", "Verdana"],
];

export function ToolBarPlugin({ modal }: { modal: boolean }) {
  const [editor] = useLexicalComposerContext();

  const [activeEditor, setActiveEditor] = useState(editor);
  const [isEditorEmpty, setIsEditorEmpty] = useState(true);
  const [isEditable, setIsEditable] = useState(() => editor.isEditable());
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [fontFamily, setFontFamily] = useState<string>("Arial");
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);

  const MandatoryPlugins = useMemo(() => {
    return <ClearEditorPlugin />;
  }, []);

  useEffect(
    function checkEditorEmptyState() {
      return editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          const root = $getRoot();
          const children = root.getChildren();
          if (children.length > 1) {
            setIsEditorEmpty(false);
            return;
          }
          if ($isParagraphNode(children[0])) {
            setIsEditorEmpty(children[0].getChildren().length === 0);
          } else {
            setIsEditorEmpty(false);
          }
        });
      });
    },
    [editor]
  );

  const $updateToolbar = useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      // Update text format
      setIsBold(selection.hasFormat("bold"));
      setIsItalic(selection.hasFormat("italic"));
      setIsUnderline(selection.hasFormat("underline"));
      setFontFamily(
        $getSelectionStyleValueForProperty(selection, "font-family", "Arial")
      );
    }
  }, []);

  useEffect(() => {
    return mergeRegister(
      editor.registerEditableListener((editable) => {
        setIsEditable(editable);
      }),
      activeEditor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          $updateToolbar();
        });
      }),
      activeEditor.registerCommand<boolean>(
        CAN_UNDO_COMMAND,
        (payload) => {
          setCanUndo(payload);
          return false;
        },
        COMMAND_PRIORITY_CRITICAL
      ),
      activeEditor.registerCommand<boolean>(
        CAN_REDO_COMMAND,
        (payload) => {
          setCanRedo(payload);
          return false;
        },
        COMMAND_PRIORITY_CRITICAL
      )
    );
  }, [$updateToolbar, activeEditor, editor]);

  function FontDropDown({
    editor,
    disabled = false,
    value,
  }: {
    editor: LexicalEditor;
    disabled?: boolean;
    value: string;
  }): JSX.Element {
    const handleClick = useCallback(
      (option: string) => {
        editor.update(() => {
          const selection = $getSelection();
          if (selection !== null) {
            $patchStyleText(selection, {
              "font-family": option,
            });
          }
        });
      },
      [editor, value]
    );

    return (
      <DropDown
        disabled={disabled}
        buttonLabel={value} // e.g "font-family"
        buttonAriaLabel="Formatting options for font family"
        modal={modal}
      >
        {FONT_FAMILY_OPTIONS.map(([option, text], index) => {
          return (
            <DropDownItem
              className={`px-2 py-2 cursor-pointer leading-4 text-sm md:text-base flex flex-row flex-shrink-0 justify-between items-center w-full hover:bg-green-700
            ${index === 0 ? "mt-2" : ""} 
            ${index === FONT_FAMILY_OPTIONS.length - 1 ? "mb-2" : ""} 
            ${value === option ? "bg-green-700 border " : ""}
            `}
              onClick={() => handleClick(option)}
              key={option}
            >
              <span
                className={`block
              ${value === "font-family" ? "max-w-40" : "max-w-10"}`}
              >
                {text}
              </span>
            </DropDownItem>
          );
        })}
      </DropDown>
    );
  }

  return (
    <>
      {MandatoryPlugins}
      <div
        className="flex flex-wrap items-center justify-center gap-2 border border-slate-500
         mb-4 p-2"
      >
        <FontDropDown
          disabled={!isEditable}
          value={fontFamily}
          editor={activeEditor}
        />
        <Button
          color={`${modal ? "modal-secondary-button" : "secondary-button"}`}
          small
          disabled={!canUndo || !isEditable}
          onClick={() => {
            editor.dispatchCommand(UNDO_COMMAND, undefined);
          }}
          // title="'Undo (⌘Y OR Ctrl+Y)"
          // type="button"
          aria-label="Undo. Shortcut:'⌘Y' OR 'Ctrl+Y'"
        >
          <CiUndo className="text-xl sm:text-2xl" />
        </Button>
        <Button
          color={`${modal ? "modal-secondary-button" : "secondary-button"}`}
          small
          disabled={!canRedo || !isEditable}
          onClick={() => {
            editor.dispatchCommand(REDO_COMMAND, undefined);
          }}
          // title="'Undo (⌘Z OR Ctrl+Z)"
          // type="button"
          aria-label="Redo. Shortcut:'⌘Z' OR 'Ctrl+Z'"
        >
          <CiRedo className="text-xl sm:text-2xl" />
        </Button>
        <Button
          color={`${modal ? "modal-secondary-button" : "secondary-button"}`}
          small
          disabled={!isEditable}
          onClick={() => {
            editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold");
          }}
          activeBorder={isBold}
          // title="Bold (⌘B OR Ctrl+B)"
          // type="button"
          aria-label="Format text as bold. Shortcut:'⌘B' OR 'Ctrl+B'"
        >
          <AiOutlineBold className="text-xl sm:text-2xl" />
        </Button>
        <Button
          color={`${modal ? "modal-secondary-button" : "secondary-button"}`}
          small
          disabled={!isEditable}
          onClick={() => {
            editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic");
          }}
          activeBorder={isItalic}
          // title={"Italic (⌘I OR Ctrl+I)"}
          // type="button"
          aria-label="Format text as italics. Shortcut: '⌘I' OR 'Ctrl+I'"
        >
          <AiOutlineItalic className="text-xl sm:text-2xl" />
        </Button>
        <Button
          color={`${modal ? "modal-secondary-button" : "secondary-button"}`}
          small
          disabled={!isEditable}
          onClick={() => {
            editor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline");
          }}
          activeBorder={isUnderline}
          // title={"Underline (⌘U OR Ctrl+U)"}
          // type="button"
          aria-label="Format text as italics. Shortcut: '⌘U' OR 'Ctrl+U'"
        >
          <AiOutlineUnderline className="text-xl sm:text-2xl" />
        </Button>
        <Button
          color={`${modal ? "modal-secondary-button" : "secondary-button"}`}
          small
          disabled={isEditorEmpty}
          onClick={() => {
            editor.dispatchCommand(CLEAR_EDITOR_COMMAND, undefined);
          }}
        >
          <MdDeleteForever className="text-xl sm:text-2xl" />
        </Button>
      </div>
    </>
  );
}
