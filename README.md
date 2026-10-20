# Dayplan

A personal to-do list where every task belongs to a day. You add tasks to today or any day ahead and check them off. Each evening, at a wrap-up time you choose, Dayplan asks what to do with anything left. Whatever you skip waits under **From earlier** the next day, so nothing gets lost.

Built for Design, Build, Ship (MPCS 51238), Assignment 3: Patterns & Flows. It's built with Next.js and Tailwind CSS, and everything is saved in the browser with localStorage, with no accounts or database.

- **Live app:** _not deployed yet, so the Vercel URL goes here_
- **More detail:** [flows.md](flows.md) has each flow's steps, states, and errors. [ACCESSIBILITY.md](ACCESSIBILITY.md) has the Step 7 check.

## Flows

### First visit

> **I open Dayplan with nothing saved → I read what it's for → I set when I'm usually done for the day → I add my first task by tapping an example, for today or another day → I land on Today (or At a Glance, for a later day), with a one-time hint on how it works.**

```mermaid
flowchart LR
  A([Nothing saved]) --> O["1 · Read the overview"]
  O -- Get started --> B["2 · When do you wrap up?"]
  B --> C["3 · Add your first task (tap an example), for today or another day"]
  C --> D["That day's list + one-time hint"]
  C -. later .-> E[Today]
```

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

### Coming back

> **I come back in the evening → at my wrap-up time Dayplan asks what to do with what's left → I keep it for tomorrow, move it, or let it go → if I skip that, tomorrow it's waiting under "From earlier."**

```mermaid
flowchart TD
  A([Come back to Dayplan]) --> B{A new day since my last visit?}
  B -- No --> C{Past my wrap-up time, with tasks left?}
  C -- No --> T[Today, exactly as I left it]
  C -- Yes --> W[Wrap up your day card]
  W -- Keep for tomorrow / Pick a day / Let it go --> X(["Day wrapped. 4 done today."])
  W -- Not now --> N[Hidden for tonight · Wrap up now brings it back]
  B -- Yes --> E{Unfinished tasks left from earlier days?}
  E -- No --> P[Today, with anything planned for today]
  E -- Yes --> F["They move onto today, under 'From earlier · N'"]
  F -- Move to today / Pick a day / Check off / Let it go --> P
```

## First-run check (Step 8)

_Not run yet._ Once the app is live on Vercel, an agent will use it as a brand-new user, with a goal like "Add three things you need this week," then come back later. Its usability feedback, and what I changed because of it, will go here.
