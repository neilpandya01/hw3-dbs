"use client";

import { ageLabel } from "@/lib/dates";
import type { Task } from "@/lib/store";
import { Button } from "./Button";
import { MoveToDay } from "./MoveToDay";
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
          <Button variant="ghost" size="sm" onClick={() => actions.move(tasks, today, "today")}>
            Move all to today
          </Button>
          <Button variant="danger" size="sm" onClick={() => actions.letGo(tasks)}>
            Clear all
          </Button>
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
              <>
                <Button variant="ghost" size="sm" onClick={() => actions.move([task], today, "today")}>
                  Move to today
                </Button>
                <MoveToDay task={task} today={today} />
                <Button variant="danger" size="sm" onClick={() => actions.letGo([task])}>
                  Let it go
                </Button>
              </>
            }
          />
        ))}
      </TaskList>
    </Section>
  );
}
