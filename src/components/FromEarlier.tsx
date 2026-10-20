"use client";

import { ageLabel } from "@/lib/dates";
import type { Task } from "@/lib/store";
import { Button } from "./Button";
import { ConfirmButton } from "./ConfirmButton";
import { TaskActions } from "./TaskActions";
import { Section } from "./Page";
import { TaskList, TaskRow } from "./TaskRow";
import { useTaskActions } from "./useTaskActions";

/** Step 5: unfinished tasks from past days pile up here until you act on each one. */
export function FromEarlier({ tasks, today }: { tasks: Task[]; today: string }) {
  const actions = useTaskActions();

  return (
    <Section
      title={`From earlier · ${tasks.length}`}
      actions={
        <>
          <Button variant="ghost" size="sm" onClick={() => actions.move(tasks, today, "Today")}>
            Move all to today
          </Button>
          {tasks.length === 1 ? null : (
            <ConfirmButton
              size="sm"
              question={`Delete all ${tasks.length}?`}
              confirmLabel="Yes, delete"
              onConfirm={() => actions.letGo(tasks)}
            >
              Clear all
            </ConfirmButton>
          )}
        </>
      }
    >
      <TaskList label="From earlier">
        {tasks.map((task) => (
          <TaskRow
            key={task.id}
            task={task}
            meta={ageLabel(task.date, today)}
            actions={
              <TaskActions
                task={task}
                today={today}
                before={
                  <Button variant="ghost" size="sm" onClick={() => actions.move([task], today, "Today")}>
                    Move to today
                  </Button>
                }
                after={
                  <Button variant="danger" size="sm" onClick={() => actions.letGo([task])}>
                    Let it go
                  </Button>
                }
              />
            }
          />
        ))}
      </TaskList>
    </Section>
  );
}
