"use client";

import { useSyncExternalStore } from "react";
import { toKey } from "./dates";

// Everything the app remembers lives under one localStorage key.
// No database, no accounts: it stays on this device.

export type Task = {
  id: string;
  title: string;
  /** The local day it's planned for. Unfinished + in the past → "From earlier". */
  date: string;
  done: boolean;
  doneAt?: string;
  createdAt: string;
};

export type Data = {
  version: 1;
  settings: { wrapUpTime: string | null };
  wrapUpDismissedOn: string | null;
  tasks: Task[];
  /** Set when the welcome flow is finished or skipped. Missing on data saved before onboarding existed. */
  onboarded?: boolean;
  /** Show the one-time "here's how it works" hint until the first check-off or "Got it". */
  showFirstHint?: boolean;
};

export type StorageStatus = "ok" | "unavailable" | "full" | "corrupt";

/** lastAddedId is memory-only: it marks a new task as "just added" for a few seconds. */
export type Snapshot = { data: Data; storage: StorageStatus; lastAddedId?: string };

const KEY = "todo:v1";
const BACKUP_KEY = "todo:backup";
export const DEFAULT_WRAP_UP = "18:00";

const emptyData = (): Data => ({
  version: 1,
  settings: { wrapUpTime: null },
  wrapUpDismissedOn: null,
  tasks: [],
});

function isData(value: unknown): value is Data {
  const v = value as Data;
  return (
    !!v &&
    v.version === 1 &&
    Array.isArray(v.tasks) &&
    v.tasks.every((t) => typeof t?.id === "string" && typeof t?.title === "string" && typeof t?.date === "string")
  );
}

function load(): Snapshot {
  let raw: string | null;
  try {
    // Some browsers (private modes, blocked site data) throw on write, not read.
    localStorage.setItem("todo:probe", "1");
    localStorage.removeItem("todo:probe");
    raw = localStorage.getItem(KEY);
  } catch {
    return { data: emptyData(), storage: "unavailable" };
  }
  if (raw === null) return { data: emptyData(), storage: "ok" };
  try {
    const parsed = JSON.parse(raw);
    if (isData(parsed)) return { data: parsed, storage: "ok" };
  } catch {}
  // Unreadable: keep a copy so nothing is silently lost, then start fresh.
  try {
    localStorage.setItem(BACKUP_KEY, raw);
    localStorage.removeItem(KEY);
  } catch {}
  return { data: emptyData(), storage: "corrupt" };
}

function save(data: Data): StorageStatus {
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
    return "ok";
  } catch (e) {
    return e instanceof DOMException && e.name === "QuotaExceededError" ? "full" : "unavailable";
  }
}

let snapshot: Snapshot | null = null;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

function onStorage(e: StorageEvent) {
  // Another tab changed the list: pick it up so tabs don't overwrite each other.
  if (e.key === KEY) {
    snapshot = load();
    emit();
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  if (listeners.size === 1) window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) window.removeEventListener("storage", onStorage);
  };
}

function getSnapshot(): Snapshot {
  if (!snapshot) snapshot = load();
  return snapshot;
}

/** null while rendering on the server or hydrating: show a skeleton, never a fake empty list. */
export function useStore(): Snapshot | null {
  return useSyncExternalStore<Snapshot | null>(subscribe, getSnapshot, () => null);
}

function update(change: (data: Data) => Data) {
  const current = getSnapshot();
  const data = change(current.data);
  const status = save(data);
  // A save failure shows its notice right away; the "corrupt" notice stays until dismissed.
  snapshot = { ...current, data, storage: status === "ok" && current.storage === "corrupt" ? "corrupt" : status };
  emit();
}

function updateTasks(change: (tasks: Task[]) => Task[]) {
  update((d) => ({ ...d, tasks: change(d.tasks) }));
}

/** Every action returns an undo function for the toast. */
type Undo = () => void;

function snapshotTasks(): Undo {
  const before = getSnapshot().data.tasks;
  return () => updateTasks(() => before);
}

export function addTask(title: string, date: string): { id: string; undo: Undo } {
  const undo = snapshotTasks();
  const id = crypto.randomUUID();
  const task: Task = { id, title: title.trim(), date, done: false, createdAt: new Date().toISOString() };
  updateTasks((tasks) => [...tasks, task]);
  snapshot = { ...getSnapshot(), lastAddedId: id };
  emit();
  setTimeout(() => {
    if (snapshot?.lastAddedId === id) {
      snapshot = { ...snapshot, lastAddedId: undefined };
      emit();
    }
  }, 6000);
  return { id, undo };
}

export function toggleTask(id: string): Undo {
  const undo = snapshotTasks();
  update((d) => ({
    ...d,
    showFirstHint: false,
    tasks: d.tasks.map((t) =>
      t.id === id ? { ...t, done: !t.done, doneAt: t.done ? undefined : new Date().toISOString() } : t,
    ),
  }));
  return undo;
}

export function moveTasks(ids: string[], date: string): Undo {
  const undo = snapshotTasks();
  updateTasks((tasks) => tasks.map((t) => (ids.includes(t.id) ? { ...t, date } : t)));
  return undo;
}

export function updateTask(id: string, patch: { title: string; date: string }): Undo {
  const undo = snapshotTasks();
  updateTasks((tasks) => tasks.map((t) => (t.id === id ? { ...t, title: patch.title.trim(), date: patch.date } : t)));
  return undo;
}

export function deleteTasks(ids: string[]): Undo {
  const undo = snapshotTasks();
  updateTasks((tasks) => tasks.filter((t) => !ids.includes(t.id)));
  return undo;
}

export function setWrapUpTime(time: string) {
  update((d) => ({ ...d, settings: { ...d.settings, wrapUpTime: time } }));
}

/** End of the welcome flow. A first task means the hint is worth showing. */
export function finishOnboarding({ addedTask }: { addedTask: boolean }) {
  update((d) => ({
    ...d,
    onboarded: true,
    settings: { ...d.settings, wrapUpTime: d.settings.wrapUpTime ?? DEFAULT_WRAP_UP },
    showFirstHint: addedTask,
  }));
}

export function dismissFirstHint() {
  update((d) => ({ ...d, showFirstHint: false }));
}

export function dismissWrapUp(today: string) {
  update((d) => ({ ...d, wrapUpDismissedOn: today }));
}

/** Bring back a wrap-up card that was dismissed with "Not now". */
export function reopenWrapUp() {
  update((d) => ({ ...d, wrapUpDismissedOn: null }));
}

export function dismissStorageNotice() {
  const current = getSnapshot();
  snapshot = { ...current, storage: "ok" };
  emit();
}

// ---- Derived views (pure, so pages stay simple) ----

/** Nothing saved and the welcome flow not done: send them to /welcome. */
export function isNewUser(data: Data): boolean {
  return !data.onboarded && data.tasks.length === 0;
}

export function wrapUpTime(data: Data): string {
  return data.settings.wrapUpTime ?? DEFAULT_WRAP_UP;
}

/** Unfinished first (oldest added first), then finished (most recent first). */
export function sortForList(tasks: Task[]): Task[] {
  const open = tasks.filter((t) => !t.done).sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  const done = tasks.filter((t) => t.done).sort((a, b) => (b.doneAt ?? "").localeCompare(a.doneAt ?? ""));
  return [...open, ...done];
}

export function tasksOn(data: Data, day: string): Task[] {
  return sortForList(data.tasks.filter((t) => t.date === day));
}

/** Unfinished tasks from any past day: they keep piling up until acted on. */
export function fromEarlier(data: Data, today: string): Task[] {
  return data.tasks
    .filter((t) => !t.done && t.date < today)
    .sort((a, b) => a.date.localeCompare(b.date) || a.createdAt.localeCompare(b.createdAt));
}

export function doneOn(data: Data, day: string): number {
  return data.tasks.filter((t) => t.done && t.doneAt && toKey(new Date(t.doneAt)) === day).length;
}
