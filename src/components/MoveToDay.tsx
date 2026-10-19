"use client";

import { useId, useState } from "react";
import { formatDay } from "@/lib/dates";
import { moveTasks, type Task } from "@/lib/store";
import { Button } from "./Button";
import { describedBy, TextInput } from "./Field";
import { useToast } from "./Toast";

/** "Pick a day" for one task: opens an inline date field with its own error. */
export function MoveToDay({ task, today }: { task: Task; today: string }) {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState("");
  const [error, setError] = useState<string>();
  const toast = useToast();
  const id = useId();

  if (!open) {
    return (
      <Button variant="ghost" size="sm" onClick={() => setOpen(true)}>
        Pick a day
      </Button>
    );
  }

  return (
    <form
      className="flex w-full flex-col gap-1.5"
      onSubmit={(e) => {
        e.preventDefault();
        if (!date) return setError("Pick a day for this task.");
        if (date < today) return setError("Pick today or a later day.");
        const undo = moveTasks([task.id], date);
        toast(`Moved "${task.title}" to ${formatDay(date)}`, undo);
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
          }}
        />
        <Button type="submit" size="md">
          Move
        </Button>
        <Button variant="secondary" onClick={() => setOpen(false)}>
          Cancel
        </Button>
      </div>
      <div aria-live="polite">
        {error && (
          <p id={`${id}-error`} className="text-sm font-medium text-danger">
            <span aria-hidden="true">! </span>
            {error}
          </p>
        )}
      </div>
    </form>
  );
}
