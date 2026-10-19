"use client";

import { useRouter } from "next/navigation";
import { useState, type RefObject } from "react";
import { Button } from "@/components/Button";
import { ChoiceChips, FieldError } from "@/components/ChoiceChips";
import { describedBy, TextInput } from "@/components/Field";
import { formatTime, minutesOf } from "@/lib/dates";
import { DEFAULT_WRAP_UP, finishOnboarding, setWrapUpTime } from "@/lib/store";

const PRESETS = ["17:00", "18:00", "19:00", "20:00", "21:00"];
type Choice = (typeof PRESETS)[number] | "other";

const options: { value: Choice; label: string }[] = [
  ...PRESETS.map((t) => ({ value: t, label: formatTime(t) })),
  { value: "other", label: "Other time" },
];

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
  const router = useRouter();
  const [choice, setChoice] = useState<Choice | null>(
    savedTime ? (PRESETS.includes(savedTime) ? savedTime : "other") : null,
  );
  const [other, setOther] = useState(savedTime && !PRESETS.includes(savedTime) ? savedTime : "");
  const [error, setError] = useState<string>();
  const [warning, setWarning] = useState<string>();
  const [confirmedEarly, setConfirmedEarly] = useState<string>();
  const id = "wrap-up";

  function submit() {
    if (!choice) return setError("Pick the time you usually finish for the day.");
    const time = choice === "other" ? other : choice;
    if (!time) return setError("Enter a time, like 7:00 PM.");
    // A morning time is probably a mistake, but night-shift people exist: warn once, then accept.
    if (minutesOf(time) < 12 * 60 && confirmedEarly !== time) {
      setConfirmedEarly(time);
      return setWarning(
        `${formatTime(time)} is in the morning. If that's when you finish for the day, press Continue again.`,
      );
    }
    setWrapUpTime(time);
    onDone();
  }

  return (
    <>
      <header className="flex flex-col gap-3">
        <h1 ref={headingRef} tabIndex={-1} className="text-2xl font-semibold tracking-tight text-ink outline-none">
          Plan your tasks day by day.
        </h1>
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
        <fieldset className="flex flex-col gap-1.5" aria-describedby={describedBy(id, { error, hint: true })}>
          <legend className="mb-1.5 font-medium text-ink">When are you usually done with tasks for the day?</legend>
          <p id={`${id}-hint`} className="mb-1 text-sm text-muted">
            At this time each day, Dayplan helps you wrap up. You can change it later.
          </p>
          <ChoiceChips
            name={id}
            options={options}
            value={choice}
            onChange={(c) => {
              setChoice(c);
              setError(undefined);
              setWarning(undefined);
            }}
          />
          {choice === "other" && (
            <div className="mt-2 flex flex-col gap-1.5">
              <label htmlFor={`${id}-time`} className="text-sm font-medium text-ink">
                Your time
              </label>
              <TextInput
                id={`${id}-time`}
                type="time"
                value={other}
                invalid={!!error}
                aria-describedby={describedBy(id, { error })}
                onChange={(e) => {
                  setOther(e.target.value);
                  setError(undefined);
                  setWarning(undefined);
                }}
              />
            </div>
          )}
          <FieldError id={id} error={error} />
          {warning && !error && (
            <p role="status" className="rounded-lg bg-warn-soft px-3 py-2 text-sm text-warn">
              {warning}
            </p>
          )}
        </fieldset>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Button type="submit">Continue</Button>
          <Button
            variant="ghost"
            onClick={() => {
              finishOnboarding({ addedTask: false });
              router.push("/");
            }}
          >
            Skip setup, use {formatTime(DEFAULT_WRAP_UP)}
          </Button>
        </div>
      </form>
    </>
  );
}
