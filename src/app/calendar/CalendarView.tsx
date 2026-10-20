"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ButtonLink } from "@/components/Button";
import { DayTasks } from "@/components/DayTasks";
import { EmptyState, ListSkeleton, PageHeader, Section } from "@/components/Page";
import { useClock } from "@/lib/clock";
import { addMonths, dayName, formatDay, formatMonth, isValidKey, isValidMonth, monthGrid, monthOf } from "@/lib/dates";
import { tasksOn, useStore, type Data } from "@/lib/store";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/**
 * A month at a glance, from this month forward, and the tasks of the day you pick.
 *   /calendar                  → this month, today selected
 *   /calendar?month=2026-12    → December, nothing selected yet
 *   /calendar?day=2026-11-04   → November, the 4th selected
 */
export function CalendarView() {
  const params = useSearchParams();
  const store = useStore();
  const clock = useClock();
  if (!store || !clock) return <ListSkeleton />;

  const { today } = clock;
  const thisMonth = monthOf(today);
  const dayParam = params.get("day");
  const monthParam = params.get("month");

  let selected: string | null = dayParam && isValidKey(dayParam) ? dayParam : null;
  let month = selected ? monthOf(selected) : monthParam && isValidMonth(monthParam) ? monthParam : thisMonth;
  // The calendar looks forward: anything before this month opens this month instead.
  if (month < thisMonth) {
    month = thisMonth;
    selected = today;
  }
  if (!selected && month === thisMonth) selected = today;

  return (
    <>
      <PageHeader title="Calendar" subtitle="Pick a day to see or plan its tasks." />
      <MonthGrid data={store.data} month={month} today={today} selected={selected} canGoBack={month > thisMonth} />
      {selected ? (
        <SelectedDay data={store.data} day={selected} today={today} highlightId={store.lastAddedId} />
      ) : (
        <p className="text-sm text-muted">Pick a day above to see its tasks.</p>
      )}
    </>
  );
}

function MonthGrid({
  data,
  month,
  today,
  selected,
  canGoBack,
}: {
  data: Data;
  month: string;
  today: string;
  selected: string | null;
  canGoBack: boolean;
}) {
  const open = new Map<string, number>();
  for (const t of data.tasks) if (!t.done) open.set(t.date, (open.get(t.date) ?? 0) + 1);
  const arrow = "flex size-11 items-center justify-center rounded-lg text-lg text-accent hover:bg-accent-soft";

  return (
    <section aria-labelledby="month-title" className="flex flex-col gap-3 rounded-2xl border border-line bg-surface p-3">
      <div className="flex items-center justify-between">
        {canGoBack ? (
          <Link href={`/calendar?month=${addMonths(month, -1)}`} scroll={false} className={arrow} aria-label={`Previous month, ${formatMonth(addMonths(month, -1))}`}>
            ‹
          </Link>
        ) : (
          <span className="size-11" aria-hidden="true" />
        )}
        <h2 id="month-title" className="text-base font-semibold text-ink" aria-live="polite">
          {formatMonth(month)}
        </h2>
        <Link href={`/calendar?month=${addMonths(month, 1)}`} scroll={false} className={arrow} aria-label={`Next month, ${formatMonth(addMonths(month, 1))}`}>
          ›
        </Link>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center">
        {WEEKDAYS.map((d) => (
          <div key={d} aria-hidden="true" className="pb-1 text-xs font-medium text-muted">
            {d}
          </div>
        ))}
        {monthGrid(month).map((day, i) => {
          if (!day) return <div key={`pad-${i}`} aria-hidden="true" />;
          const count = open.get(day) ?? 0;
          const isToday = day === today;
          const isSelected = day === selected;
          const isPast = day < today;
          const label = `${formatDay(day)}${isToday ? ", today" : ""}, ${count === 0 ? "no tasks" : count === 1 ? "1 task" : `${count} tasks`}${isSelected ? ", selected" : ""}`;
          return (
            <Link
              key={day}
              href={`/calendar?day=${day}`}
              scroll={false}
              aria-label={label}
              aria-current={isToday ? "date" : undefined}
              className={`flex aspect-square flex-col items-center justify-center gap-0.5 rounded-lg text-sm transition-colors ${
                isSelected
                  ? "bg-accent font-semibold text-accent-ink"
                  : `${isToday ? "font-semibold ring-2 ring-accent ring-inset" : ""} ${isPast ? "text-muted" : "text-ink"} hover:bg-accent-soft`
              }`}
            >
              <span>{Number(day.slice(8))}</span>
              <span aria-hidden="true" className={`h-1.5 w-1.5 rounded-full ${count ? (isSelected ? "bg-accent-ink" : "bg-accent") : ""}`} />
            </Link>
          );
        })}
      </div>
    </section>
  );
}

function SelectedDay({ data, day, today, highlightId }: { data: Data; day: string; today: string; highlightId?: string }) {
  const tasks = tasksOn(data, day);
  const name = dayName(day, today);
  const isPast = day < today;

  return (
    <Section title={name === formatDay(day) ? name : `${name} · ${formatDay(day)}`}>
      {tasks.length > 0 ? (
        <DayTasks tasks={tasks} day={day} today={today} highlightId={highlightId} label={`Tasks for ${formatDay(day)}`} />
      ) : (
        <EmptyState title={isPast ? `Nothing was planned for ${formatDay(day)}.` : `Nothing planned for ${formatDay(day)}.`}>
          {!isPast && <ButtonLink href={`/add?date=${day}`}>Add a task for this day</ButtonLink>}
        </EmptyState>
      )}
      {tasks.length > 0 && !isPast && (
        <ButtonLink variant="secondary" href={`/add?date=${day}`} className="self-start">
          + Add to {formatDay(day)}
        </ButtonLink>
      )}
    </Section>
  );
}
