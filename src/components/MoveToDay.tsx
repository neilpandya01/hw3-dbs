"use client";

import { useId, useState } from "react";
import { dayName, formatDay } from "@/lib/dates";
import { moveTasks, type Task } from "@/lib/store";
import { farFutureWarning } from "@/lib/validate";
import { Button } from "./Button";
import { FieldError } from "./ChoiceChips";
import { describedBy, TextInput } from "./Field";
import { useToast } from "./Toast";

/** "Pick a day" for one task: opens an inline date field with its own error. Escape cancels. */
export function MoveToDay({ task, today }: { task: Task; today: string }) {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState("");
  const [error, setError] = useState<string>();
  const [warning, setWarning] = useState<string>();
  const [confirmedFar, setConfirmedFar] = useState<string>();
  const toast = useToast();
  const id = useId();

  if (!open) {
    return (
      <Button variant="ghost" size="sm" onClick={() => setOpen(true)}>
        Pick a day
      </Button>
    );
  }

  function close() {
    setOpen(false);
    setDate("");
    setError(undefined);
    setWarning(undefined);
  }

  return (
    <form
      noValidate
      className="flex w-full flex-col gap-1.5"
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          e.preventDefault();
          close();
        }
      }}
      onSubmit={(e) => {
        e.preventDefault();
        if (!date) return setError("Pick a day for this task.");
        if (date < today) return setError("Pick today or a later day.");
        if (date === task.date) return setError(`It's already on ${formatDay(date)}. Pick a different day.`);
        const far = farFutureWarning(date, today);
        if (far && confirmedFar !== date) {
          setConfirmedFar(date);
          return setWarning(far);
        }
        const undo = moveTasks([task.id], date);
        toast(`Moved "${task.title}" to ${dayName(date, today)}`, undo);
      }}
    >
      <label htmlFor={id} className="text-sm font-medium text-ink">
        Move &ldquo;{task.title}&rdquo; to
      </label>
      <div className="flex flex-wrap gap-2">
        <TextInput
          id={id}
          type="date"
          min={today}
          value={date}
          autoFocus
          className="min-w-40 flex-1"
          invalid={!!error}
          aria-describedby={describedBy(id, { error })}
          onChange={(e) => {
            setDate(e.target.value);
            setError(undefined);
            setWarning(undefined);
          }}
        />
        <Button type="submit" size="md">
          Move
        </Button>
        <Button variant="secondary" onClick={close}>
          Cancel
        </Button>
      </div>
      <FieldError id={id} error={error} />
      {warning && !error && (
        <p role="status" className="rounded-lg bg-warn-soft px-3 py-2 text-sm text-warn">
          {warning}
        </p>
      )}
    </form>
  );
}
