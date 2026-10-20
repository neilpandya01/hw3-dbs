"use client";

import { useState, type ReactNode } from "react";
import { formatTime, minutesOf } from "@/lib/dates";
import { ChoiceChips, FieldError } from "./ChoiceChips";
import { describedBy, TextInput } from "./Field";

const PRESETS = ["17:00", "18:00", "19:00", "20:00", "21:00"];
type Choice = string; // one of PRESETS, or "other"

const options = [...PRESETS.map((t) => ({ value: t, label: formatTime(t) })), { value: "other", label: "Other time" }];

/** Before 4 PM is earlier than most people finish their day, so it gets a one-time check. */
const EARLY_CUTOFF = 16 * 60;

/**
 * State and rules for "when are you usually done for the day?", shared by onboarding and the header editor.
 * `button` is the label of the submit button, so the early-time warning names the right one.
 */
export function useWrapUpTime(saved: string | null, button: string) {
  const [choice, setChoice] = useState<Choice | null>(saved ? (PRESETS.includes(saved) ? saved : "other") : null);
  const [other, setOther] = useState(saved && !PRESETS.includes(saved) ? saved : "");
  const [error, setError] = useState<string>();
  const [warning, setWarning] = useState<string>();
  const [confirmedEarly, setConfirmedEarly] = useState<string>();

  /** The chosen "HH:MM", or undefined after showing an error or a one-time warning. */
  function validate(): string | undefined {
    if (!choice) return void setError("Pick the time you usually finish for the day.");
    const time = choice === "other" ? other : choice;
    if (!time) return void setError("Enter a time, like 7:00 PM.");
    if (minutesOf(time) < EARLY_CUTOFF && confirmedEarly !== time) {
      setConfirmedEarly(time);
      return void setWarning(`${formatTime(time)} seems too early. Press ${button} again to confirm.`);
    }
    return time;
  }

  function clearMessages() {
    setError(undefined);
    setWarning(undefined);
  }

  return {
    choice,
    other,
    error,
    warning,
    validate,
    choose(c: Choice) {
      setChoice(c);
      clearMessages();
    },
    typeOther(t: string) {
      setOther(t);
      clearMessages();
    },
  };
}

export function WrapUpTimeField({
  id,
  legend,
  hint,
  state,
}: {
  id: string;
  legend: ReactNode;
  hint?: ReactNode;
  state: ReturnType<typeof useWrapUpTime>;
}) {
  return (
    <fieldset className="flex flex-col gap-1.5" aria-describedby={describedBy(id, { error: state.error, hint })}>
      <legend className="mb-1.5 font-medium text-ink">{legend}</legend>
      {hint && (
        <p id={`${id}-hint`} className="mb-1 text-sm text-muted">
          {hint}
        </p>
      )}
      <ChoiceChips name={id} options={options} value={state.choice} onChange={state.choose} />
      {state.choice === "other" && (
        <div className="mt-2 flex flex-col gap-1.5">
          <label htmlFor={`${id}-time`} className="text-sm font-medium text-ink">
            Your time
          </label>
          <TextInput
            id={`${id}-time`}
            type="time"
            value={state.other}
            invalid={!!state.error}
            aria-describedby={describedBy(id, { error: state.error })}
            onChange={(e) => state.typeOther(e.target.value)}
          />
        </div>
      )}
      <FieldError id={id} error={state.error} />
      {state.warning && !state.error && (
        <p role="status" className="rounded-lg bg-warn-soft px-3 py-2 text-sm text-warn">
          {state.warning}
        </p>
      )}
    </fieldset>
  );
}
