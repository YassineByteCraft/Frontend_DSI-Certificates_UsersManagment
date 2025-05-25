/**
 * Formats a JavaScript Date object to 'DD-MM-YYYY' string for frontend display.
 * @param {Date|null|undefined} date - The date to format.
 * @returns {string|undefined} - The formatted date string or undefined if input is invalid.
 */
export function formatDateToDMY(date) {
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) return undefined;
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
}

