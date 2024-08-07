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
import {
  ListNode,
  $isListNode,
  INSERT_UNORDERED_LIST_COMMAND,
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_CHECK_LIST_COMMAND,
  insertList,
} from "@lexical/list";
import {
  $findMatchingParent,
  mergeRegister,
  $getNearestNodeOfType,
  $getNearestBlockElementAncestorOrThrow,
} from "@lexical/utils";
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
  COMMAND_PRIORITY_LOW,
  FORMAT_TEXT_COMMAND,
  $isTextNode,
  ElementFormatType,
  $isElementNode,
  FORMAT_ELEMENT_COMMAND,
  OUTDENT_CONTENT_COMMAND,
  INDENT_CONTENT_COMMAND,
} from "lexical";

import { getSelectedNode } from "./functions/getSelectedNode";

import { BsTextParagraph, BsChatLeftQuote } from "react-icons/bs";
import { RiH1, RiH2, RiH3, RiH4 } from "react-icons/ri";
import {
  MdFormatListBulleted,
  MdFormatListNumbered,
  MdChecklist,
  MdStrikethroughS,
  MdSubscript,
  MdSuperscript,
  MdDeleteForever,
  MdFormatAlignCenter,
  MdFormatAlignLeft,
  MdFormatAlignRight,
  MdFormatAlignJustify,
  MdFormatIndentDecrease,
  MdFormatIndentIncrease,
} from "react-icons/md";
import { PiTextAa } from "react-icons/pi";
import { CiUndo, CiRedo } from "react-icons/ci";
import {
  AiOutlineBold,
  AiOutlineItalic,
  AiOutlineUnderline,
} from "react-icons/ai";

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
  {
    name: "bullet",
    description: "Bulleted List",
    iconComponent: MdFormatListBulleted,
  },
  {
    name: "number",
    description: "Numbered List",
    iconComponent: MdFormatListNumbered,
  },
  {
    name: "check",
    description: "Checked List",
    iconComponent: MdChecklist,
  },
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

  const formatAsBulletList = () => {
    if (blockType !== "bullet") {
      editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
    } else {
      formatAsParagraph();
    }
  };

  const formatAsNumberedList = () => {
    if (blockType !== "number") {
      editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
    } else {
      formatAsParagraph();
    }
  };

  const formatAsCheckedList = () => {
    if (blockType !== "check") {
      editor.dispatchCommand(INSERT_CHECK_LIST_COMMAND, undefined);
    } else {
      formatAsParagraph();
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
                : item.description === "Bulleted List"
                ? formatAsBulletList
                : item.description === "Numbered List"
                ? formatAsNumberedList
                : item.description === "Checked List"
                ? formatAsCheckedList
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

// CODE FOR ELEMENT FORMAT SELECTION

const ELEMENT_FORMAT_OPTIONS: {
  [K in Exclude<ElementFormatType, "">]?: {
    iconComponent: React.FC;
    description: string;
  };
} = {
  ["left"]: {
    iconComponent: MdFormatAlignLeft,
    description: "Left Align",
  },
  ["center"]: {
    iconComponent: MdFormatAlignCenter,
    description: "Center Align",
  },
  ["right"]: {
    iconComponent: MdFormatAlignRight,
    description: "Right Align",
  },
  ["justify"]: {
    iconComponent: MdFormatAlignJustify,
    description: "Justify Align",
  },
};

function ElementFormatDropdown({
  editor,
  value,
  disabled = false,
  modal,
}: {
  editor: LexicalEditor;
  value: ElementFormatType;
  disabled: boolean;
  modal: boolean;
}) {
  const formatOption = ELEMENT_FORMAT_OPTIONS[value || "left"];

  return (
    <DropDown
      disabled={disabled}
      buttonLabel={formatOption?.description}
      buttonAriaLabel="Formatting options for text alignment"
      IconComponent={formatOption?.iconComponent}
      modal={modal}
    >
      {Object.entries(ELEMENT_FORMAT_OPTIONS).map(([k, v]) => {
        return (
          <DropDownItem
            key={k}
            onClick={() => {
              editor.dispatchCommand(
                FORMAT_ELEMENT_COMMAND,
                k as ElementFormatType
              );
            }}
            className={`mt-2 px-2 py-2 cursor-pointer leading-4 text-sm md:text-base flex flex-row flex-shrink-0 gap-2 items-center w-full hover:bg-green-700
            ${k === value ? "bg-green-700 border " : ""}
            `}
          >
            <v.iconComponent />
            <span className="text">{v.description}</span>
          </DropDownItem>
        );
      })}
      <DropDownItem
        onClick={() => {
          editor.dispatchCommand(INDENT_CONTENT_COMMAND, undefined);
        }}
        className={`mb-2 px-2 py-2 cursor-pointer leading-4 text-sm md:text-base flex flex-row flex-shrink-0 gap-2 items-center w-full hover:bg-green-700`}
      >
        <MdFormatIndentIncrease />
        <span>Indent</span>
      </DropDownItem>
      <DropDownItem
        onClick={() => {
          editor.dispatchCommand(OUTDENT_CONTENT_COMMAND, undefined);
        }}
        className={`px-2 py-2 cursor-pointer leading-4 text-sm md:text-base flex flex-row flex-shrink-0 gap-2 items-center w-full hover:bg-green-700`}
      >
        <MdFormatIndentDecrease />
        <span>Outdent</span>
      </DropDownItem>
    </DropDown>
  );
}

// CODE FOR FONT FAMILY & FONT SIZE SELECTION

const FONT_FAMILY_OPTIONS: [string, string][] = [
  ["Arial", "Arial"],
  ["Courier New", "Courier New"],
  ["Georgia", "Georgia"],
  ["Times New Roman", "Times New Roman"],
  ["Trebuchet MS", "Trebuchet MS"],
  ["Verdana", "Verdana"],
];

const FONT_SIZE_OPTIONS: [string, string][] = [
  ["10px", "10px"],
  ["11px", "11px"],
  ["12px", "12px"],
  ["13px", "13px"],
  ["14px", "14px"],
  ["15px", "15px"],
  ["16px", "16px"],
  ["17px", "17px"],
  ["18px", "18px"],
  ["19px", "19px"],
  ["20px", "20px"],
];

function FontDropDown({
  editor,
  disabled = false,
  style,
  value,
  modal,
}: {
  editor: LexicalEditor;
  disabled?: boolean;
  style: string;
  value: string;
  modal: boolean;
}): JSX.Element {
  const handleClick = useCallback(
    (option: string) => {
      editor.update(() => {
        const selection = $getSelection();
        if (selection !== null) {
          $patchStyleText(selection, {
            [style]: option,
          });
        }
      });
    },
    [editor, style]
  );

  return (
    <DropDown
      disabled={disabled}
      buttonLabel={value} // e.g "font-family"
      buttonAriaLabel={`Formatting options for ${style}`}
      modal={modal}
      small
    >
      {(style === "font-family" ? FONT_FAMILY_OPTIONS : FONT_SIZE_OPTIONS).map(
        ([option, text], index) => {
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
        }
      )}
    </DropDown>
  );
}

export function ToolBarPlugin({
  modal,
  updateToolbarHeight,
  revertedEditorState,
}: {
  modal: boolean;
  updateToolbarHeight: (height: number) => void;
  revertedEditorState: undefined | string;
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
  const [fontSize, setFontSize] = useState<string>("12px");
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isStrikethrough, setStrikethrough] = useState(false);
  const [isSubscript, setSubscript] = useState(false);
  const [isSuperscript, setIsSuperscript] = useState(false);
  const [elementFormat, setElementFormat] = useState<ElementFormatType>("left");

  const MandatoryPlugins = useMemo(() => {
    return <ClearEditorPlugin />;
  }, []);

  useEffect(() => {
    if (revertedEditorState) {
      const parsedEditorState = editor.parseEditorState(revertedEditorState);
      editor.setEditorState(parsedEditorState);
    }
  }, [editor, revertedEditorState]);

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
      setStrikethrough(selection.hasFormat("strikethrough"));
      setSubscript(selection.hasFormat("subscript"));
      setIsSuperscript(selection.hasFormat("superscript"));
      setFontFamily(
        $getSelectionStyleValueForProperty(selection, "font-family", "Arial")
      );
      setFontSize(
        $getSelectionStyleValueForProperty(selection, "font-size", "12px")
      );

      const node = getSelectedNode(selection);
      const parent = node.getParent();

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
        if ($isListNode(element)) {
          const parentList = $getNearestNodeOfType<ListNode>(
            anchorNode,
            ListNode
          );
          const type = parentList
            ? parentList.getListType()
            : element.getListType();
          setBlockType(type);
        } else {
          const type = $isHeadingNode(element)
            ? element.getTag() // .getTag is a method on the HeadingNode class
            : element.getType(); // .getType is a method on the LexicalNode class for other Node types, e.g paragraphNode
          if (BLOCK_TYPE_OPTIONS.some((block) => block.name === type)) {
            setBlockType(type as (typeof BLOCK_TYPE_OPTIONS)[number]["name"]);
          }
        }
      }

      setElementFormat(
        $isElementNode(node)
          ? node.getFormatType()
          : parent?.getFormatType() || "left"
      );
    }
  }, [activeEditor]);

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
      ),
      activeEditor.registerCommand(
        INSERT_UNORDERED_LIST_COMMAND,
        () => {
          insertList(activeEditor, "bullet");
          return true;
        },
        COMMAND_PRIORITY_LOW
      ),
      activeEditor.registerCommand(
        INSERT_ORDERED_LIST_COMMAND,
        () => {
          insertList(activeEditor, "number");
          return true;
        },
        COMMAND_PRIORITY_LOW
      ),
      activeEditor.registerCommand(
        INSERT_CHECK_LIST_COMMAND,
        () => {
          insertList(activeEditor, "check");
          return true;
        },
        COMMAND_PRIORITY_LOW
      )
    );
  }, [updateToolbar, activeEditor, editor]);

  const clearFormatting = useCallback(() => {
    activeEditor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        const anchor = selection.anchor;
        const focus = selection.focus;
        const nodes = selection.getNodes();
        const extractedNodes = selection.extract();

        // If no range, just a single point), early return early as nothing to format.
        if (anchor.key === focus.key && anchor.offset === focus.offset) {
          return;
        }

        nodes.forEach((node, index) => {
          // Ensure unselected text inside the selected nodes is not formatted
          if ($isTextNode(node)) {
            // Use a separate variable to ensure TS does not lose the refinement below
            let textNode = node;

            // Handle Partial Selection in the First Node:
            if (index === 0 && anchor.offset !== 0) {
              textNode = textNode.splitText(anchor.offset)[1] || textNode; // node is split at the anchor.offset position. The splitText method returns an array where the second element is the text after the split. textNode is set to the second part of the split (the part that starts from anchor.offset)
            }
            // Handle Partial Selection in the Last Node:
            if (index === nodes.length - 1) {
              textNode = textNode.splitText(focus.offset)[0] || textNode; // node is split at the focus.offset position. The splitText method returns an array where the first element is the text before the split. textNode is set to the first part of the split (the part that ends at focus.offset)
            }

            // If selection spans only one node, the extracted node (extractedNodes[0]) is assigned to textNode if it is also a text node.
            const extractedTextNode = extractedNodes[0];
            if (nodes.length === 1 && $isTextNode(extractedTextNode)) {
              textNode = extractedTextNode;
            }

            //If the text node has a style applied, the style is cleared
            if (textNode.__style !== "") {
              textNode.setStyle("");
            }
            // If text node has a format applied (__format is not zero), the format is cleared
            if (textNode.__format !== 0) {
              textNode.setFormat(0);
              // Additionally, the nearest block element ancestor is found, and its format is also cleared
              $getNearestBlockElementAncestorOrThrow(textNode).setFormat("");
            }
            // the original node variable is updated to reference the modified textNode, ensuring that any further operations in the loop use the updated node.
            node = textNode;
          }
        });
      }
    });
  }, [activeEditor]);

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
          style="font-family"
          value={fontFamily}
          editor={activeEditor}
          modal={modal}
        />
        <FontDropDown
          disabled={!isEditable}
          style="font-size"
          value={fontSize}
          editor={activeEditor}
          modal={modal}
        />
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
        <DropDown
          disabled={!isEditable}
          buttonAriaLabel="Formatting options for additional text styles"
          IconComponent={PiTextAa}
          // stopCloseOnClickSelf?: boolean;
          modal={modal}
          small
        >
          <DropDownItem
            onClick={() => {
              activeEditor.dispatchCommand(
                FORMAT_TEXT_COMMAND,
                "strikethrough"
              );
            }}
            className={`
              mt-2 px-2 py-2 cursor-pointer leading-4 text-sm md:text-base flex flex-row flex-shrink-0 gap-4 items-center w-full hover:bg-green-700
              ${isStrikethrough ? "bg-green-700 border " : ""}
              `}
            title="Strikethrough"
            aria-label="Format text with a strikethrough"
          >
            <MdStrikethroughS className="text-xl sm:text-2xl" />
            <span className="text">Strikethrough</span>
          </DropDownItem>
          <DropDownItem
            onClick={() => {
              activeEditor.dispatchCommand(FORMAT_TEXT_COMMAND, "subscript");
            }}
            className={`
              px-2 py-2 cursor-pointer leading-4 text-sm md:text-base flex flex-row flex-shrink-0 gap-4 items-center w-full hover:bg-green-700
              ${isSubscript ? "bg-green-700 border " : ""}
              `}
            title="Subscript"
            aria-label="Format text with a subscript"
          >
            <MdSubscript className="text-xl sm:text-2xl" />
            <span className="text">Subscript</span>
          </DropDownItem>
          <DropDownItem
            onClick={() => {
              activeEditor.dispatchCommand(FORMAT_TEXT_COMMAND, "superscript");
            }}
            className={`
              px-2 py-2 cursor-pointer leading-4 text-sm md:text-base flex flex-row flex-shrink-0 gap-4 items-center w-full hover:bg-green-700
              ${isSuperscript ? "bg-green-700 border " : ""}
              `}
            title="Superscript"
            aria-label="Format text with a superscript"
          >
            <MdSuperscript className="text-xl sm:text-2xl" />
            <span className="text">Superscript</span>
          </DropDownItem>
          <DropDownItem
            className={`
              px-2 py-2 cursor-pointer leading-4 text-sm md:text-base flex flex-row flex-shrink-0 gap-4 items-center w-full hover:bg-green-700
              `}
            onClick={clearFormatting}
            title="Clear text formatting"
            aria-label="Clear all text formatting"
          >
            <MdDeleteForever className="text-xl sm:text-2xl" />
            <span className="text">Clear Formatting</span>
          </DropDownItem>
        </DropDown>
        <ElementFormatDropdown
          disabled={!isEditable}
          value={elementFormat}
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
