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
  UNDO_COMMAND,
  CLEAR_EDITOR_COMMAND,
  COMMAND_PRIORITY_CRITICAL,
} from "lexical";

import { CiUndo } from "react-icons/ci";
import { AiOutlineBold } from "react-icons/ai";
import { MdDeleteForever } from "react-icons/md";
import Button from "@/components/Button";

export function ToolBarPlugin({ modal }: { modal: boolean }) {
  const [editor] = useLexicalComposerContext();

  const [activeEditor, setActiveEditor] = useState(editor);
  const [isEditorEmpty, setIsEditorEmpty] = useState(true);
  const [isEditable, setIsEditable] = useState(() => editor.isEditable());
  const [canUndo, setCanUndo] = useState(false);

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

  useEffect(() => {
    return mergeRegister(
      editor.registerEditableListener((editable) => {
        setIsEditable(editable);
      }),
      activeEditor.registerCommand<boolean>(
        CAN_UNDO_COMMAND,
        (payload) => {
          setCanUndo(payload);
          return false;
        },
        COMMAND_PRIORITY_CRITICAL
      )
    );
  }, [activeEditor, editor]);

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
        >
          <CiUndo className="text-xl sm:text-2xl md:text-5xl" />
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
