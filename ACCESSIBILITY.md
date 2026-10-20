# Accessibility check (Step 7)

I checked this with my agent against WCAG 2.2 AA. It covers contrast, labels, and keyboard access.

## Text contrast

Ratios were calculated from the color tokens in [`globals.css`](src/app/globals.css) for every text/background pair the app uses. Normal text needs **4.5:1**. Borders of controls need **3:1**.

| Pair | Where | Light | Dark |
|---|---|---|---|
| ink on bg | body text | 15.92 | 15.48 |
| ink on surface | task names | 17.21 | 13.98 |
| muted on surface | placeholders, meta, unselected pills | 6.67 | 6.64 |
| muted on bg | secondary text | 6.17 | 7.35 |
| accent on surface | Edit, links, ghost buttons | 7.49 | 9.45 |
| accent on accent-soft | selected pill, Change | 6.31 | 7.75 |
| accent-ink on accent | primary buttons | 7.49 | 9.39 |
| bg on ink | toast, selected calendar day | 15.92 | 15.48 |
| danger on bg | error messages | 6.08 | 8.00 |
| warn on warn-soft | soft warnings, banners | 6.19 | 8.88 |
| ink on highlight | just-added task | 15.55 | 10.51 |
| control on surface | input, button, pill borders | 3.67 | 3.50 |

All 20 pairs pass in both modes, for 40 checks in total. **The fix it found:** input and button borders were 1.38:1, too faint to show where you can type. I added a `--control` border color (#8a857b light, #77736b dark) for anything you type in or press. Card borders stay light because they're decorative: every card is labeled by its text.

## Real labels

- Every text, date, and time field has a visible `<label>` tied to it: Task, Day, Date, Your time, Add a task for today, and Move "…" to.
- Every checkbox is labeled by its task name.
- Choice pills are real radio buttons inside a `<fieldset>` with a `<legend>`.
- Icon-only buttons have names: the ⠿ handle (*Reorder "Call Mom". Use up and down arrows, or drag.*), the toast's ✕, and the calendar arrows.
- Errors are linked to their field (`aria-describedby`, `aria-invalid`) and announced politely.

## Keyboard

- Everything is a real link, button, or input, so Tab reaches all of it, with one visible focus ring everywhere.
- Each mouse action has a keyboard path:
  - **Dragging:** focus ⠿ and press ↑ ↓.
  - **Choices:** arrow keys move between the radio pills.
  - **Closing:** Esc closes editors, Pick a day, the inline add, and the wrap-up editor.
  - **Tab to complete:** Tab only fills a suggestion when one is shown. Esc hides it, and Shift+Tab still leaves the field, so you can't get trapped.
- Focus moves where you'd expect: to each onboarding step's heading, and back to the button that opened an editor after it closes.
- **Fixes it found:**
  - A **Skip to main content** link is now the first Tab stop.
  - Scroll padding keeps a focused element from hiding under the pinned header or the toast.
  - The ⠿ handle grew to 24×24px, the minimum touch target size.
- Motion is reduced when the system asks for it: the yellow highlight doesn't fade, and scrolling isn't smooth.

**Not checked yet:** a pass with a real screen reader (VoiceOver or NVDA) in a browser.
