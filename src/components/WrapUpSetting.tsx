"use client";

import { useRef, useState } from "react";
import { formatTime } from "@/lib/dates";
import { setWrapUpTime, wrapUpTime, type Data } from "@/lib/store";
import { Button } from "./Button";
import { useToast } from "./Toast";
import { useWrapUpTime, WrapUpTimeField } from "./WrapUpTimeField";

/** "Wrap-up at 6 PM every day · Edit" at the top of Today. One time for all days, not per day. */
export function WrapUpSetting({ data }: { data: Data }) {
  const [open, setOpen] = useState(false);
  const editButton = useRef<HTMLButtonElement>(null);
  const current = wrapUpTime(data);

  if (!open) {
    return (
      <div className="flex items-center gap-1 text-sm text-muted">
        <span>Wrap-up at {formatTime(current)} every day</span>
        <Button ref={editButton} variant="ghost" size="sm" aria-label="Edit wrap-up time" onClick={() => setOpen(true)}>
          Edit
        </Button>
      </div>
    );
  }
  return (
    <Editor
      current={current}
      onClose={() => {
        setOpen(false);
        requestAnimationFrame(() => editButton.current?.focus());
      }}
    />
  );
}

function Editor({ current, onClose }: { current: string; onClose: () => void }) {
  const wrapUp = useWrapUpTime(current);
  const toast = useToast();

  return (
    <form
      noValidate
      className="mt-2 flex flex-col gap-4 rounded-2xl border border-line bg-surface p-4"
      onSubmit={(e) => {
        e.preventDefault();
        const time = wrapUp.validate();
        if (!time) return;
        setWrapUpTime(time);
        toast(`Wrap-up is now ${formatTime(time)} every day`);
        onClose();
      }}
    >
      <WrapUpTimeField
        id="edit-wrap-up"
        legend="When are you usually done with tasks for the day?"
        hint="This applies to every day, not just today. The Wrap up your day card shows up at this time."
        state={wrapUp}
      />
      <div className="flex flex-col gap-2 sm:flex-row">
        <Button type="submit">Save</Button>
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
