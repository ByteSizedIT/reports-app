import { useEffect, useRef, MutableRefObject } from "react";

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
  const compromiseText = compromiseDoc.text();
  return { compromiseDoc, compromiseText };
}

// Calculate total length of word from Compromise document
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

// Add braces to word in Compromise document
function addBracesToWord(compromiseWord: {
  pre: string;
  text: string;
  post: string;
}) {
  const originalPrefixes = compromiseWord["pre"];
  const originalPostfixes = compromiseWord["post"];
  if (
    originalPrefixes[originalPrefixes.length - 1] !== "{" &&
    originalPostfixes[0] !== "}"
  ) {
    compromiseWord["pre"] = originalPrefixes + `{`;
    compromiseWord["post"] = `}` + originalPostfixes;
  }
}

// Transform Compromise word
function transformCompromiseWord(compromiseWord: any) {
  const wordText = compromiseWord["text"];
  const wordTags = compromiseWord["tags"];
  const preTransformedWordTotalLength =
    calculateCompromiseWordLength(compromiseWord);
  let transformedWord: string | null = null;
  let postTransformedWordTotalLength: number | null = null;

  // Transform Pronouns
  if (wordTags?.has("Pronoun") && !wordTags?.has("Possessive")) {
    console.log("Pronoun Type A");
    let regex = /^(he|she|they)$/i;
    if (regex.test(wordText)) transformedWord = "they";
    regex = /^(him|her)$/;
    if (regex.test(wordText)) transformedWord = "them";
  }

  if (transformedWord) {
    // Capitalise transformedWord if original word was
    /^[A-Z]/.test(compromiseWord["text"]);
    transformedWord =
      transformedWord[0].toUpperCase() + transformedWord.slice(1);

    // Update text of transformedWord in compromiseDoc
    compromiseWord["text"] = transformedWord;

    // Add braces to pre and post of transformedWord in compromiseDoc
    addBracesToWord(compromiseWord);

    postTransformedWordTotalLength =
      calculateCompromiseWordLength(compromiseWord);
  }
  return {
    preTransformedWordTotalLength,
    transformedWord,
    postTransformedWordTotalLength,
  };
}

// Update Lexical Editor with transformed text
function updateLexicalNodeTextContent(
  editor: any,
  node: TextNode,
  compromiseDoc: any,
  textContentRef: MutableRefObject<string>,
  startingCursorOffset: number,
  transformedWordInitialLength: number,
  transformedWordFinalLength: number,
  nextWord: boolean = false
) {
  if (!nextWord) {
    // Update the cursor position in Lexical Editor
    editor.update(() => {
      const newSelection = $createRangeSelection();
      const newOffset: number = nextWord
        ? startingCursorOffset + transformedWordFinalLength
        : startingCursorOffset +
          (transformedWordFinalLength - transformedWordInitialLength);
      newSelection.anchor.set(node.getKey(), newOffset, "text");
      newSelection.focus.set(node.getKey(), newOffset, "text");
      $setSelection(newSelection);
    });
  }

  // Update the text content of the node in Lexical Editor
  const transformedTextContent = compromiseDoc.text();
  node.setTextContent(transformedTextContent);

  // Update textContentRef to prevent re-running plugin for this updated text
  textContentRef.current = transformedTextContent;
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

        // console.log("*************NEW NODE*************");

        // Get textContent of node from Lexical Editor
        const textContent = node.getTextContent();

        // Prevent re-running plugin for text updated by plugin on the previous run
        if (textContentRef.current === textContent) {
          console.log("we've transformed this already!");
          return;
        }

        // Process text using the Compromise library
        const { compromiseDoc, compromiseText: startingCompromiseText } =
          processText(textContent);

        // Find current selection and current offset of cursor from Lexical Editor
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
          const {
            preTransformedWordTotalLength,
            transformedWord: editedWordTransformed,
            postTransformedWordTotalLength,
          } = transformCompromiseWord(
            compromiseDoc.document[editedSentenceIndex][editedWordIndex]
          );

          if (editedWordTransformed && postTransformedWordTotalLength) {
            updateLexicalNodeTextContent(
              editor,
              node,
              compromiseDoc,
              textContentRef,
              startingCursorOffset,
              preTransformedWordTotalLength,
              postTransformedWordTotalLength
            );
          } else {
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
                "Edited word not transformed, but not the last word in the document, check next word"
              );

              const {
                preTransformedWordTotalLength,
                transformedWord,
                postTransformedWordTotalLength,
              } = transformCompromiseWord(
                compromiseDoc.document[editedSentenceIndex][editedWordIndex + 1]
              );

              if (transformedWord && postTransformedWordTotalLength) {
                updateLexicalNodeTextContent(
                  editor,
                  node,
                  compromiseDoc,
                  textContentRef,
                  startingCursorOffset,
                  preTransformedWordTotalLength,
                  postTransformedWordTotalLength,
                  true // flag to indicate that the next word is being transformed to inform the cursor position
                );
              } else {
                console.log("No text transformed");
              }
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
