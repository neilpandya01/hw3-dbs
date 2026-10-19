// Days are local "YYYY-MM-DD" keys. Never use toISOString() here: it converts
// to UTC and can shift the day for anyone west or east of Greenwich.

const KEY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export function toKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function todayKey(): string {
  return toKey(new Date());
}

/** Returns a local Date at midnight, or null if the key isn't a real day. */
export function fromKey(key: string): Date | null {
  if (!KEY_PATTERN.test(key)) return null;
  const [y, m, d] = key.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return toKey(date) === key ? date : null;
}

export function isValidKey(key: string): boolean {
  return fromKey(key) !== null;
}

export function addDays(key: string, days: number): string {
  const date = fromKey(key)!;
  date.setDate(date.getDate() + days);
  return toKey(date);
}

export function daysBetween(from: string, to: string): number {
  const ms = fromKey(to)!.getTime() - fromKey(from)!.getTime();
  return Math.round(ms / 86_400_000);
}

/** "Thu, Oct 23" */
export function formatDay(key: string): string {
  return fromKey(key)!.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

/** "Today", "Tomorrow", "Yesterday", or "Thu, Oct 23" */
export function dayName(key: string, today: string): string {
  const diff = daysBetween(today, key);
  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  if (diff === -1) return "Yesterday";
  return formatDay(key);
}

/** How long a carried-over task has been waiting: "from yesterday", "from Mon", "12 days". */
export function ageLabel(key: string, today: string): string {
  const days = daysBetween(key, today);
  if (days === 1) return "from yesterday";
  if (days < 7) {
    const weekday = fromKey(key)!.toLocaleDateString("en-US", { weekday: "short" });
    return `from ${weekday}`;
  }
  return `${days} days`;
}

/** "18:00" → "6 PM", "18:30" → "6:30 PM" */
export function formatTime(hhmm: string): string {
  const [h, m] = hhmm.split(":").map(Number);
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  const suffix = h < 12 ? "AM" : "PM";
  return m === 0 ? `${hour12} ${suffix}` : `${hour12}:${String(m).padStart(2, "0")} ${suffix}`;
}

export function minutesOf(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

/** Where a day's list lives: today is the home page. */
export function dayHref(key: string, today: string): string {
  return key === today ? "/" : `/day/${key}`;
}
