"use client";

import Link from "next/link";
import { ButtonLink } from "@/components/Button";
import { DayTasks } from "@/components/DayTasks";
import { FirstHint } from "@/components/FirstHint";
import { EmptyState, ListSkeleton, PageHeader } from "@/components/Page";
import { useClock } from "@/lib/clock";
import { addDays, dayName, formatDay } from "@/lib/dates";
import { sortForList, useStore, type Task } from "@/lib/store";

/** Everything planned after today, grouped by day. */
export function UpcomingView() {
  const store = useStore();
  const clock = useClock();
  if (!store || !clock) return <ListSkeleton />;

  const { today } = clock;
  const byDay = new Map<string, Task[]>();
  for (const task of store.data.tasks) {
    if (task.date > today) byDay.set(task.date, [...(byDay.get(task.date) ?? []), task]);
  }
  const days = [...byDay.keys()].sort();

  return (
    <>
      <PageHeader title="Upcoming" subtitle="Tasks planned after today." />
      <FirstHint data={store.data} />
      {days.length === 0 ? (
        <EmptyState title="Nothing planned yet.">
          <ButtonLink href={`/add?date=${addDays(today, 1)}`}>Add something for tomorrow</ButtonLink>
        </EmptyState>
      ) : (
        days.map((day) => {
          const name = dayName(day, today);
          return (
            <section key={day} className="flex flex-col gap-3">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
                <Link href={`/calendar?day=${day}`} className="hover:text-ink hover:underline">
                  {name === formatDay(day) ? name : `${name} · ${formatDay(day)}`}
                </Link>
              </h2>
              <DayTasks
                tasks={sortForList(byDay.get(day)!)}
                day={day}
                today={today}
                highlightId={store.lastAddedId}
                label={`Tasks for ${formatDay(day)}`}
              />
            </section>
          );
        })
      )}
    </>
  );
}
