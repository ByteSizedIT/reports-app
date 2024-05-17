import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { EditorState } from "lexical";
import { useEffect } from "react";

// Using lexical api's like UpdateListener to listen for changes to the editor and trigger an onChange callback that is passed in as props....
// The LexicalComposer component encapsulates the useLexicalComponentContext hook which is used to provide the Editor instance to all the plugins
// Through the hook you get a reference/access to the Editor instance that the plugin is registered on
// The callback on the registerUpdateListener gets access to the editorState
// You can then invoke the onChange function that got passed in as props on the parent function, passing in the editorState
// useEffect is employed to be able to teardown the listener - The registerUpdateListerner returns a teardown function

export function MyOnChangePlugin({
  onChange,
}: {
  onChange: (editorState: EditorState) => void;
}): null {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) =>
      onChange(editorState)
    );
  }, [onChange, editor]);

  return null;
}
