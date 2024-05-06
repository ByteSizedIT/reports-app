// Generate an array of years

export function generateYearsArray(length: number) {
  const yearsArray = Array.from({ length }, (_, index) => {
    const currentYear = new Date().getFullYear();
    return currentYear + index;
  });
  return yearsArray;
}
