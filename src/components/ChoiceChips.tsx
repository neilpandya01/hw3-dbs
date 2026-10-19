"use client";

/** A row of pill-shaped choices that are real radio buttons underneath (arrow keys work). */
export function ChoiceChips<T extends string>({
  name,
  options,
  value,
  onChange,
}: {
  name: string;
  options: { value: T; label: string }[];
  value: T | null;
  onChange: (value: T) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => (
        <label key={o.value} className="relative">
          <input
            type="radio"
            name={name}
            value={o.value}
            checked={value === o.value}
            onChange={() => onChange(o.value)}
            className="peer sr-only"
          />
          <span className="inline-flex min-h-11 cursor-pointer items-center rounded-full border border-line bg-surface px-4 text-sm font-medium text-ink peer-checked:border-accent peer-checked:bg-accent peer-checked:text-accent-ink peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent">
            {o.label}
          </span>
        </label>
      ))}
    </div>
  );
}

/** The error line used under fieldsets, matching Field's. */
export function FieldError({ id, error }: { id: string; error?: string }) {
  return (
    <div aria-live="polite">
      {error && (
        <p id={`${id}-error`} className="flex items-start gap-1.5 text-sm font-medium text-danger">
          <span aria-hidden="true">!</span>
          {error}
        </p>
      )}
    </div>
  );
}
