"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ButtonLink } from "@/components/Button";
import { DayTasks } from "@/components/DayTasks";
import { ReorderableGroups } from "@/components/ReorderableGroups";
import { EmptyState, ListSkeleton, PageHeader } from "@/components/Page";
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
      <PageHeader title="Calendar" />
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
  const arrow = "flex size-9 items-center justify-center rounded-full text-lg text-accent hover:bg-accent-soft";
  const thisMonth = monthOf(today);

  return (
    // Compact on purpose: the tasks below are the point, the grid is just for picking a day.
    <section aria-labelledby="month-title" className="w-full max-w-sm self-center rounded-2xl border border-line bg-surface px-3 py-2">
      <div className="flex items-center gap-1">
        {canGoBack ? (
          <Link href={`/calendar?month=${addMonths(month, -1)}`} scroll={false} className={arrow} aria-label={`Previous month, ${formatMonth(addMonths(month, -1))}`}>
            ‹
          </Link>
        ) : (
          <span className="size-9" aria-hidden="true" />
        )}
        <h2 id="month-title" className="flex-1 text-center text-sm font-semibold text-ink" aria-live="polite">
          {formatMonth(month)}
        </h2>
        <Link href={`/calendar?month=${addMonths(month, 1)}`} scroll={false} className={arrow} aria-label={`Next month, ${formatMonth(addMonths(month, 1))}`}>
          ›
        </Link>
        <Link
          href="/calendar"
          scroll={false}
          aria-label="Go to today"
          className={`ml-1 rounded-full border px-3 py-1 text-xs font-medium ${
            month === thisMonth && selected === today
              ? "border-line text-muted"
              : "border-accent text-accent hover:bg-accent-soft"
          }`}
        >
          Today
        </Link>
      </div>

      <div className="mt-1 grid grid-cols-7 justify-items-center gap-y-0.5 text-center">
        {WEEKDAYS.map((d) => (
          <div key={d} aria-hidden="true" className="w-9 py-1 text-[11px] font-medium text-muted">
            {d.slice(0, 2)}
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
              className={`relative flex size-9 items-center justify-center rounded-full text-sm transition-colors ${
                isSelected
                  ? "bg-ink font-semibold text-bg"
                  : `${isToday ? "font-semibold text-accent ring-1 ring-accent" : isPast ? "text-muted" : "text-ink"} hover:bg-accent-soft`
              }`}
            >
              {Number(day.slice(8))}
              {count > 0 && (
                <span
                  aria-hidden="true"
                  className={`absolute bottom-1 h-1 w-1 rounded-full ${isSelected ? "bg-bg" : "bg-accent"}`}
                />
              )}
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
  const open = tasks.filter((t) => !t.done);
  const finished = tasks.filter((t) => t.done);

  return (
    // The selected day's tasks are the main content, so they get a real heading, not a small label.
    <section aria-labelledby="selected-day" className="flex flex-col gap-3">
      <h2 id="selected-day" className="text-lg font-semibold text-ink">
        {name === formatDay(day) ? name : `${name} · ${formatDay(day)}`}
      </h2>
      {tasks.length > 0 && isPast && (
        // A past day keeps its "Move to today" buttons; ranking is for days still ahead.
        <DayTasks tasks={tasks} day={day} today={today} highlightId={highlightId} label={`Tasks for ${formatDay(day)}`} />
      )}
      {tasks.length > 0 && !isPast && (
        <>
          {/* Same saved order as Today and At a Glance, so dragging here updates them too. */}
          {open.length > 0 && (
            <ReorderableGroups
              groups={[{ key: day, title: `Tasks for ${formatDay(day)}`, droppable: true, tasks: open }]}
              today={today}
              highlightId={highlightId}
              showHeadings={false}
            />
          )}
          {finished.length > 0 && (
            <DayTasks tasks={finished} day={day} today={today} label={`Done on ${formatDay(day)}`} />
          )}
        </>
      )}
      {tasks.length === 0 && (
        <EmptyState title={isPast ? `Nothing was planned for ${formatDay(day)}.` : `Nothing planned for ${formatDay(day)}.`}>
          {!isPast && <ButtonLink href={`/add?date=${day}`}>Add a task for this day</ButtonLink>}
        </EmptyState>
      )}
      {tasks.length > 0 && !isPast && (
        <ButtonLink variant="secondary" href={`/add?date=${day}`} className="self-start">
          + Add to {formatDay(day)}
        </ButtonLink>
      )}
    </section>
  );
}
