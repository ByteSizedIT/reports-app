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

import transformPronouns from "./transform-functions/pronouns";

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
function transformCompromiseWord(
  compromiseDoc: any,
  sentanceIndex: number,
  wordIndex: number
) {
  let targetedWord = compromiseDoc.document[sentanceIndex][wordIndex]; // initiate to focusedWord

  let wordText = targetedWord["text"]; // initiate to focusedWord
  let wordTags = targetedWord["tags"]; // initiate to focusedWord
  let preTransformedWordTotalLength =
    calculateCompromiseWordLength(targetedWord);
  let transformedWord: string | null = null;
  let postTransformedWordTotalLength: number | null = null;

  // Transform Pronouns
  if (wordTags?.has("Pronoun")) {
    transformedWord = transformPronouns(wordText, transformedWord);
  }

  // Handle that Compromise always tags 'his' as possessive pronoun(equiv to theirs) and not as possessive adjective (equiv to their). Identify and Transform Possessive Adjectives by checking if word is a noun preceded by a possessive pronoun (compromise marks possessive adjectives as possessive pronouns) or an adjective that is itself preceded by a possessive pronoun
  else if (
    wordIndex !== 0 &&
    ((wordTags?.has("Noun") && !wordTags?.has("Possessive")) ||
      wordTags?.has("Adjective"))
  ) {
    targetedWord = compromiseDoc.document[sentanceIndex][wordIndex - 1]; // re-attribute to previousWord (word before focusedWord)
    wordText = targetedWord["text"]; // re-attribute to previousWord (word before focusedWord)
    wordTags = targetedWord["tags"]; // re-attribute to previousWord (word before focusedWord)
    let regex = /^(his|her|their|theirs)$/i;
    if (targetedWord["tags"].has("Pronoun") && regex.test(wordText)) {
      transformedWord = "their";
      preTransformedWordTotalLength =
        calculateCompromiseWordLength(targetedWord);
    }
  }

  if (transformedWord) {
    // Capitalise transformedWord if original word was
    if (/^[A-Z]/.test(targetedWord["text"]))
      transformedWord =
        transformedWord[0].toUpperCase() + transformedWord.slice(1);

    // Update text of transformedWord in compromiseDoc
    targetedWord["text"] = transformedWord;

    // Add braces to pre and post of transformedWord in compromiseDoc
    addBracesToWord(targetedWord);

    postTransformedWordTotalLength =
      calculateCompromiseWordLength(targetedWord);
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

        console.log({ compromiseDoc });

        // Find current selection and current offset of cursor from Lexical Editor
        const selection = $getSelection();
        let startingCursorOffset: number | null = null;
        if (
          $isRangeSelection(selection) &&
          selection.anchor.key === node.getKey()
        ) {
          startingCursorOffset = selection.anchor.offset;
        }

        // Find 'focused' word that the cursor is in
        let focusedSentenceIndex: number = 0;
        let focusedWordIndex: number | null = null;
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
                  "focusedWord DOES NOT end with punctuation mark or space: breaking from inside inner loop"
                );
                break outerLoop;
              }

              focusedSentenceIndex = i;
              focusedWordIndex = j;
              break outerLoop;
            }
          }
        }

        if (
          startingCursorOffset !== null &&
          focusedSentenceIndex !== null &&
          focusedWordIndex !== null
        ) {
          const {
            preTransformedWordTotalLength,
            transformedWord: focusedWordTransformed,
            postTransformedWordTotalLength,
          } = transformCompromiseWord(
            compromiseDoc,
            focusedSentenceIndex,
            focusedWordIndex
          );

          if (focusedWordTransformed && postTransformedWordTotalLength) {
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
              focusedSentenceIndex === compromiseDoc.document.length - 1 &&
              focusedWordIndex ===
                compromiseDoc.document[focusedSentenceIndex].length - 1
            ) {
              console.log(
                "Focused word not transformed. Last word in the document, nothing to be transformed"
              );
            } else {
              console.log(
                "Focused word not transformed, but not the last word in the document, check next word"
              );

              const {
                preTransformedWordTotalLength,
                transformedWord,
                postTransformedWordTotalLength,
              } = transformCompromiseWord(
                compromiseDoc,
                focusedSentenceIndex,
                focusedWordIndex + 1
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
          console.log(
            "Focused word not complete (no trailing space or punctuation)"
          );
        }
      }
    );
    return () => removeNodeListener();
  }, [editor]);

  return null;
}
