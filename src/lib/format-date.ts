// Display formatting for TMDB date-only strings.
// TMDB may return full dates ('YYYY-MM-DD') but also partial ones ('YYYY' or
// 'YYYY-MM'); partial input must never gain invented day/month parts, and
// malformed input must never throw while rendering. Everything is evaluated
// against the real calendar and anchored at UTC midnight so a date never
// shifts a day in negative-UTC-offset timezones.

const FULL_DATE = new Intl.DateTimeFormat('en-US', {
  timeZone: 'UTC',
  year: 'numeric',
  month: 'long',
  day: 'numeric',
});

const SHORT_DATE = new Intl.DateTimeFormat('en-US', {
  timeZone: 'UTC',
  year: 'numeric',
  month: 'short',
  day: 'numeric',
});

const MONTH_YEAR = new Intl.DateTimeFormat('en-US', {
  timeZone: 'UTC',
  year: 'numeric',
  month: 'long',
});

const FULL_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const YEAR_MONTH_RE = /^\d{4}-\d{2}$/;

const DAYS_IN_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

function daysInMonth(year: number, month: number): number {
  if (month === 2) {
    const leap = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
    return leap ? 29 : 28;
  }
  return DAYS_IN_MONTH[month - 1];
}

// Returns null for calendar-invalid input (Feb 30, month 13, ...). Uses
// setUTCFullYear so sub-1000 years don't get remapped to the 1900s.
function formatUtcDate(year: number, month: number, day: number, fmt: Intl.DateTimeFormat): string | null {
  if (month < 1 || month > 12 || day < 1 || day > daysInMonth(year, month)) return null;
  const date = new Date(0);
  date.setUTCFullYear(year, month - 1, day);
  return fmt.format(date);
}

/**
 * 'YYYY-MM-DD' → 'July 14, 2023' · 'YYYY-MM' → 'July 2023' · 'YYYY' → '2023'.
 * Anything else passes through untouched, so rendering can never throw.
 */
export function formatDate(input: string | null | undefined): string {
  if (!input) return '';
  if (FULL_DATE_RE.test(input)) {
    return formatUtcDate(+input.slice(0, 4), +input.slice(5, 7), +input.slice(8, 10), FULL_DATE) ?? input;
  }
  if (YEAR_MONTH_RE.test(input)) {
    return formatUtcDate(+input.slice(0, 4), +input.slice(5, 7), 1, MONTH_YEAR) ?? input;
  }
  return input;
}

/**
 * Short variant for dense lists: 'July 14, 2023' → 'Jul 14, 2023'.
 * Falls back to formatDate behavior for anything without a day part.
 */
export function formatDateShort(input: string | null | undefined): string {
  if (!input) return '';
  if (FULL_DATE_RE.test(input)) {
    return formatUtcDate(+input.slice(0, 4), +input.slice(5, 7), +input.slice(8, 10), SHORT_DATE) ?? input;
  }
  return formatDate(input);
}
