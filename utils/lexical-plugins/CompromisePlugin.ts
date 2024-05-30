import { useEffect } from "react";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { TextNode } from "lexical";
import { $getSelection, $isRangeSelection } from "lexical";

export function CompromisePlugin() {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (!editor) return;

    // Listen for changes to the text nodes in the Lexical Editor
    const removeNodeListener = editor.registerNodeTransform(
      TextNode,
      (node) => {
        if (!node) return;

        // Get the text content of the node from the Lexical Editor
        const textContent = node.getTextContent();

        // Find the current selection and the current offset of the cursor from Lexical
        const selection = $getSelection();
        let currentCursorOffset = null;
        if (
          $isRangeSelection(selection) &&
          selection.anchor.key === node.getKey()
        ) {
          currentCursorOffset = selection.anchor.offset;
        }

        // Create an array of words to search, from the starting Compromise text
        const words = textContent.split(" ");

        // If it doesn't end with a punctuation mark remove last word - as it is either unfinished, or empty space at the end of the text)
        if (!/[.,!?;:]+$/.test(words[words.length - 1])) {
          words.pop();
        }

        // Find wordIndex that has been edited
        let editedWordIndex = null;
        let charCount = 0;
        for (let i = 0; i < words.length; i++) {
          charCount += words[i].length + 1; // Add length of word to total char count, +1 for adding in the space at the end
          if (currentCursorOffset && currentCursorOffset <= charCount) {
            editedWordIndex = i;
            break;
          }
        }

        if (editedWordIndex !== null) {
          let transformedWord = null;
          let updatedCompromiseText = null;

          // Identify whether the word needs to be transformed, and make the transformation
          transformedWord = "test "; // TODO: use compromise library 'tags' to help identify any required changes to the edited word; All edited words just reassigned to test for now...

          // Update the edited word in the array of words
          words[editedWordIndex] = transformedWord;

          // Create the updated text content
          updatedCompromiseText = words.join(" ");

          // Update the text content of the Lexical node
          if (updatedCompromiseText) {
            node.setTextContent(updatedCompromiseText);

            // Update the cursor position
            node.selectEnd();
          }
        } else {
          console.log("No index for a complete edited word found");
        }
      }
    );
    return () => removeNodeListener();
  }, [editor]);

  return null;
}
