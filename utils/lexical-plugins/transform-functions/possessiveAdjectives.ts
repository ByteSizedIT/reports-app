import { calculateCompromiseWordLength } from "@/utils/lexical-plugins/CompromisePlugin";

// Identify and Transform Possessive Adjectives by checking if word is a noun preceded by a possessive pronoun (compromise marks possessive adjectives as possessive pronouns) or an adjective that is itself preceded by a possessive pronoun
export default function transformPossessiveAdjectives(
  targetedWord: any,
  compromiseDoc: any,
  sentanceIndex: number,
  wordIndex: number,
  wordText: string,
  wordTags: any,
  transformedWord: string | null,
  preTransformedWordTotalLength: number
) {
  targetedWord = compromiseDoc.document[sentanceIndex][wordIndex - 1]; // re-attribute to previousWord (word before focusedWord)
  wordText = targetedWord["text"]; // re-attribute to previousWord (word before focusedWord)
  wordTags = targetedWord["tags"]; // re-attribute to previousWord (word before focusedWord)
  let regex = /^(his|her|their|theirs)$/i;
  if (targetedWord["tags"].has("Pronoun") && regex.test(wordText)) {
    transformedWord = "their";
    preTransformedWordTotalLength = calculateCompromiseWordLength(targetedWord);
  }

  return { transformedWord, preTransformedWordTotalLength };
}
