"use client";

import type { RefObject } from "react";
import { Button } from "@/components/Button";
import { useWrapUpTime, WrapUpTimeField } from "@/components/WrapUpTimeField";
import { DEFAULT_WRAP_UP, setWrapUpTime } from "@/lib/store";

/** Step 1: say what Dayplan is, then ask the one question it needs. */
export function WrapUpStep({
  headingRef,
  savedTime,
  onDone,
}: {
  headingRef: RefObject<HTMLHeadingElement | null>;
  savedTime: string | null;
  onDone: () => void;
}) {
  const wrapUp = useWrapUpTime(savedTime, "Continue");

  function submit() {
    const time = wrapUp.validate();
    if (!time) return;
    setWrapUpTime(time);
    onDone();
  }

  return (
    <>
      <header className="flex flex-col gap-3">
        <h2 ref={headingRef} tabIndex={-1} className="text-2xl font-semibold tracking-tight text-ink outline-none">
          Plan your tasks day by day.
        </h2>
        <p className="text-ink">Dayplan is a to-do list where every task belongs to a day.</p>
        <ol className="flex flex-col gap-2 text-ink">
          {[
            "Add tasks to today, or to any day ahead.",
            "Check them off as you go.",
            "At the end of your day, keep or move what's left. Nothing gets lost.",
          ].map((line, i) => (
            <li key={line} className="flex items-start gap-3">
              <span aria-hidden="true" className="flex size-6 shrink-0 items-center justify-center rounded-full bg-accent-soft text-sm font-semibold text-accent">
                {i + 1}
              </span>
              {line}
            </li>
          ))}
        </ol>
        <p className="text-sm text-muted">Everything is saved on this device. No account needed.</p>
      </header>

      <form
        noValidate
        className="flex flex-col gap-6 rounded-2xl border border-line bg-surface p-4"
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <WrapUpTimeField
          id="wrap-up"
          legend="When are you usually done with tasks for the day?"
          hint="At this time every day, Dayplan helps you wrap up. You can always change it later."
          state={wrapUp}
        />

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Button type="submit">Continue</Button>
          {/* Skip only skips this question: it keeps the 6 PM default and still goes on to step 2. */}
          <Button
            variant="ghost"
            onClick={() => {
              setWrapUpTime(savedTime ?? DEFAULT_WRAP_UP);
              onDone();
            }}
          >
            Skip
          </Button>
        </div>
      </form>
    </>
  );
}
