export default function pronouns(
  wordText: string,
  transformedWord: string | null
) {
  // Transform Personal Pronouns
  let regex = /^(he|she|they)$/i;
  if (regex.test(wordText)) {
    transformedWord = "they";
  }

  // Transform Reflexive/Intensive Pronouns
  regex = /^(himself|herself|themself)$/i;
  if (regex.test(wordText)) {
    transformedWord = "themself";
  }

  // Transform Object Pronouns
  // Handle that Compromise always tags 'her' as a possessive pronoun (equiv to their) and not an object pronoun(equiv to them)
  regex = /^(him|her|them)$/i;
  if (regex.test(wordText)) {
    transformedWord = "them";
  }

  // Transfer Possessive pronouns
  // handle that Compromise incorrrectly marks it's contraction as a possessive pronoun...
  if (wordText === "it's") transformedWord = "it's";
  // leave 'its' as is
  if (wordText === "its") transformedWord = null;
  regex = /^(his|hers|theirs)$/i;
  if (regex.test(wordText)) {
    transformedWord = "theirs";
  }

  return transformedWord;
}
