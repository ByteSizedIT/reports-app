import nlp from "compromise";

export default function calculateSubjectVerbAgreement(
  compromiseDoc: any,
  sentanceIndex: number,
  wordIndex: number,
  studentNames: Array<string>
) {
  const currentWord =
    compromiseDoc.document[sentanceIndex][wordIndex]?.["text"] ?? null;
  const currentWordTags =
    compromiseDoc.document[sentanceIndex][wordIndex]?.["tags"] ?? null;

  let subjectVerbAgreement = null;

  if (
    currentWordTags?.has("Verb") &&
    (nlp(currentWord).verbs().isSingular() ||
      nlp(currentWord).verbs().isPlural())
  ) {
    subjectVerbAgreement = "plural";
  }

  const precedingText = compromiseDoc.document[sentanceIndex].slice(0, -1);
  for (let i = precedingText.length - 1; i >= 0; i--) {
    // Idenfify subjectVerbAgreement
    const previousWord =
      compromiseDoc.document[sentanceIndex][i]?.["text"] ?? null;
    const previousWordTags =
      compromiseDoc.document[sentanceIndex][i]?.["tags"] ?? null;

    if (
      (currentWordTags.has("Infinitive") &&
        previousWord?.toLowerCase() === "to") || // e.g. to play, to eat
      previousWordTags?.has("Modal")
      // e.g. can play, should eat
      //  || (previousWordTags?.has("Verb") && previousWordTags?.has("Infinitive")) // plurals also marked as infinitive in compromise so can't use this
    ) {
      // e.g. to play, to eat
      subjectVerbAgreement = "infinitive";
      break;
    } else if (
      previousWord === "name" ||
      previousWord === "it" ||
      studentNames
        .map((name: string) => name.toLowerCase())
        .includes(previousWord)
    ) {
      subjectVerbAgreement = "singular";
      break;
    } else if (previousWord?.toLowerCase() === "they") {
      subjectVerbAgreement = "plural";
      break;
    }
  }
  return subjectVerbAgreement;
}
