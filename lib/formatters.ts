/**
 * KES (Kenyan Shilling) and date formatters for the Expense Tracker.
 */

const KES_LOCALE = "en-KE";

/**
 * Format a number as Kenyan Shillings (KES).
 * Example: 15000 -> "KES 15,000.00"
 */
export function formatKES(amount: number | string): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  if (Number.isNaN(num)) return "KES 0.00";
  return new Intl.NumberFormat(KES_LOCALE, {
    style: "currency",
    currency: "KES",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
}

/**
 * Format a number as KES without currency symbol (e.g. for inputs).
 * Example: 15000 -> "15,000.00"
 */
export function formatKESPlain(amount: number | string): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  if (Number.isNaN(num)) return "0.00";
  return new Intl.NumberFormat(KES_LOCALE, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
}

/**
 * Parse a display or input string back to number (handles "15,000.00").
 */
export function parseKESInput(value: string): number {
  const cleaned = value.replace(/,/g, "").replace(/[^\d.-]/g, "");
  const num = parseFloat(cleaned);
  return Number.isNaN(num) ? 0 : num;
}

/**
 * Format date for display (e.g. "1 Feb 2025").
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat(KES_LOCALE, {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(d);
}

/**
 * Format date for input[type="date"] (YYYY-MM-DD).
 */
export function formatDateForInput(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/**
 * Get month name (e.g. "February").
 */
export function getMonthName(month: number): string {
  const d = new Date(2000, month - 1, 1);
  return new Intl.DateTimeFormat(KES_LOCALE, { month: "long" }).format(d);
}

/**
 * Get short month name (e.g. "Feb").
 */
export function getShortMonthName(month: number): string {
  const d = new Date(2000, month - 1, 1);
  return new Intl.DateTimeFormat(KES_LOCALE, { month: "short" }).format(d);
}
