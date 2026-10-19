"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";

type ToastMessage = { id: number; text: string; undo?: () => void };

const ToastContext = createContext<(text: string, undo?: () => void) => void>(() => {});

/** Show a short confirmation, optionally with Undo: `const toast = useToast(); toast("Added", undo)` */
export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const show = useCallback((text: string, undo?: () => void) => {
    setToast({ id: Date.now(), text, undo });
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 5000);
    return () => clearTimeout(timer);
  }, [toast]);

  return (
    <ToastContext.Provider value={show}>
      {children}
      <div role="status" aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-4 z-20 flex justify-center px-4">
        {toast && (
          <div
            key={toast.id}
            className="pointer-events-auto flex max-w-md items-center gap-3 rounded-xl bg-ink px-4 py-3 text-sm text-bg shadow-lg"
          >
            <span>{toast.text}</span>
            {toast.undo && (
              <button
                type="button"
                className="min-h-8 rounded-md px-2 font-semibold underline underline-offset-2"
                onClick={() => {
                  toast.undo?.();
                  setToast({ id: Date.now(), text: "Undone." });
                }}
              >
                Undo
              </button>
            )}
          </div>
        )}
      </div>
    </ToastContext.Provider>
  );
}
