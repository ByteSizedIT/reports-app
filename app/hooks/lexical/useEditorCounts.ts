import { useEffect, useState } from "react";

import { $getRoot, EditorState } from "lexical";

// Update character & word counts
const useEditorCounts = (editorState: EditorState | undefined) => {
  const [counts, setCounts] = useState({
    chars: 0,
    words: 0,
  });

  useEffect(() => {
    if (editorState?.read) {
      const editorStateTextString = editorState?.read(() =>
        $getRoot().getTextContent()
      );
      const charCount = editorStateTextString?.length;
      const wordCount = editorStateTextString
        ?.trim()
        .split(" ")
        .filter((word) => word !== "").length;
      setCounts({
        chars: charCount || 0,
        words: wordCount || 0,
      });
    }
  }, [editorState]);

  return counts;
};

export default useEditorCounts;
