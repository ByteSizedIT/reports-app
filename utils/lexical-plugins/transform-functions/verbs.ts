import nlp from "compromise";

import calculateSubjectVerbAgreement from "./subjectVerbAgreement";

import {
  irregularVerbsPresent,
  irregularVerbsPast,
} from "../../dictionaries/irregularVerbs";

export default function verbs(
  compromiseDoc: any,
  sentanceIndex: number,
  wordText: string,
  wordTags: any,
  studentNames: Array<string>,
  transformedWord: string | null
) {
  const subjectVerbAgreement = calculateSubjectVerbAgreement(
    compromiseDoc,
    sentanceIndex,
    studentNames
  );

  // Transform present tense verbs to infinitive
  if (
    subjectVerbAgreement === "plural" &&
    wordTags?.has("Verb") &&
    wordTags?.has("PresentTense") &&
    !wordTags?.has("Gerund")
    // below commented out as still need to still need to capture and add braces to existing plural infinitive verbs - e.g. {they} play -> {they} {play} - so that the verb can be identified and transformed from generic report to masc/fem form for individual student reports
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
        // compromiseDoc.document[sentanceIndex][wordIndex]["text"]
        wordText
      )
        .verbs()
        .toInfinitive()
        .text();
    }
  }

  // Past tense verbs
  else if (
    subjectVerbAgreement === "plural" &&
    wordTags?.has("Verb") &&
    wordTags?.has("PastTense")
  ) {
    // Past tense irregular verbs (only 'to be' has different singular/plural forms in the past tense?)
    if (wordText in irregularVerbsPast) {
      transformedWord = `${irregularVerbsPast[wordText]}`;
    }
    // Past tense regular verbs - remain the same in singular/plural form
  }
  return transformedWord;
}
