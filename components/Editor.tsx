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
import { ActionsPlugin } from "@/utils/lexical-plugins/ActionsPlugin";

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
    theme: {
      root: "p-4 border-slate-500 border rounded focus:outline-none focus-visible:border-black text-left",
      link: "cursor-pointer",
      text: {
        bold: "font-semibold",
        underline: "underline",
        italic: "italic",
        strikethrough: "line-through",
        underlineStrikethrough: "underlined-line-through",
      },
    },
    onError,
    // onError: (error, editor) => {},
  };

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <div className="flex flex-col h-full">
        <ActionsPlugin />
        <RichTextPlugin
          contentEditable={
            <ContentEditable className="flex-1 border border-black rounded-md" />
          }
          placeholder={
            <div className="absolute top-16 left-6 opacity-50">
              Enter your text here...
            </div>
          }
          ErrorBoundary={LexicalErrorBoundary}
        />
      </div>
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
