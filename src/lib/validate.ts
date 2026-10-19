import { formatDay, isValidKey } from "./dates";
import type { Task } from "./store";

export const MAX_TITLE = 120;

export type TaskErrors = { title?: string; date?: string };

/** Errors say what to do next, and sit next to the field they're about. */
export function validateTask(title: string, date: string, today: string): TaskErrors {
  const errors: TaskErrors = {};
  const trimmed = title.trim();
  if (!trimmed) errors.title = "Enter a task name.";
  else if (trimmed.length > MAX_TITLE)
    errors.title = `Shorten this to ${MAX_TITLE} characters or fewer (now ${trimmed.length}).`;

  if (!date || !isValidKey(date)) errors.date = "Pick a day for this task.";
  else if (date < today) errors.date = "Pick today or a later day.";
  return errors;
}

// ---- "Too similar" check: a soft warning, never a block ----

function normalize(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, "")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/s$/, "");
}

function editDistance(a: string, b: string): number {
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const row = [i];
    for (let j = 1; j <= b.length; j++) {
      row[j] = Math.min(prev[j] + 1, row[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
    prev = row;
  }
  return prev[b.length];
}

function isSimilar(a: string, b: string): boolean {
  if (a === b) return true;
  const [short, long] = a.length <= b.length ? [a, b] : [b, a];
  if (short.length >= 4 && long.includes(short)) return true;
  return short.length >= 5 && editDistance(a, b) <= 2;
}

/** A warning to show under the task field, or null. Only compares unfinished tasks on the same day. */
export function similarWarning(title: string, date: string, tasks: Task[]): { message: string; match: Task } | null {
  const wanted = normalize(title);
  if (!wanted) return null;
  const sameDay = tasks.filter((t) => t.date === date && !t.done);
  const exact = sameDay.find((t) => normalize(t.title) === wanted);
  if (exact) {
    return {
      match: exact,
      message: `"${exact.title}" is already on ${formatDay(date)}. Add it anyway? Press Add again.`,
    };
  }
  const close = sameDay.find((t) => isSimilar(normalize(t.title), wanted));
  if (close) {
    return {
      match: close,
      message: `This looks like "${close.title}", already on ${formatDay(date)}. Change the name, or press Add again to keep both.`,
    };
  }
  return null;
}
