export default function calculateSubjectVerbAgreement(
  compromiseDoc: any,
  sentanceIndex: number,
  wordIndex: number,
  studentNames: Array<string>
) {
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

  return subjectVerbAgreement;
}
