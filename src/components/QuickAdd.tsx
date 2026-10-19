"use client";

import { useRef } from "react";
import type { Task } from "@/lib/store";
import { Button } from "./Button";
import { describedBy, Field, TextInput } from "./Field";
import { useTaskDraft } from "./useTaskDraft";

/** Step 1, the fast path: type and press Enter to put a task on today. */
export function QuickAdd({ today, tasks }: { today: string; tasks: Task[] }) {
  const draft = useTaskDraft();
  const input = useRef<HTMLInputElement>(null);
  const id = "quick-add";
  const messages = { error: draft.errors.title, warning: draft.warning?.message };

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        draft.submit(today, today, tasks);
        input.current?.focus();
      }}
    >
      <Field id={id} label="Add a task for today" {...messages}>
        <div className="flex gap-2">
          <TextInput
            ref={input}
            id={id}
            className="min-w-0 flex-1"
            placeholder="e.g. Call the dentist"
            autoComplete="off"
            value={draft.title}
            invalid={!!draft.errors.title}
            aria-describedby={describedBy(id, messages)}
            onChange={(e) => draft.changeTitle(e.target.value)}
          />
          <Button type="submit">Add</Button>
        </div>
      </Field>
    </form>
  );
}
