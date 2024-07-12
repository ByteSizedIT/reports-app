"use client";

import {
  $getRoot,
  $getSelection,
  $getTextContent,
  EditorState,
  TextNode,
} from "lexical";

import { HeadingNode, QuoteNode } from "@lexical/rich-text";

import { useEffect, useState } from "react";

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
import { ToolBarPlugin } from "@/utils/lexical-plugins/ToolbarPlugin";

interface Props {}

// Lexical theme styling
const theme = {
  root: "p-4 border-slate-500 border rounded focus:outline-none text-left",
  link: "cursor-pointer",
  text: {
    bold: "font-semibold",
    underline: "underline",
    italic: "italic",
    strikethrough: "line-through",
    underlineStrikethrough: "underlined-line-through",
  },
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
  parentModal,
}: {
  editorState: EditorState | undefined;
  updateEditorState: (update: EditorState) => void;
  studentNames: Array<string>;
  parentModal: boolean;
}) => {
  const initialConfig = {
    namespace: "MyEditor",
    editorState: editorState,
    theme,
    onError,
    // onError: (error, editor) => {},
    nodes: [HeadingNode, QuoteNode],
  };
  const [toolbarHeight, setToolbarHeight] = useState(0);

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <div className="relative w-full h-full">
        <div className="flex flex-col w-full h-full">
          <ToolBarPlugin
            modal={parentModal}
            updateToolbarHeight={setToolbarHeight}
          />
          <RichTextPlugin
            contentEditable={
              <ContentEditable className="flex-1 border border-black rounded-md" />
            }
            placeholder={
              <div
                style={{ top: `${toolbarHeight + 8 + 16 + 8}px` }}
                className="absolute left-4 opacity-50"
              >
                Enter your text here...
              </div>
            }
            ErrorBoundary={LexicalErrorBoundary}
          />
        </div>
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
