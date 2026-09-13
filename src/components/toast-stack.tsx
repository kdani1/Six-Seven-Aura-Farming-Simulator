"use client";

import type { Toast } from "@/lib/types";

export function ToastStack({
  toasts,
  onDismiss,
}: {
  toasts: Toast[];
  onDismiss: (id: number) => void;
}) {
  return (
    <div className="pointer-events-none fixed top-3 right-3 z-50 flex w-[min(92vw,320px)] flex-col gap-2">
      {toasts.map((toast) => (
        <button
          key={toast.id}
          type="button"
          onClick={() => onDismiss(toast.id)}
          className={`pointer-events-auto rounded-xl border px-3 py-2 text-left shadow-lg backdrop-blur-md ${
            toast.kind === "prestige"
              ? "border-fuchsia-300/40 bg-fuchsia-500/20"
              : toast.kind === "era"
                ? "border-lime-300/40 bg-lime-300/15"
                : "border-white/15 bg-black/70"
          }`}
        >
          <p className="text-[10px] font-semibold tracking-[0.22em] text-white/50 uppercase">
            {toast.kind === "achievement"
              ? "achievement"
              : toast.kind === "era"
                ? "új era"
                : toast.kind === "prestige"
                  ? "prestige"
                  : "info"}
          </p>
          <p className="font-medium text-white">{toast.title}</p>
          <p className="text-xs text-white/60">{toast.detail}</p>
        </button>
      ))}
    </div>
  );
}
