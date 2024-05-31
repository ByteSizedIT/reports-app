import { useEffect } from "react";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { TextNode } from "lexical";
import {
  $getSelection,
  $isRangeSelection,
  $createRangeSelection,
  $setSelection,
} from "lexical";

import nlp from "compromise";

// Process text using the Compromise library
function processText(text: string) {
  const compromiseDoc = nlp(text);
  //   const compromiseTags = compromiseDoc.out("tags")[0];
  const compromiseText = compromiseDoc.text();
  return { compromiseDoc, compromiseText };
}

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

        // Process the text using the Compromise library
        const { compromiseDoc, compromiseText: startingCompromiseText } =
          processText(textContent);
        console.log({ compromiseDoc, startingCompromiseText });

        // Find the current selection and the current offset of the cursor from Lexical
        const selection = $getSelection();
        let startingCursorOffset = null;
        if (
          $isRangeSelection(selection) &&
          selection.anchor.key === node.getKey()
        ) {
          startingCursorOffset = selection.anchor.offset;
        }

        // Find word that has been edited
        let editedSentenceIndex = null;
        let editedWordIndex = null;
        let charCount = 0;

        // let isCapitalised = false;

        outerLoop: for (
          let i = 0;
          i <= compromiseDoc.document.length - 1;
          i++
        ) {
          //   console.log("outerLoop");
          innerLoop: for (
            let j = 0;
            j <= compromiseDoc.document[i].length - 1;
            j++
          ) {
            // console.log("innerLoop");
            charCount +=
              compromiseDoc.document[i][j]["text"].length +
              compromiseDoc.document[i][j]["pre"].length +
              compromiseDoc.document[i][j]["post"].length;

            if (startingCursorOffset && startingCursorOffset <= charCount) {
              if (!/[.,!?;:\s]+$/.test(compromiseDoc.document[i][j]["post"])) {
                console.log(
                  "editedWord DOES NOT end with punctuation mark or space: breaking from inside inner loop"
                );
                break outerLoop;
              }

              editedSentenceIndex = i;
              editedWordIndex = j;
              break outerLoop;
            }
          }
        }

        if (
          startingCursorOffset !== null &&
          editedSentenceIndex !== null &&
          editedWordIndex !== null
        ) {
          // For full words that have been edited
          const editedWord =
            compromiseDoc.document[editedSentenceIndex][editedWordIndex][
              "text"
            ];

          let transformedWord = null;
          let updatedCompromiseText = null;

          // Identify whether the word needs to be transformed, and make the transformation
          const tags =
            compromiseDoc.document[editedSentenceIndex][editedWordIndex][
              "tags"
            ];

          // Pronouns
          if (tags?.has("Pronoun") && !tags?.has("Possessive")) {
            console.log("Pronoun Type A");
            let regex = /^(he|she|they)$/;
            if (regex.test(editedWord)) transformedWord = "they";
            regex = /^(him|her)$/;
            if (regex.test(editedWord)) transformedWord = "them";
          }

          if (transformedWord !== null) {
            /// Update the word in the Compromise document
            compromiseDoc.document[editedSentenceIndex][editedWordIndex][
              "text"
            ] = transformedWord;

            // Get the updated textContent from the Compromise document
            updatedCompromiseText = compromiseDoc.text();

            // Update the cursor position
            editor.update(() => {
              const newSelection = $createRangeSelection();
              const newOffset: number =
                startingCursorOffset +
                (transformedWord.length - editedWord.length);
              newSelection.anchor.set(node.getKey(), newOffset, "text");
              newSelection.focus.set(node.getKey(), newOffset, "text");
              $setSelection(newSelection);
            });

            // Update the text content of the Lexical node
            if (updatedCompromiseText) {
              node.setTextContent(updatedCompromiseText);

              // Update the cursor position
              node.selectEnd();
            }
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