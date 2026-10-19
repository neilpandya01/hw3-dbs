"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { isNewUser, useStore } from "@/lib/store";

/**
 * The app name and main navigation. Hidden until onboarding is finished, so a new
 * person sees only the welcome flow, and hidden while saved data loads, so a new
 * person never sees it flash in and out.
 */
export function AppHeader({ nav }: { nav: ReactNode }) {
  const store = useStore();
  if (!store || isNewUser(store.data)) return null;

  return (
    <header className="sticky top-0 z-10 border-b border-line bg-bg/95 backdrop-blur">
      <div className="mx-auto flex w-full max-w-xl flex-col px-4 pt-3">
        <Link href="/" className="self-start text-base font-semibold tracking-tight text-ink">
          Dayplan
        </Link>
        {nav}
      </div>
    </header>
  );
}
