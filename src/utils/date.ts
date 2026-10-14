/**
 * Date helpers for the calendar. Everything is local-time and uses a plain
 * `YYYY-MM-DD` string as the canonical "date key" (avoids the UTC shifting you
 * get from `new Date('2026-10-14')`).
 */

export type DateKey = string;

export const MONTH_NAMES = [
  'JANUARY',
  'FEBRUARY',
  'MARCH',
  'APRIL',
  'MAY',
  'JUNE',
  'JULY',
  'AUGUST',
  'SEPTEMBER',
  'OCTOBER',
  'NOVEMBER',
  'DECEMBER',
] as const;

export const WEEKDAY_LABELS = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'] as const;

export const WEEKDAY_NAMES = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
] as const;

function titleCase(value: string): string {
  return value.charAt(0) + value.slice(1).toLowerCase();
}

/** e.g. "Tuesday · 14 October 2026" */
export function formatFullDate(key: DateKey): string {
  const { year, month0, day } = parseDateKey(key);
  const weekday = WEEKDAY_NAMES[new Date(year, month0, day).getDay()] ?? '';
  return `${weekday} · ${day} ${titleCase(MONTH_NAMES[month0] ?? '')} ${year}`;
}

/** Format a Date as a local `YYYY-MM-DD` key. */
export function toDateKey(date: Date): DateKey {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function makeDateKey(year: number, month0: number, day: number): DateKey {
  return toDateKey(new Date(year, month0, day));
}

export function todayKey(): DateKey {
  return toDateKey(new Date());
}

export function parseDateKey(key: DateKey): {
  year: number;
  month0: number;
  day: number;
} {
  const [year, month, day] = key.split('-').map(Number);
  return { year: year ?? 0, month0: (month ?? 1) - 1, day: day ?? 1 };
}

/** Human label for the calendar header, e.g. "OCTOBER 2026". */
export function formatMonthLabel(year: number, month0: number): string {
  return `${MONTH_NAMES[month0] ?? ''} ${year}`.trim();
}

/** Human label for a single day, e.g. "14 OCTOBER 2026". */
export function formatDateLabel(key: DateKey): string {
  const { year, month0, day } = parseDateKey(key);
  return `${String(day).padStart(2, '0')} ${MONTH_NAMES[month0] ?? ''} ${year}`.trim();
}

/** Clamp-safe month arithmetic across year boundaries. */
export function addMonths(
  year: number,
  month0: number,
  delta: number,
): { year: number; month0: number } {
  const date = new Date(year, month0 + delta, 1);
  return { year: date.getFullYear(), month0: date.getMonth() };
}

export type MonthCell = {
  key: DateKey;
  day: number;
  /** False for the leading/trailing days borrowed from adjacent months. */
  inMonth: boolean;
};

/**
 * Build a 7-column grid of weeks for the given month, padded with the
 * surrounding days so every row is complete.
 */
export function buildMonthGrid(year: number, month0: number): MonthCell[][] {
  const startWeekday = new Date(year, month0, 1).getDay(); // 0 = Sunday
  const daysInMonth = new Date(year, month0 + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month0, 0).getDate();

  const cells: MonthCell[] = [];

  for (let i = startWeekday - 1; i >= 0; i--) {
    const day = daysInPrevMonth - i;
    cells.push({
      key: toDateKey(new Date(year, month0 - 1, day)),
      day,
      inMonth: false,
    });
  }

  for (let day = 1; day <= daysInMonth; day++) {
    cells.push({ key: makeDateKey(year, month0, day), day, inMonth: true });
  }

  let nextDay = 1;
  while (cells.length % 7 !== 0) {
    cells.push({
      key: toDateKey(new Date(year, month0 + 1, nextDay)),
      day: nextDay,
      inMonth: false,
    });
    nextDay++;
  }

  const weeks: MonthCell[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }
  return weeks;
}
