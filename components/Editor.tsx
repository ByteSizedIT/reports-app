"use client";

import {
  $getRoot,
  $getSelection,
  $getTextContent,
  EditorState,
  TextNode,
} from "lexical";

import { useEffect } from "react";

import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import LexicalErrorBoundary from "@lexical/react/LexicalErrorBoundary";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";

import { PronounsPlugin } from "@/utils/lexical-plugins/addPronounPlaceholders";
import { MyOnChangePlugin } from "@/utils/lexical-plugins/onChange";
import { CompromisePlugin } from "@/utils/lexical-plugins/CompromisePlugin";

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

const Editor = ({
  editorState,
  updateEditorState,
  studentNames,
}: {
  editorState: EditorState | undefined;
  updateEditorState: (update: EditorState) => void;
  studentNames: Array<string>;
}) => {
  const initialConfig = {
    namespace: "MyEditor",
    editorState: editorState,
    theme,
    onError,
    // onError: (error, editor) => {},
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
      {/* <PronounsPlugin /> */}
      <CompromisePlugin studentNames={studentNames} />
      <MyOnChangePlugin
        onChange={(editorState) => {
          updateEditorState(editorState);
        }}
      />
    </LexicalComposer>
  );
};

export default Editor;
