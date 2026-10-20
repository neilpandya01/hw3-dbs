"use client";

import { useEffect, useRef, useState } from "react";
import { ListSkeleton } from "@/components/Page";
import { useClock } from "@/lib/clock";
import { useStore } from "@/lib/store";
import { FirstTaskStep } from "./FirstTaskStep";
import { OverviewStep } from "./OverviewStep";
import { WrapUpStep } from "./WrapUpStep";

const STEPS = ["overview", "wrap-up", "first-task"] as const;
type Step = (typeof STEPS)[number];

/**
 * The first visit, for someone with nothing saved:
 *   1. Read the overview: what Dayplan is and how it works.
 *   2. Set the time you usually wrap up (or Skip to keep 6 PM).
 *   3. Add a first task (by example), for today or another day, or skip.
 * The wrap-up time is saved the moment it's answered, so a reload resumes at step 3.
 */
export function WelcomeFlow() {
  const store = useStore();
  const clock = useClock();
  if (!store || !clock) return <ListSkeleton />;
  return (
    <Flow
      initialStep={store.data.settings.wrapUpTime ? "first-task" : "overview"}
      savedTime={store.data.settings.wrapUpTime}
      today={clock.today}
    />
  );
}

function Flow({ initialStep, savedTime, today }: { initialStep: Step; savedTime: string | null; today: string }) {
  const [step, setStep] = useState<Step>(initialStep);
  const heading = useRef<HTMLHeadingElement>(null);
  const moved = useRef(false);

  // Moving between steps puts focus on the new heading, so keyboard and screen reader users land in the right place.
  useEffect(() => {
    if (moved.current) heading.current?.focus();
  }, [step]);

  function go(next: Step) {
    moved.current = true;
    setStep(next);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-semibold tracking-tight text-ink">Welcome to Dayplan</h1>
        <p className="text-sm font-medium text-muted" aria-live="polite">
          Step {STEPS.indexOf(step) + 1} of {STEPS.length}
        </p>
      </div>
      {step === "overview" && <OverviewStep headingRef={heading} onDone={() => go("wrap-up")} />}
      {step === "wrap-up" && (
        <WrapUpStep
          headingRef={heading}
          savedTime={savedTime}
          onDone={() => go("first-task")}
          onBack={() => go("overview")}
        />
      )}
      {step === "first-task" && <FirstTaskStep headingRef={heading} today={today} onBack={() => go("wrap-up")} />}
    </div>
  );
}
