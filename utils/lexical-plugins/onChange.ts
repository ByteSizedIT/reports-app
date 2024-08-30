import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $generateHtmlFromNodes } from "@lexical/html";
import { EditorState } from "lexical";
import { useEffect } from "react";

// Using lexical api's like UpdateListener to listen for changes to the editor and trigger an onChange callback that is passed in as props....
// The LexicalComposer component encapsulates the useLexicalComponentContext hook which is used to provide the Editor instance to all the plugins
// Through the hook you get a reference/access to the Editor instance that the plugin is registered on
// The callback on the registerUpdateListener gets access to the editorState
// You can then invoke the onChange function that got passed in as props on the parent function, passing in the editorState
// useEffect is employed to be able to teardown the listener - The registerUpdateListerner returns a teardown function

export function MyOnChangePlugin({
  // onChange,
  editorState,
  updateEditorState,
  updateEditorHTML,
}: {
  // onChange: (editorState: EditorState) => void;
  editorState: EditorState | undefined;
  updateEditorState: (editorState: EditorState) => void;
  updateEditorHTML?: (html: string) => void;
}): null {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    const onChange = (editorState: EditorState) => {
      updateEditorState(editorState);
      if (updateEditorHTML) {
        editor.update(() => {
          const htmlString = $generateHtmlFromNodes(editor, null);
          updateEditorHTML(htmlString);
        });
      }
    };

    return editor.registerUpdateListener(({ editorState }) =>
      onChange(editorState)
    );
  }, [editor, editorState, updateEditorState, updateEditorHTML]);

  return null;
}
