"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ButtonLink } from "@/components/Button";
import { DayTasks } from "@/components/DayTasks";
import { FirstHint } from "@/components/FirstHint";
import { EmptyState, ListSkeleton, PageHeader } from "@/components/Page";
import { useClock } from "@/lib/clock";
import { addDays, dayHref, dayName, formatDay, isValidKey } from "@/lib/dates";
import { tasksOn, useStore } from "@/lib/store";

/** Step 2: any single day's list, with ‹ › to step between days. */
export function DayView() {
  const { date } = useParams<{ date: string }>();
  const store = useStore();
  const clock = useClock();

  if (!isValidKey(date)) {
    return (
      <EmptyState title="That's not a date we recognize.">
        <ButtonLink href="/">Back to Today</ButtonLink>
      </EmptyState>
    );
  }
  if (!store || !clock) return <ListSkeleton />;

  const { today } = clock;
  const tasks = tasksOn(store.data, date);
  const name = dayName(date, today);
  const isPast = date < today;

  return (
    <>
      <PageHeader
        title={name === formatDay(date) ? name : `${name} · ${formatDay(date)}`}
        subtitle={isPast ? "A past day. Unfinished tasks here also show under From earlier on Today." : undefined}
      >
        <nav aria-label="Days" className="mt-2 flex items-center gap-2 text-sm">
          <Link className="rounded-md px-2 py-1 text-accent hover:bg-accent-soft" href={dayHref(addDays(date, -1), today)}>
            <span aria-hidden="true">‹ </span>Previous day
          </Link>
          <Link className="rounded-md px-2 py-1 text-accent hover:bg-accent-soft" href="/">
            Back to Today
          </Link>
          <Link className="rounded-md px-2 py-1 text-accent hover:bg-accent-soft" href={dayHref(addDays(date, 1), today)}>
            Next day<span aria-hidden="true"> ›</span>
          </Link>
        </nav>
      </PageHeader>

      <FirstHint data={store.data} />

      {tasks.length > 0 ? (
        <DayTasks tasks={tasks} day={date} today={today} highlightId={store.lastAddedId} label={`Tasks for ${formatDay(date)}`} />
      ) : isPast ? (
        <EmptyState title={`Nothing was planned for ${formatDay(date)}.`}>
          <ButtonLink variant="secondary" href="/">
            Back to Today
          </ButtonLink>
        </EmptyState>
      ) : (
        <EmptyState title={`Nothing planned for ${formatDay(date)}.`}>
          <ButtonLink href={`/add?date=${date}`}>Add a task for this day</ButtonLink>
        </EmptyState>
      )}

      {tasks.length > 0 && !isPast && (
        <ButtonLink variant="secondary" href={`/add?date=${date}`} className="self-start">
          + Add to {formatDay(date)}
        </ButtonLink>
      )}
    </>
  );
}
