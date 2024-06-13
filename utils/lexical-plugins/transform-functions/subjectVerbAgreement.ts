export default function calculateSubjectVerbAgreement(
  compromiseDoc: any,
  sentanceIndex: number,
  studentNames: Array<string>
) {
  const precedingText = compromiseDoc.document[sentanceIndex].slice(0, -1);

  // loop through previous words to also find subjectVerb agreement for 'listed' verbs = e.g. He reads and WRITES
  for (let i = precedingText.length - 1; i >= 0; i--) {
    const previousWord =
      compromiseDoc.document[sentanceIndex][i]?.["text"] ?? null;
    const previousWordTags =
      compromiseDoc.document[sentanceIndex][i]?.["tags"] ?? null;

    if (
      previousWord?.toLowerCase() === "to" || // e.g. to play, to eat
      previousWordTags?.has("Modal") || // e.g. can play, should eat
      (previousWordTags?.has("Verb") && previousWordTags?.has("Infinitive")) // e.g. to play, to eat
    ) {
      return "infinitive";
    } else if (
      previousWord === "name" ||
      previousWord === "it" ||
      studentNames
        .map((name: string) => name.toLowerCase())
        .includes(previousWord)
    ) {
      return "singular";
    } else if (previousWord?.toLowerCase() === "they") {
      return "plural";
    }
  }
}
