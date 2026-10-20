<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Project: Dayplan (HW3, Design Build Ship)

A day-by-day personal to-do list. Main flow: I jot a task for a certain day → it's on that day's list → I check it off → at my wrap-up time I keep or push what's left; if I don't, it rolls over to tomorrow. See `flows.md`.

## Constraints
- Next.js + Tailwind CSS only. Data lives in localStorage (`src/lib/store.ts`, key `todo:v1`). No database, backend, accounts, external APIs, or extra npm packages (no date, state, or UI libraries).
- Cache Components is on, so pages you leave are hidden with React `<Activity>`, not unmounted: their state survives. Never leave a button disabled after an action (it stays disabled on return). Reset transient UI (open editors, confirms) with a `useLayoutEffect` cleanup, and key forms that should start fresh on `useRouter().bfcacheId`.
- Also because of Cache Components: any client component that reads the URL (`usePathname`, `useParams`, `useSearchParams`) must sit inside `<Suspense>`, or the build fails.
- Days are local `YYYY-MM-DD` keys from `src/lib/dates.ts`. Never use `toISOString()` for a day.

## Conventions
- Use the shared components in `src/components` rather than one-off markup: `Button`, `Field`/`TextInput`, `ChoiceChips`, `DayPicker`, `AutocompleteInput`, `TaskRow`, `TaskEditor`, `ReorderableGroups`, `InlineAdd`, `Toast`, `ConfirmButton`, `EmptyState`, `PageHeader`.
- Unfinished tasks roll forward: `rollOver(today)` (run by `DayRollover` in the layout) moves any unfinished task dated before today onto today and sets `carriedFrom` to its first planned day. `isCarried`/`fromEarlier` find these. The Today page shows them in a separate yellow "Rolled over" group (`FromEarlier`), while At a Glance and the Calendar pin them at the top of today's list (`pinned` in `ReorderableGroups`). Any real action on a task clears `carriedFrom`: moving, dragging, re-dating, or finishing it. Past calendar days show only what was finished (by `doneAt`).
- Task order is saved per task (`order` in `src/lib/store.ts`): new and moved tasks go last in their day, never alphabetical. Any list of unfinished tasks that should be rankable uses `ReorderableGroups`, so Today, At a Glance, and Calendar stay in sync.
- Docs: `README.md` stays short: a basic explanation, the First visit and Main task flow diagrams, and the first-run check (Step 8) findings. Everything else (all three flows including Coming back, steps, states, errors, design decisions) goes in `flows.md`. Update them when behavior changes, and keep README edits made directly on GitHub (pull before editing).
- Form errors sit under their field and say what to do next ("Enter a task name."). Never clear what the person typed on an error.
- Only changes that are hard to reverse (moving or deleting tasks) show a toast with Undo. Adding, checking off, and renaming are visible and reversible in place, so they get no toast. Bulk deletes ask inline first (`ConfirmButton`).
- Colors come from the tokens in `src/app/globals.css` (light and dark). Every input has a real `<label>`.
- Check with `npm run build` and `npm run lint` before committing.
