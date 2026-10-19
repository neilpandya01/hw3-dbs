"use client";

import { useRef, useState, type ReactNode } from "react";
import { dayName, todayKey } from "@/lib/dates";
import { toggleTask, type Task } from "@/lib/store";
import { Button } from "./Button";
import { TaskEditor } from "./TaskEditor";
import { useToast } from "./Toast";

/** Where an un-checked task shows up again, so the person isn't left wondering. */
function reopenedMessage(task: Task): string {
  const today = todayKey();
  if (task.date < today) return `"${task.title}" is not done. It's back under From earlier on Today.`;
  if (task.date === today) return `"${task.title}" is not done. It's back on Today.`;
  return `"${task.title}" is not done. It's back on ${dayName(task.date, today)}.`;
}

/** One task: a square checkbox labeled by the task name, an Edit button, plus optional meta and actions. */
export function TaskRow({
  task,
  meta,
  actions,
  highlight,
}: {
  task: Task;
  meta?: ReactNode;
  actions?: ReactNode;
  highlight?: boolean;
}) {
  const toast = useToast();
  const [editing, setEditing] = useState(false);
  const editButton = useRef<HTMLButtonElement>(null);
  const id = `task-${task.id}`;

  if (editing) {
    return (
      <li className="rounded-xl border border-accent bg-surface px-3 py-3">
        <TaskEditor
          task={task}
          onClose={() => {
            setEditing(false);
            requestAnimationFrame(() => editButton.current?.focus());
          }}
        />
      </li>
    );
  }

  return (
    <li
      className={`flex flex-col gap-2 rounded-xl border border-line px-3 py-2.5 ${highlight ? "bg-highlight" : "bg-surface"}`}
    >
      <div className="flex items-start gap-3">
        <input
          id={id}
          type="checkbox"
          checked={task.done}
          onChange={() => {
            const undo = toggleTask(task.id);
            toast(task.done ? reopenedMessage(task) : `Done: "${task.title}"`, undo);
          }}
          className="mt-0.5 size-5 shrink-0 cursor-pointer accent-[var(--accent)]"
        />
        <div className="flex min-w-0 flex-1 flex-col">
          <label
            htmlFor={id}
            className={`cursor-pointer break-words text-base ${task.done ? "text-muted line-through" : "text-ink"}`}
          >
            {task.title}
          </label>
          {meta && <span className="text-sm text-muted">{meta}</span>}
        </div>
        <Button
          ref={editButton}
          variant="ghost"
          size="sm"
          className="-my-1 shrink-0"
          aria-label={`Edit "${task.title}"`}
          onClick={() => setEditing(true)}
        >
          Edit
        </Button>
      </div>
      {actions && <div className="flex flex-wrap gap-1 pl-8">{actions}</div>}
    </li>
  );
}

export function TaskList({ children, label }: { children: ReactNode; label: string }) {
  return (
    <ul aria-label={label} className="flex flex-col gap-2">
      {children}
    </ul>
  );
}
