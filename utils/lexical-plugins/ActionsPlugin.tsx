import { useMemo, useState, useEffect } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { ClearEditorPlugin } from "@lexical/react/LexicalClearEditorPlugin";
import { $getRoot, $isParagraphNode, CLEAR_EDITOR_COMMAND } from "lexical";

import { CiUndo } from "react-icons/ci";
import { MdDeleteForever } from "react-icons/md";
import Button from "@/components/Button";

export function ActionsPlugin({ modal }: { modal: boolean }) {
  const [isEditorEmpty, setIsEditorEmpty] = useState(true);
  const [editor] = useLexicalComposerContext();

  const MandatoryPlugins = useMemo(() => {
    return <ClearEditorPlugin />;
  }, []);

  useEffect(
    function checkEditorEmptyState() {
      return editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          const root = $getRoot();
          const children = root.getChildren();
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
          disabled={isEditorEmpty}
          onClick={() => {
            console.log("clicked");
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
