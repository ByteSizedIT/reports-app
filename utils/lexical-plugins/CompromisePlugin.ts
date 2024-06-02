import { useEffect, useRef } from "react";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { TextNode } from "lexical";
import {
  $getSelection,
  $isRangeSelection,
  $createRangeSelection,
  $setSelection,
} from "lexical";

import nlp from "compromise";

// Process text using Compromise library
function processText(text: string) {
  const compromiseDoc = nlp(text);
  //   const compromiseTags = compromiseDoc.out("tags")[0];
  const compromiseText = compromiseDoc.text();
  return { compromiseDoc, compromiseText };
}

// Calculate total length editedWord from Compromise document
function calculateCompromiseWordLength(documentWord: {
  pre: string;
  text: string;
  post: string;
}) {
  return (
    documentWord["text"].length +
    documentWord["pre"].length +
    documentWord["post"].length
  );
}

// Add braces to tranformedWord
function addBracesToWord(documentWord: {
  pre: string;
  text: string;
  post: string;
}) {
  const originalPrefixes = documentWord["pre"];
  const originalPostfixes = documentWord["post"];
  if (
    originalPrefixes[originalPrefixes.length - 1] !== "{" &&
    originalPostfixes[0] !== "}"
  ) {
    documentWord["pre"] = originalPrefixes + `{`;
    documentWord["post"] = `}` + originalPostfixes;
  }
}

function updateCompromiseWithTransformedWord(
  compromiseDoc: any,
  sentenceIndex: number,
  wordIndex: number,
  transformedWord: string
) {
  // Capitalise transformedWord if original word was
  if (/^[A-Z]/.test(compromiseDoc.document[sentenceIndex][wordIndex]["text"]))
    transformedWord =
      transformedWord[0].toUpperCase() + transformedWord.slice(1);

  // Add braces to tranformedWord
  addBracesToWord(compromiseDoc.document[sentenceIndex][wordIndex]);

  /// Update editedWord with transformedWord in Compromise document
  compromiseDoc.document[sentenceIndex][wordIndex]["text"] = transformedWord;
}

export function CompromisePlugin() {
  const [editor] = useLexicalComposerContext();

  const textContentRef = useRef("");

  useEffect(() => {
    if (!editor) return;

    // Listen for changes to text nodes in Lexical Editor
    const removeNodeListener = editor.registerNodeTransform(
      TextNode,
      (node) => {
        if (!node) return;

        // Get ext content of node from Lexical Editor
        const textContent = node.getTextContent();

        // Prevent re-running plugin for text updated by plugin on the previous run
        if (textContentRef.current === textContent) {
          console.log("we've done this already!");
          return;
        }

        // Process text using the Compromise library
        const { compromiseDoc, compromiseText: startingCompromiseText } =
          processText(textContent);
        console.log({ compromiseDoc, startingCompromiseText });

        // Find current selection and current offset of cursor from Lexical
        const selection = $getSelection();
        let startingCursorOffset: number | null = null;
        if (
          $isRangeSelection(selection) &&
          selection.anchor.key === node.getKey()
        ) {
          startingCursorOffset = selection.anchor.offset;
        }

        // Find word that's been edited
        let editedSentenceIndex: number = 0;
        let editedWordIndex: number | null = null;
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

          let editedWordTransformed = null;
          let nextWordTransformed = null;

          let preTransformedWordTotalLength: number;
          let transformedWordTotalLength: number;

          let updatedCompromiseText = null;

          // Use tags to identify whether editedWord needs to be transformed, & make transformation
          const tags =
            compromiseDoc.document[editedSentenceIndex][editedWordIndex][
              "tags"
            ];

          // Transform Pronouns
          if (tags?.has("Pronoun") && !tags?.has("Possessive")) {
            console.log("Pronoun Type A");
            let regex = /^(he|she|they)$/i;
            if (regex.test(editedWord)) editedWordTransformed = "they";
            regex = /^(him|her)$/;
            if (regex.test(editedWord)) editedWordTransformed = "them";
          }

          // update the Compromise document/text and the Lexical Editor
          if (editedWordTransformed !== null) {
            // Calculate the total length of initial editedWord (incl prefixes and postfixes)
            preTransformedWordTotalLength = calculateCompromiseWordLength(
              compromiseDoc.document[editedSentenceIndex][editedWordIndex]
            );
            updateCompromiseWithTransformedWord(
              compromiseDoc,
              editedSentenceIndex,
              editedWordIndex,
              editedWordTransformed
            );
            // Calculate the total length of transformed word (incl prefixes and postfixes)
            transformedWordTotalLength = calculateCompromiseWordLength(
              compromiseDoc.document[editedSentenceIndex][editedWordIndex]
            );
          }

          // If editedWord has not been transformed, check if the next word needs to be transformed - i.e editedWord assumes that cursor is always at the end of a new word. This catches when a space has been added to create a new word after the last ('edited') one
          if (editedWordTransformed === null) {
            if (
              editedSentenceIndex === compromiseDoc.document.length - 1 &&
              editedWordIndex ===
                compromiseDoc.document[editedSentenceIndex].length - 1
            ) {
              console.log(
                "Edited word not transformed. Last word in the document, nothing to be transformed"
              );
            } else {
              console.log(
                "Edited word not transformed, but ot the last word in the document, check next word"
              );

              const nextWord =
                compromiseDoc.document[editedSentenceIndex][
                  editedWordIndex + 1
                ]["text"];

              const nextWordTags =
                compromiseDoc.document[editedSentenceIndex][
                  editedWordIndex + 1
                ]["tags"];

              // Transform Pronouns
              if (
                nextWordTags?.has("Pronoun") &&
                !nextWordTags?.has("Possessive")
              ) {
                console.log("Pronoun Type A: Next Word ");
                let regex = /^(he|she|they)$/i;
                if (regex.test(nextWord)) nextWordTransformed = "they";
                regex = /^(him|her)$/;
                if (regex.test(nextWord)) nextWordTransformed = "them";
              }

              if (nextWordTransformed !== null) {
                // Calculate the total length of initial nextWord (incl prefixes and postfixes)
                preTransformedWordTotalLength = calculateCompromiseWordLength(
                  compromiseDoc.document[editedSentenceIndex][
                    editedWordIndex + 1
                  ]
                );
                updateCompromiseWithTransformedWord(
                  compromiseDoc,
                  editedSentenceIndex,
                  editedWordIndex + 1,
                  nextWordTransformed
                );
                // Calculate the total length of transformed word (incl prefixes and postfixes)
                transformedWordTotalLength = calculateCompromiseWordLength(
                  compromiseDoc.document[editedSentenceIndex][
                    editedWordIndex + 1
                  ]
                );
              }
            }
          }

          if (editedWordTransformed !== null || nextWordTransformed !== null) {
            // Get the updated textContent from the Compromise document
            updatedCompromiseText = compromiseDoc.text();

            // Update persisted reference to text content length to prevent re-running the plugin
            textContentRef.current = updatedCompromiseText;

            // Update the text content of the Lexical node
            if (updatedCompromiseText) {
              // Update the cursor position
              editor.update(() => {
                const newSelection = $createRangeSelection();
                const newOffset: number =
                  startingCursorOffset +
                  (transformedWordTotalLength - preTransformedWordTotalLength);
                newSelection.anchor.set(node.getKey(), newOffset, "text");
                newSelection.focus.set(node.getKey(), newOffset, "text");
                $setSelection(newSelection);
              });

              node.setTextContent(updatedCompromiseText);
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
