# hw3-dbs: A Day-by-Day To-Do List

A personal to-do list where every task belongs to a day. Add a task for any day, then check it off. At a wrap-up time you choose, decide what to do with whatever's left. Anything you don't deal with carries forward, so nothing gets lost.

Built for Design, Build, Ship (MPCS 51238), Assignment 3: Patterns & Flows.

**Stack:** Next.js and Tailwind CSS. Data is saved in the browser with localStorage, with no database, accounts, or outside services. Deployed on Vercel's Hobby plan.

---

## Flows

### Main task

> **I jot a task for a certain day → it's on that day's list → I check it off → at my wrap-up time, I keep or push what's left; if I don't, it carries into tomorrow under "From earlier."**

```mermaid
flowchart LR
  A["Jot a task + pick a day (/add or quick-add)"] -->|error next to field, input kept| A
  A -->|valid| B["It's on that day's list (highlighted)"]
  B --> C["Check it off (strikethrough; uncheck to undo)"]
  C --> D{Past my wrap-up time and tasks left?}
  D -- No, all done --> E[All clear: plan tomorrow]
  D -- Yes --> F[Wrap up your day card]
  F -- Keep for tomorrow / Pick a day / Let it go --> G([Day wrapped])
  F -- Not now / ignored --> H["Next day: 'From earlier · N' above today's tasks"]
  H -- Move to today / Pick a day / Check off / Let it go --> B
```

### First visit

Someone with nothing saved is sent to `/welcome`. It takes two short steps, and both can be skipped:

1. **What Dayplan is, plus one question.** The page says *"Plan your tasks day by day,"* explains how it works in three numbered lines, and notes that everything is saved on this device. Then it asks: **"When are you usually done with tasks for the day?"** That answer sets the nightly wrap-up time.
2. **Add your first task by example.** Tap an example such as *+ Do laundry* or type your own. Put it on **Today**, or, if there's nothing for today, on **Tomorrow** or another day.

The app name and navigation bar stay hidden until onboarding is finished. You then land on Today, or At a Glance for a later day, with your new task highlighted light yellow, plus a one-time hint about checking it off and the wrap-up. There's no tour and no empty screen.

```mermaid
flowchart LR
  A([Nothing saved]) --> B["What Dayplan is + when are you done for the day?"]
  B --> C["Add your first task (tap an example), for today or another day"]
  C --> D["That day's list + one-time hint"]
  B -. skip .-> E[Today]
  C -. later .-> E
```

**What I took from the onboarding research** (Sunsama, Tweek, Todoist):
- **From Tweek:** open onto something useful right away, with no account, and teach by doing.
- **From Sunsama:** ask when you finish your day, because that time drives the evening wrap-up.
- **From Todoist:** example tasks that show what to type.
- **Avoided:** Sunsama's long required setup wizard and Todoist's survey about role and industry.

### Main task steps

Each arrow in the sentence is a step, and each step has its own page (route) with shared navigation: **Today · At a Glance · Calendar · Done**, plus a **+ Add task** button.

| # | Step | Page |
|---|---|---|
| 1 | Jot a task for a day | `/add` (or quick-add on `/`) |
| 2 | It's on that day's list, highlighted light yellow for a few seconds and scrolled into view | `/` for today, `/glance` for any later day |
| 3 | Check it off | the same list |
| 4 | Wrap up: keep for tomorrow, pick a day, or let it go | `/` after your wrap-up time |
| 5 | Otherwise, carry forward into **From earlier · N** | `/` the next day |

### What I kept from planning with the agent

I worked out this flow with my agent in plan mode. Along the way I made these choices:

- **Every task belongs to a day,** not just "today" or "someday." I can plan Thursday's dentist call on Monday.
- **A nightly check-in at a time I choose.** This is the reason to come back each evening.
- **Leftovers pile up instead of disappearing.** If I skip the wrap-up, unfinished tasks show up in a separate "From earlier" section, and they stay there until I deal with them.
- **A warning when a task is too similar to one already on that day** (e.g. "Calll mom" when "Call Mom" exists). It's a soft warning: pressing Add again keeps both.
- **A message at the bottom only when a change is hard to reverse.** Moving or deleting a task shows Undo. Adding, checking off, and renaming happen right in front of you, and you can reverse them in place, so they get no message.
- **Not included, to keep it simple:** projects, tags, priorities, and recurring tasks.

The full list of steps, states, and errors is in [flows.md](flows.md).

---

## Pages

After onboarding, every page shares the same header. It has three bands, with no more than two things in each:

- **Top strip:** *☾ Your day wraps up at 6 PM · Change*, centered on a light tint. There's one wrap-up time for all days, so it sits above everything as an app-level detail. **Change** opens a *Daily wrap-up time* panel. The strip scrolls away with the page.
- **Main bar (pinned):** **Dayplan** on the left, **+ Add task** on the right.
- **Tabs (pinned):** **Today · At a Glance · Calendar · Done**, with the current one underlined. The tab you're on is marked, and the app name always links back to Today.

| Page | Route | What's on it |
|---|---|---|
| Welcome | `/welcome` | The first visit: what Dayplan is, your wrap-up time, and your first task |
| Today | `/` | Quick-add for today, the Wrap up your day card (after your wrap-up time), **From earlier**, and today's list |
| Add a task | `/add` | The form: **Task** and **Day** (Today, Tomorrow, or Pick a day), with errors next to each field. `/add?date=2026-10-23` pre-fills the day. |
| Calendar | `/calendar` | A compact month grid, from this month forward, with ‹ › arrows and a **Today** button. The selected day is a dark circle, today has a ring, and days with open tasks have a dot. The selected day's tasks sit below under a large heading, since they're the main content. Pick a day to see its tasks below and add more. Clicking a day heading on At a Glance opens that month with the day selected (`/calendar?day=2026-11-04`). Old `/day/...` links redirect here. |
| At a Glance | `/glance` | Every unfinished task in one place, grouped by day: **From earlier**, **Today**, **Tomorrow**, then each later day. Drag a task by its ⠿ handle to reorder it within a day or drop it on another day. With the keyboard, focus the handle and press ↑ ↓; at the edge of a day it crosses into the next one. Each day has **+ Add task to Tomorrow** (and so on) under its list. It opens a field right there, with Tab to complete. The new task goes to the end of that day, highlighted, without leaving the page. The field closes once the task is added; **Cancel** or Esc closes it without adding. Day headings open that day in the Calendar. Old `/upcoming` links redirect here. |
| Done | `/done` | Finished tasks grouped by the day you finished them, plus **Clear finished tasks** |

Every task has an **Edit** button for fixing mistakes: rename it, move it to another day, or delete it. Moves and deletes can be undone from the message at the bottom. The full list of mistakes the app catches is in the human-error audit in [flows.md](flows.md#human-error-audit).

Shared components live in [`src/components`](src/components): `Button`, `Field` and `TextInput` (a label, the input, then its error), `ChoiceChips`, `DayPicker`, `WrapUpTimeField` (used in onboarding and the header editor), `TaskRow`, `Toast` (Undo, for moves and deletes only), `FirstHint`, `TaskEditor`, `ConfirmButton` (asks before bulk deletes), `Nav`, and `EmptyState`.

**Tab to complete:** when you type a task in quick-add or on the Add page, Dayplan looks through every task you've ever written (past, done, or planned). After 2 letters it shows the closest match in grey after your cursor. The hint under the field says *"Press Tab to fill in 'Call Mom'."* Tab, or → at the end of the text, fills it in, and Esc hides it. When there's no match, Tab works as usual.

**Task order:** tasks in a day are listed in the order you set, never alphabetically. A new task, or one moved to another day, goes to the end of that day. Dragging the ⠿ handle, or pressing ↑ ↓ on it, is the only way to change a task's place. This works on **Today**, **At a Glance**, and the **Calendar**'s selected day. All three read the same saved order, so reordering in one place shows up everywhere immediately. While you drag, the whole card lifts and follows your pointer, and an accent line marks where it will land. Dates more than a year from today show the year, e.g. *Thu, Oct 22, 2027*.

Data is saved under one localStorage key, `todo:v1` ([`src/lib/store.ts`](src/lib/store.ts)). Days are stored as local `YYYY-MM-DD` dates ([`src/lib/dates.ts`](src/lib/dates.ts)).

## Run it locally

```bash
npm install
npm run dev
```

Then open http://localhost:3000.
