import { useMemo, useState, useEffect, useCallback } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { ClearEditorPlugin } from "@lexical/react/LexicalClearEditorPlugin";
import { mergeRegister } from "@lexical/utils";
import {
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
import Button from "@/components/Button";

export function ToolBarPlugin({ modal }: { modal: boolean }) {
  const [editor] = useLexicalComposerContext();

  const [activeEditor, setActiveEditor] = useState(editor);
  const [isEditorEmpty, setIsEditorEmpty] = useState(true);
  const [isEditable, setIsEditable] = useState(() => editor.isEditable());
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
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

  return (
    <>
      {MandatoryPlugins}
      <div
        className="flex items-center justify-center gap-2 border border-slate-500
         mb-4 p-2"
      >
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
          <CiUndo className="text-xl sm:text-2xl md:text-5xl" />
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
          <CiRedo className="text-xl sm:text-2xl md:text-5xl" />
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
          <AiOutlineBold className="text-xl sm:text-2xl md:text-5xl" />
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
          <AiOutlineItalic className="text-xl sm:text-2xl md:text-5xl" />
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
          <AiOutlineUnderline className="text-xl sm:text-2xl md:text-5xl" />
        </Button>
        <Button
          color={`${modal ? "modal-secondary-button" : "secondary-button"}`}
          small
          disabled={isEditorEmpty}
          onClick={() => {
            editor.dispatchCommand(CLEAR_EDITOR_COMMAND, undefined);
          }}
        >
          <MdDeleteForever className="text-xl sm:text-2xl md:text-5xl" />
        </Button>
      </div>
    </>
  );
}
