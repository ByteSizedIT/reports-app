export function capitaliseEachWord(str: string): string {
  return str.replace(/\b\w/g, function (char) {
    return char.toUpperCase();
  });
}
