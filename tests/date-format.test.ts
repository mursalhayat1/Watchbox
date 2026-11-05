import { describe, expect, it } from 'vitest';
import { formatDate, formatDateShort } from '../src/lib/format-date.js';

describe('formatDate (TMDB display dates)', () => {
  it('formats full dates as "Month D, YYYY" pinned to UTC', () => {
    expect(formatDate('2023-07-14')).toBe('July 14, 2023');
  });

  it('formats year-month without inventing a day', () => {
    expect(formatDate('2023-07')).toBe('July 2023');
  });

  it('returns bare years untouched, without inventing month/day', () => {
    expect(formatDate('2023')).toBe('2023');
  });

  it('returns empty string for empty input', () => {
    expect(formatDate('')).toBe('');
  });

  it('falls back to the raw string instead of throwing on garbage', () => {
    expect(formatDate('garbage')).toBe('garbage');
  });

  it('falls back to the raw string on calendar-invalid dates', () => {
    expect(formatDate('2023-02-30')).toBe('2023-02-30');
  });

  it('does not remap sub-1000 years into the 1900s', () => {
    expect(formatDate('0999-12-31')).toBe('December 31, 999');
  });
});

describe('formatDateShort (list-friendly variant)', () => {
  it('abbreviates the month for full dates', () => {
    expect(formatDateShort('2023-07-14')).toBe('Jul 14, 2023');
  });

  it('formats year-month without a day', () => {
    expect(formatDateShort('2023-07')).toBe('July 2023');
  });

  it('never throws on partial or malformed input', () => {
    expect(formatDateShort('2023')).toBe('2023');
    expect(formatDateShort('oops')).toBe('oops');
    expect(formatDateShort('')).toBe('');
  });
});
