"use client";

import { useState } from "react";
import { formatDay } from "@/lib/dates";
import { addTask, type Task } from "@/lib/store";
import { similarWarning, validateTask, type TaskErrors } from "@/lib/validate";
import { useToast } from "./Toast";

/**
 * The add-a-task rules shared by quick-add and the /add form:
 * hard errors block; a "too similar" warning blocks once, and the second submit adds it.
 * What the person typed is never cleared on an error.
 */
export function useTaskDraft() {
  const [title, setTitle] = useState("");
  const [errors, setErrors] = useState<TaskErrors>({});
  const [warning, setWarning] = useState<{ message: string; match: Task }>();
  const [acknowledged, setAcknowledged] = useState<string>();
  const toast = useToast();

  function changeTitle(value: string) {
    setTitle(value);
    if (errors.title) setErrors((e) => ({ ...e, title: undefined }));
    setWarning(undefined);
  }

  /** Returns the new task's id when it was added, otherwise the errors to focus. */
  function submit(date: string, today: string, tasks: Task[]): { id?: string; errors: TaskErrors } {
    const found = validateTask(title, date, today);
    setErrors(found);
    if (found.title || found.date) return { errors: found };

    const similar = similarWarning(title, date, tasks);
    const key = `${title.trim()}|${date}`;
    if (similar && acknowledged !== key) {
      setWarning(similar);
      setAcknowledged(key);
      return { errors: {} };
    }

    const { id, undo } = addTask(title, date);
    toast(`Added "${title.trim()}" to ${date === today ? "Today" : formatDay(date)}`, undo);
    setTitle("");
    setWarning(undefined);
    setAcknowledged(undefined);
    return { id, errors: {} };
  }

  return { title, changeTitle, errors, setErrors, warning, submit };
}
