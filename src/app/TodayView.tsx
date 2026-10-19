"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { ButtonLink } from "@/components/Button";
import { DayTasks } from "@/components/DayTasks";
import { FirstHint } from "@/components/FirstHint";
import { FromEarlier } from "@/components/FromEarlier";
import { EmptyState, ListSkeleton, PageHeader, Section } from "@/components/Page";
import { QuickAdd } from "@/components/QuickAdd";
import { WrapUpCard } from "@/components/WrapUpCard";
import { useClock } from "@/lib/clock";
import { addDays, formatDay, formatTime, minutesOf } from "@/lib/dates";
import { doneOn, fromEarlier, isNewUser, tasksOn, useStore, wrapUpTime } from "@/lib/store";

/** The home page: today's list, quick-add, what's carried over, and the evening wrap-up. */
export function TodayView() {
  const store = useStore();
  const clock = useClock();
  const router = useRouter();
  const isNew = !!store && isNewUser(store.data);

  // Someone with nothing saved starts with the welcome flow, not an empty list.
  useEffect(() => {
    if (isNew) router.replace("/welcome");
  }, [isNew, router]);

  if (!store || !clock || isNew) return <ListSkeleton />;

  const { data, lastAddedId } = store;
  const { today } = clock;
  const earlier = fromEarlier(data, today);
  const todays = tasksOn(data, today);
  const openToday = todays.filter((t) => !t.done);
  const wrapTime = wrapUpTime(data);
  const pastWrapUp = clock.minutes >= minutesOf(wrapTime);
  const leftovers = [...earlier, ...openToday];
  const doneToday = doneOn(data, today);

  // Right after onboarding, the first-task hint comes first; the wrap-up card can wait until it is dismissed.
  const showWrapUp =
    pastWrapUp && leftovers.length > 0 && data.wrapUpDismissedOn !== today && !data.showFirstHint;
  const wrapped = pastWrapUp && leftovers.length === 0 && doneToday > 0;

  return (
    <>
      <PageHeader
        title={`Today · ${formatDay(today)}`}
        subtitle={
          wrapped
            ? `Day wrapped. ${doneToday} done today.`
            : `Wrap-up at ${formatTime(wrapTime)}${doneToday ? ` · ${doneToday} done today` : ""}`
        }
      />

      <FirstHint data={data} />

      {showWrapUp && <WrapUpCard leftovers={leftovers} today={today} />}

      <QuickAdd today={today} tasks={data.tasks} />

      {earlier.length > 0 && <FromEarlier tasks={earlier} today={today} />}

      <Section title="Today">
        {todays.length > 0 && openToday.length === 0 && (
          <EmptyState title="All clear for today.">
            <ButtonLink href={`/add?date=${addDays(today, 1)}`}>Plan tomorrow</ButtonLink>
            <ButtonLink variant="secondary" href="/upcoming">
              See upcoming
            </ButtonLink>
          </EmptyState>
        )}
        {todays.length > 0 && (
          <DayTasks tasks={todays} day={today} today={today} highlightId={lastAddedId} label="Today's tasks" />
        )}
        {todays.length === 0 && earlier.length === 0 && (
          <EmptyState title="Nothing on today's list yet.">
            <p className="w-full">Add a task above, or plan ahead.</p>
            <ButtonLink variant="secondary" href="/add">
              Plan another day
            </ButtonLink>
          </EmptyState>
        )}
        {todays.length === 0 && earlier.length > 0 && (
          <p className="text-sm text-muted">Nothing new for today yet. Move something up from earlier, or add one above.</p>
        )}
      </Section>
    </>
  );
}
