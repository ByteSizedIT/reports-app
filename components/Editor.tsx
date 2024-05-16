"use client";

import { $getRoot, $getSelection, EditorState } from "lexical";
import { useEffect } from "react";

import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import LexicalErrorBoundary from "@lexical/react/LexicalErrorBoundary";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";

interface Props {}

const theme = {
  // Theme styling goes here
};

// Catch any errors that occur during Lexical updates and log them
// or throw them as needed. If you don't throw them, Lexical will
// try to recover gracefully without losing user data.
function onError(error: Error): void {
  console.error(error);
}

// Using lexical api's like UpdateListener to listen for changes to the editor and trigger an onChange callback that is passed in as props....
// The LexicalComposer component encapsulates the useLexicalComponentContext hook which is used to provide the Editor instance to all the plugins
// Through the hook you get a reference/access to the Editor instance that the plugin is registered on
// The callback on the registerUpdateListener gets access to the editorState
// You can then invoke the onChange function that got passed in as props on the parent function, passing in the editorState
// useEffect is employed to be able to teardown the listener - The registerUpdateListerner returns a teardown function
function MyOnChangePlugin({
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

const Editor = ({
  updateEditorState,
}: {
  updateEditorState: (update: EditorState) => void;
}) => {
  const initialConfig = {
    namespace: "MyEditor",
    theme,
    onError,
  };

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <RichTextPlugin
        contentEditable={
          <ContentEditable className="w-full h-full border border-black rounded-md text-left p-2 " />
        }
        placeholder={
          <div className="absolute top-4 left-4 ">Enter your text here...</div>
        }
        ErrorBoundary={LexicalErrorBoundary}
      />
      <HistoryPlugin />
      <AutoFocusPlugin />
      <MyOnChangePlugin
        onChange={(editorState) => {
          updateEditorState(editorState);
        }}
      />
    </LexicalComposer>
  );
};

export default Editor;
