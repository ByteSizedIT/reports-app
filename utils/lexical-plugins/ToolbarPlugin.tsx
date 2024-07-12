/**
 * Includes modified Code from https://github.com/facebook/lexical/blob/main/packages/lexical-playground/src/ui/DropDown.tsx
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { useMemo, useState, useEffect, useCallback, useRef } from "react";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { ClearEditorPlugin } from "@lexical/react/LexicalClearEditorPlugin";
import { $findMatchingParent, mergeRegister } from "@lexical/utils";
import {
  $createHeadingNode,
  $isHeadingNode,
  HeadingTagType,
  $createQuoteNode,
} from "@lexical/rich-text";
import {
  $getSelectionStyleValueForProperty,
  $patchStyleText,
  $setBlocksType,
} from "@lexical/selection";
import {
  LexicalEditor,
  $getRoot,
  $getSelection,
  $isRootOrShadowRoot,
  $isParagraphNode,
  $isRangeSelection,
  $createParagraphNode,
  CAN_UNDO_COMMAND,
  CAN_REDO_COMMAND,
  UNDO_COMMAND,
  REDO_COMMAND,
  CLEAR_EDITOR_COMMAND,
  COMMAND_PRIORITY_CRITICAL,
  FORMAT_TEXT_COMMAND,
} from "lexical";

import { BsTextParagraph, BsChatLeftQuote } from "react-icons/bs";
import { RiH1, RiH2, RiH3, RiH4, RiH5, RiH6 } from "react-icons/ri";
import { CiUndo, CiRedo } from "react-icons/ci";
import {
  AiOutlineBold,
  AiOutlineItalic,
  AiOutlineUnderline,
} from "react-icons/ai";
import { MdDeleteForever } from "react-icons/md";

import DropDown from "@/components/toolbar-ui/Dropdown";
import DropDownItem from "@/components/toolbar-ui/DropdownItem";
import Button from "@/components/Button";

// CODE FOR BLOCK TEXT STYLE SELECTION

const BLOCK_TYPE_OPTIONS = [
  { name: "paragraph", description: "Normal", iconComponent: BsTextParagraph },
  { name: "h1", description: "Heading 1", iconComponent: RiH1 },
  { name: "h2", description: "Heading 2", iconComponent: RiH2 },
  { name: "h3", description: "Heading 3", iconComponent: RiH3 },
  { name: "h4", description: "Heading 4", iconComponent: RiH4 },
  { name: "quote", description: "Quote", iconComponent: BsChatLeftQuote },
];

function BlockFormatDropdown({
  editor,
  blockType,
  disabled = false,
  modal,
}: {
  blockType: (typeof BLOCK_TYPE_OPTIONS)[number]["name"]; // used to obtain union type of name name properties of the objects within the blockTypeToBlockName array.
  editor: LexicalEditor;
  disabled?: boolean;
  modal: boolean;
}): JSX.Element {
  function formatAsParagraph() {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        $setBlocksType(selection, () => $createParagraphNode());
      }
    });
  }

  function formatAsHeading(headingSize: HeadingTagType) {
    if (blockType !== headingSize) {
      editor.update(() => {
        const selection = $getSelection();
        $setBlocksType(selection, () => $createHeadingNode(headingSize));
      });
    }
  }

  const formatAsQuote = () => {
    if (blockType !== "quote") {
      editor.update(() => {
        const selection = $getSelection();
        $setBlocksType(selection, () => $createQuoteNode());
      });
    }
  };

  return (
    <DropDown
      disabled={disabled}
      buttonAriaLabel="Formatting options for text style"
      buttonLabel={
        BLOCK_TYPE_OPTIONS.find((item) => item.name === blockType)?.description
      }
      IconComponent={
        BLOCK_TYPE_OPTIONS.find((item) => item.name === blockType)
          ?.iconComponent
      }
      modal={modal}
    >
      {BLOCK_TYPE_OPTIONS.map((item, index) => {
        const { name, description } = item;
        return (
          <DropDownItem
            key={description}
            className={`
              px-2 py-2 cursor-pointer leading-4 text-sm md:text-base flex flex-row flex-shrink-0 gap-4 items-center w-full hover:bg-green-700
              ${blockType === name ? "bg-green-700 border " : ""}
              ${index === 0 ? "mt-2" : ""} 
              ${index === BLOCK_TYPE_OPTIONS.length - 1 ? "mb-2" : ""}
              `}
            onClick={
              item.description.startsWith("Heading")
                ? () => formatAsHeading(name as HeadingTagType)
                : item.description === "Quote"
                ? formatAsQuote
                : formatAsParagraph
            }
          >
            <item.iconComponent className="text-xl sm:text-2xl" />
            <span className="text">{item.description}</span>
          </DropDownItem>
        );
      })}
    </DropDown>
  );
}

// CODE FOR FONT FAMILY SELECTION

const FONT_FAMILY_OPTIONS: [string, string][] = [
  ["Arial", "Arial"],
  ["Courier New", "Courier New"],
  ["Georgia", "Georgia"],
  ["Times New Roman", "Times New Roman"],
  ["Trebuchet MS", "Trebuchet MS"],
  ["Verdana", "Verdana"],
];

function FontDropDown({
  editor,
  disabled = false,
  value,
  modal,
}: {
  editor: LexicalEditor;
  disabled?: boolean;
  value: string;
  modal: boolean;
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
    [editor]
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

export function ToolBarPlugin({
  modal,
  updateToolbarHeight,
}: {
  modal: boolean;
  updateToolbarHeight: (height: number) => void;
}) {
  const [editor] = useLexicalComposerContext();
  const toolBarRef = useRef<HTMLDivElement>(null);

  const [activeEditor, setActiveEditor] = useState(editor);
  const [isEditorEmpty, setIsEditorEmpty] = useState(true);
  const [isEditable, setIsEditable] = useState(() => editor.isEditable());
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [blockType, setBlockType] =
    useState<(typeof BLOCK_TYPE_OPTIONS)[number]["name"]>("paragraph");
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

  const updateToolbar = useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      // Update text format
      setIsBold(selection.hasFormat("bold"));
      setIsItalic(selection.hasFormat("italic"));
      setIsUnderline(selection.hasFormat("underline"));
      setFontFamily(
        $getSelectionStyleValueForProperty(selection, "font-family", "Arial")
      );

      // Identify anchor node (as const 'element') on Editor
      const anchorNode = selection.anchor.getNode();
      let element =
        anchorNode.getKey() === "root" // .getKey is a method on the LexicalNode class
          ? anchorNode
          : $findMatchingParent(anchorNode, (e) => {
              const parent = e.getParent();
              return parent !== null && $isRootOrShadowRoot(parent);
            });
      if (element === null) {
        element = anchorNode.getTopLevelElementOrThrow();
      }

      // Identify anchor node (as 'elementDom') on activeEditor
      const elementKey = element.getKey(); // .getKey is a method on the LexicalNode class
      const elementDOM = activeEditor.getElementByKey(elementKey); // getElementByKey is a method on the LexicalEditor class

      // Get 'type' of anchorNode on activeEditor
      if (elementDOM !== null) {
        const type = $isHeadingNode(element)
          ? element.getTag() // .getTag is a method on the HeadingNode class
          : element.getType(); // .getType is a method on the LexicalNode class for other Node types, e.g paragraphNode
        console.log(">>>>>", { type });
        if (BLOCK_TYPE_OPTIONS.some((block) => block.name === type)) {
          setBlockType(type as (typeof BLOCK_TYPE_OPTIONS)[number]["name"]);
        }
      }
    }
  }, [activeEditor]);

  useEffect(() => {
    console.log({ blockType });
  }, [blockType]);

  useEffect(() => {
    return mergeRegister(
      editor.registerEditableListener((editable) => {
        setIsEditable(editable);
      }),
      activeEditor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          updateToolbar();
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
  }, [updateToolbar, activeEditor, editor]);

  useEffect(() => {
    if (toolBarRef?.current) {
      updateToolbarHeight(toolBarRef.current.clientHeight);
    }
  }, [toolBarRef.current?.clientHeight, updateToolbarHeight]);

  return (
    <>
      {MandatoryPlugins}
      <div
        ref={toolBarRef}
        className="flex flex-wrap items-center justify-center gap-2 border border-slate-500 mb-4 p-2"
      >
        {/* {blockType in blockTypeToBlockName && ( */}
        <BlockFormatDropdown
          disabled={!isEditable}
          blockType={blockType}
          // rootType={rootType}
          editor={activeEditor}
          modal={modal}
        />
        {/* )} */}
        <FontDropDown
          disabled={!isEditable}
          value={fontFamily}
          editor={activeEditor}
          modal={modal}
        />
        <Button
          color={`${modal ? "modal-secondary-button" : "secondary-button"}`}
          width="w-10"
          height="h-9"
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
          width="w-10"
          height="h-9"
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
          width="w-10"
          height="h-9"
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
          width="w-10"
          height="h-9"
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
          width="w-10"
          height="h-9"
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
