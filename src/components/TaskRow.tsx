"use client";

import type { ReactNode } from "react";
import { toggleTask, type Task } from "@/lib/store";
import { useToast } from "./Toast";

/** One task: a square checkbox labeled by the task name, plus optional meta and actions. */
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
  const id = `task-${task.id}`;

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
            toast(task.done ? `Marked "${task.title}" not done` : `Done: "${task.title}"`, undo);
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
      </div>
      {actions && <div className="flex flex-wrap gap-1 pl-9">{actions}</div>}
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
