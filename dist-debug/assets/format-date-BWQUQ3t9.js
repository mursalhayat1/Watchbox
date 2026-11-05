// src/lib/format-date.ts
var FULL_DATE = new Intl.DateTimeFormat("en-US", {
	timeZone: "UTC",
	year: "numeric",
	month: "long",
	day: "numeric"
});
var SHORT_DATE = new Intl.DateTimeFormat("en-US", {
	timeZone: "UTC",
	year: "numeric",
	month: "short",
	day: "numeric"
});
var MONTH_YEAR = new Intl.DateTimeFormat("en-US", {
	timeZone: "UTC",
	year: "numeric",
	month: "long"
});
var FULL_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
var YEAR_MONTH_RE = /^\d{4}-\d{2}$/;
var DAYS_IN_MONTH = [
	31,
	28,
	31,
	30,
	31,
	30,
	31,
	31,
	30,
	31,
	30,
	31
];
function daysInMonth(year, month) {
	if (month === 2) return year % 4 === 0 && year % 100 !== 0 || year % 400 === 0 ? 29 : 28;
	return DAYS_IN_MONTH[month - 1];
}
function formatUtcDate(year, month, day, fmt) {
	if (month < 1 || month > 12 || day < 1 || day > daysInMonth(year, month)) return null;
	const date = /* @__PURE__ */ new Date(0);
	date.setUTCFullYear(year, month - 1, day);
	return fmt.format(date);
}
/**
* 'YYYY-MM-DD' → 'July 14, 2023' · 'YYYY-MM' → 'July 2023' · 'YYYY' → '2023'.
* Anything else passes through untouched, so rendering can never throw.
*/
function formatDate(input) {
	if (!input) return "";
	if (FULL_DATE_RE.test(input)) return formatUtcDate(+input.slice(0, 4), +input.slice(5, 7), +input.slice(8, 10), FULL_DATE) ?? input;
	if (YEAR_MONTH_RE.test(input)) return formatUtcDate(+input.slice(0, 4), +input.slice(5, 7), 1, MONTH_YEAR) ?? input;
	return input;
}
/**
* Short variant for dense lists: 'July 14, 2023' → 'Jul 14, 2023'.
* Falls back to formatDate behavior for anything without a day part.
*/
function formatDateShort(input) {
	if (!input) return "";
	if (FULL_DATE_RE.test(input)) return formatUtcDate(+input.slice(0, 4), +input.slice(5, 7), +input.slice(8, 10), SHORT_DATE) ?? input;
	return formatDate(input);
}
export { formatDateShort as n, formatDate as t };
