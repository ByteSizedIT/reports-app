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
import transformAdjectives from "./transform-functions/possessiveAdjectives";

import { irregularVerbsPresent } from "../dictionaries/irregularVerbs";

// Process text using Compromise library
function processText(text: string) {
  const compromiseDoc = nlp(text);
  const compromiseText = compromiseDoc.text();
  return { compromiseDoc, compromiseText };
}

// Calculate total length of word from Compromise document
export function calculateCompromiseWordLength(documentWord: {
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
  wordIndex: number,
  studentNames: Array<string>
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

  // Handle that Compromise always tags 'his' as possessive pronoun(equiv to theirs) and not as possessive adjective (equiv to their).
  else if (
    wordIndex !== 0 &&
    ((wordTags?.has("Noun") && !wordTags?.has("Possessive")) ||
      wordTags?.has("Adjective"))
  ) {
    // NOTE: destructuring only affects the inner scope. The outer variables transformedWord and preTransformedWordTotalLength remain unchanged; We therefore update the outer scope variables explicitly by relabelling the inner scope variables and then updating the outer scope variables in the subsequent if block
    const {
      transformedWord: transformedAdjective,
      preTransformedWordTotalLength: preTransformedAdjectiveTotalLength,
    } = transformAdjectives(
      targetedWord,
      compromiseDoc,
      sentanceIndex,
      wordIndex,
      wordText,
      wordTags,
      transformedWord,
      preTransformedWordTotalLength
    );
    if (transformedAdjective) {
      transformedWord = transformedAdjective;
      preTransformedWordTotalLength = preTransformedAdjectiveTotalLength;
    }
  }

  // Transform Verbs

  // Idenfify subjectVerbAgreement
  const previousWord =
    compromiseDoc.document[sentanceIndex][wordIndex - 1]?.["text"] ?? null;
  const previousWordTags =
    compromiseDoc.document[sentanceIndex][wordIndex - 1]?.["tags"] ?? null;
  let subjectVerbAgreement = null;
  if (
    previousWord?.toLowerCase() === "to" || // e.g. to play, to eat
    previousWordTags?.has("Modal") || // e.g. can play, should eat
    (previousWordTags?.has("Verb") && previousWordTags?.has("Infinitive")) // e.g. to play, to eat
  ) {
    subjectVerbAgreement = "infinitive";
  } else if (
    previousWord === "{name}" ||
    previousWord === "it" ||
    studentNames
      .map((name: string) => name.toLowerCase())
      .includes(previousWord)
  ) {
    subjectVerbAgreement = "singular";
  } else if (previousWord?.toLowerCase() === "they") {
    subjectVerbAgreement = "plural";
  }

  // Transform present tense verbs to infinitive
  if (
    subjectVerbAgreement === "plural" &&
    wordTags?.has("Verb") &&
    wordTags?.has("PresentTense") &&
    !wordTags?.has("Gerund")
    // below commented out as still need to still need to capture and add braces to existin plural infinitive verbs - e.g. {they} play -> {they} {play} - so that the verb can be identified and transformed from generic report to masc/fem form for individual student reports
    // &&
    // !tags?.includes("Infinitive")
  ) {
    // Present tense irregular verbs to infinitive
    if (wordText in irregularVerbsPresent) {
      transformedWord = `${irregularVerbsPresent[wordText]}`;
    }
    // Present tense regular verbs to infinitive
    else {
      // Transform present tense verbs to infinitive by passing the word to the compromise library and calling the toInfinitive method on the verbs (i.e. the single word) and then getting the text of the word
      transformedWord = nlp(
        compromiseDoc.document[sentanceIndex][wordIndex]["text"]
      )
        .verbs()
        .toInfinitive()
        .text();
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

export function CompromisePlugin({
  studentNames,
}: {
  studentNames: Array<string>;
}) {
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
            focusedWordIndex,
            studentNames
          );

          console.log("!!!!!!!!!!!!!!!!", {
            compromiseDoc,
            preTransformedWordTotalLength,
            focusedWordTransformed,
            postTransformedWordTotalLength,
          });

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
                focusedWordIndex + 1,
                studentNames
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
  }, [editor, studentNames]);

  return null;
}
