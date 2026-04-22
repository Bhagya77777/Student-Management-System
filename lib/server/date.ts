const DATE_ONLY_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export function isDateOnly(value: string): boolean {
  return DATE_ONLY_REGEX.test(value);
}

// Parse date-only strings as local dates to avoid timezone day-shift issues in calendars.
export function parseDateOnlyLocal(value: string): Date {
  if (!isDateOnly(value)) {
    throw new Error("Invalid date format. Expected YYYY-MM-DD");
  }

  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function todayDateOnlyLocal(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
