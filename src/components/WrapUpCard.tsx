"use client";

import { addDays, ageLabel } from "@/lib/dates";
import { dismissWrapUp, reopenWrapUp, type Task } from "@/lib/store";
import { Button } from "./Button";
import { MoveToDay } from "./MoveToDay";
import { useToast } from "./Toast";
import { useTaskActions } from "./useTaskActions";

/** Step 4: after the wrap-up time, decide what happens to what's left. Ignoring it is fine too. */
export function WrapUpCard({ leftovers, today }: { leftovers: Task[]; today: string }) {
  const actions = useTaskActions();
  const toast = useToast();
  const tomorrow = addDays(today, 1);

  return (
    <section aria-labelledby="wrap-up-title" className="flex flex-col gap-4 rounded-2xl border border-accent bg-accent-soft p-4">
      <div className="flex flex-col gap-1">
        <h2 id="wrap-up-title" className="text-lg font-semibold text-ink">
          Wrap up your day
        </h2>
        <p className="text-sm text-ink">
          {leftovers.length} left. What should happen to {leftovers.length === 1 ? "it" : "them"}?
        </p>
      </div>

      <ul className="flex flex-col gap-2" aria-label="Tasks left today">
        {leftovers.map((task) => (
          <li key={task.id} className="flex flex-col gap-1.5 rounded-xl bg-surface px-3 py-2.5">
            <span className="break-words text-ink">
              {task.title}
              {task.date < today && <span className="ml-2 text-sm text-muted">{ageLabel(task.date, today)}</span>}
            </span>
            <div className="flex flex-wrap gap-1">
              <Button variant="ghost" size="sm" onClick={() => actions.move([task], tomorrow, "Tomorrow")}>
                Keep for tomorrow
              </Button>
              <MoveToDay task={task} today={today} />
              <Button variant="danger" size="sm" onClick={() => actions.letGo([task])}>
                Let it go
              </Button>
            </div>
          </li>
        ))}
      </ul>

      <div className="flex flex-col gap-2 sm:flex-row">
        <Button onClick={() => actions.move(leftovers, tomorrow, "Tomorrow")}>Move all to tomorrow</Button>
        <Button
          variant="secondary"
          onClick={() => {
            dismissWrapUp(today);
            toast("Wrap-up hidden for tonight. Bring it back with Wrap up now at the top.", reopenWrapUp);
          }}
        >
          Not now
        </Button>
      </div>
    </section>
  );
}
