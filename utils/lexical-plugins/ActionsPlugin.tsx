import { useMemo } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { ClearEditorPlugin } from "@lexical/react/LexicalClearEditorPlugin";
import { CLEAR_EDITOR_COMMAND } from "lexical";

import { FaDeleteLeft } from "react-icons/fa6";
import { MdDeleteForever } from "react-icons/md";

export function ActionsPlugin() {
  const [editor] = useLexicalComposerContext();

  const MandatoryPlugins = useMemo(() => {
    return <ClearEditorPlugin />;
  }, []);

  return (
    <>
      {MandatoryPlugins}
      <div className="flex items-center justify-center border border-black mb-2 md:mb-4 p-1 ">
        <MdDeleteForever
          className="text-xl sm:text-2xl md:5xl"
          onClick={() => {
            editor.dispatchCommand(CLEAR_EDITOR_COMMAND, undefined);
          }}
        />
        <FaDeleteLeft
          className="text-xl sm:text-2xl md:5xl"
          onClick={() => {
            editor.dispatchCommand(CLEAR_EDITOR_COMMAND, undefined);
          }}
        />
      </div>
    </>
  );
}
