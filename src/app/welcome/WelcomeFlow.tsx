"use client";

import { useEffect, useRef, useState } from "react";
import { ListSkeleton } from "@/components/Page";
import { useClock } from "@/lib/clock";
import { useStore } from "@/lib/store";
import { FirstTaskStep } from "./FirstTaskStep";
import { WrapUpStep } from "./WrapUpStep";

type Step = "wrap-up" | "first-task";

/**
 * The first visit, for someone with nothing saved:
 *   1. What Dayplan does + "When are you usually done for the day?"
 *   2. Add a first task (by example), for today or another day, or skip.
 * Answering step 1 is saved right away, so a reload resumes at step 2.
 */
export function WelcomeFlow() {
  const store = useStore();
  const clock = useClock();
  if (!store || !clock) return <ListSkeleton />;
  return (
    <Flow
      initialStep={store.data.settings.wrapUpTime ? "first-task" : "wrap-up"}
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
      <p className="text-sm font-medium text-muted" aria-live="polite">
        Step {step === "wrap-up" ? 1 : 2} of 2
      </p>
      {step === "wrap-up" ? (
        <WrapUpStep headingRef={heading} savedTime={savedTime} onDone={() => go("first-task")} />
      ) : (
        <FirstTaskStep headingRef={heading} today={today} onBack={() => go("wrap-up")} />
      )}
    </div>
  );
}
