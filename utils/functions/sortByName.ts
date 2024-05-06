// Function to sort a list of objects by surname and forename properties

export function sortByName(arr: Array<any>) {
  return arr.sort((a, b) => {
    if (a.surname > b.surname) return 1;
    if (a.surname < b.surname) return -1;
    if (a.forename > b.forename) return 1;
    if (a.forename < b.forename) return -1;
    return 0;
  });
}
