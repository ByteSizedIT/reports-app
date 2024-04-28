export function calculateCurrentDate() {
  const today = new Date();
  const { currentDay, currentDate, currentMonth, currentYear } = {
    currentDay: today.getDay(),
    currentDate: today.getDate(),
    currentMonth: today.getMonth() + 1, // Adding 1 to get 1-based month
    currentYear: today.getFullYear(),
  };

  return { currentDay, currentDate, currentMonth, currentYear };
}
