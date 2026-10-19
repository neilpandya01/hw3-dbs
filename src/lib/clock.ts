"use client";

import { useSyncExternalStore } from "react";
import { todayKey } from "./dates";

// The current day and minute, re-read every 30 seconds so the list rolls over
// at midnight and the wrap-up card appears on time without a reload.

function subscribe(listener: () => void) {
  const timer = setInterval(listener, 30_000);
  window.addEventListener("focus", listener);
  return () => {
    clearInterval(timer);
    window.removeEventListener("focus", listener);
  };
}

function getSnapshot(): string {
  const now = new Date();
  return `${todayKey()}|${now.getHours() * 60 + now.getMinutes()}`;
}

export type Clock = { today: string; minutes: number };

/** null on the server: the date depends on the visitor's own time zone. */
export function useClock(): Clock | null {
  const value = useSyncExternalStore<string | null>(subscribe, getSnapshot, () => null);
  if (!value) return null;
  const [today, minutes] = value.split("|");
  return { today, minutes: Number(minutes) };
}
