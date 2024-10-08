"use client";

import {
  $getRoot,
  $getSelection,
  $getTextContent,
  EditorState,
  EditorThemeClasses,
  TextNode,
} from "lexical";

import { ListNode, ListItemNode } from "@lexical/list";
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

import { CheckListPlugin } from "@lexical/react/LexicalCheckListPlugin";

import "../utils/lexical-plugins/theme/EditorTheme.css";

interface Props {}

// Lexical theme styling
const theme: EditorThemeClasses = {
  root: "p-4 border-slate-500 border rounded focus:outline-none text-left",
  link: "cursor-pointer",
  text: {
    bold: "font-semibold",
    underline: "underline",
    italic: "italic",
    strikethrough: "line-through",
    underlineStrikethrough: "underlined-line-through",
  },
  list: {
    checklist: "PlaygroundEditorTheme__checklist",
    listitem: "PlaygroundEditorTheme__listItem",
    listitemChecked: "PlaygroundEditorTheme__listItemChecked",
    listitemUnchecked: "PlaygroundEditorTheme__listItemUnchecked",
    nested: {
      listitem: "PlaygroundEditorTheme__nestedListItem",
    },
    olDepth: [
      "PlaygroundEditorTheme__ol1",
      "PlaygroundEditorTheme__ol2",
      "PlaygroundEditorTheme__ol3",
      "PlaygroundEditorTheme__ol4",
      "PlaygroundEditorTheme__ol5",
    ],
    ul: "PlaygroundEditorTheme__ul",
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
  revertedEditorState,
  updateEditorHTML,
}: {
  editorState: EditorState | undefined;
  updateEditorState: (update: EditorState) => void;
  studentNames: Array<string>;
  parentModal: boolean;
  revertedEditorState?: undefined | string;
  updateEditorHTML?: (update: string) => void;
}) => {
  const initialConfig = {
    namespace: "MyEditor",
    editorState: JSON.stringify(editorState),
    theme,
    onError,
    // onError: (error, editor) => {},
    nodes: [HeadingNode, QuoteNode, ListNode, ListItemNode],
  };
  const [toolbarHeight, setToolbarHeight] = useState(0);

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <div className="relative w-full h-full">
        <div className="flex flex-col w-full h-full">
          <ToolBarPlugin
            modal={parentModal}
            updateToolbarHeight={setToolbarHeight}
            revertedEditorState={revertedEditorState}
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
        editorState={editorState}
        updateEditorState={updateEditorState}
        updateEditorHTML={updateEditorHTML}
      />
      <CheckListPlugin />
    </LexicalComposer>
  );
};

export default Editor;
