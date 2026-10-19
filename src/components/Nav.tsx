"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { buttonClass } from "./Button";

const tabs = [
  { href: "/", label: "Today", match: (p: string) => p === "/" || p.startsWith("/day/") },
  { href: "/upcoming", label: "Upcoming", match: (p: string) => p === "/upcoming" },
  { href: "/done", label: "Done", match: (p: string) => p === "/done" },
];

/** Shared on every page: where you are (aria-current) and one tap back to Today. */
export function Nav() {
  const pathname = usePathname();
  return (
    <NavFrame>
      {tabs.map((t) => {
        const current = t.match(pathname);
        return (
          <Link
            key={t.href}
            href={t.href}
            aria-current={current ? "page" : undefined}
            className={`flex min-h-11 flex-1 items-center justify-center border-b-2 text-sm font-medium ${
              current ? "border-accent text-ink" : "border-transparent text-muted hover:text-ink"
            }`}
          >
            {t.label}
          </Link>
        );
      })}
      <Link
        href="/add"
        aria-current={pathname === "/add" ? "page" : undefined}
        className={`${buttonClass({ size: "sm" })} ml-2 self-center`}
      >
        + Add
      </Link>
    </NavFrame>
  );
}

/** Same frame without active state: the fallback while the URL is being read. */
export function NavFrame({ children }: { children?: React.ReactNode }) {
  return (
    <nav aria-label="Main" className="flex min-h-11 items-stretch">
      {children}
    </nav>
  );
}
