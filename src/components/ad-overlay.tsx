"use client";

import { useEffect, useRef, useState } from "react";
import { AD_WATCH_MS } from "@/lib/content";
import type { AdPlacement } from "@/lib/ads";

type AdOverlayProps = {
  placement: AdPlacement;
  onComplete: (watched: boolean) => void;
};

export function AdOverlay({ placement, onComplete }: AdOverlayProps) {
  const [left, setLeft] = useState(AD_WATCH_MS);
  const finished = useRef(false);

  useEffect(() => {
    const started = Date.now();
    const timer = window.setInterval(() => {
      const remain = Math.max(0, AD_WATCH_MS - (Date.now() - started));
      setLeft(remain);
      if (remain <= 0 && !finished.current) {
        finished.current = true;
        window.clearInterval(timer);
        onComplete(true);
      }
    }, 200);
    return () => window.clearInterval(timer);
  }, [onComplete]);

  const sec = Math.ceil(left / 1000);
  const pct = 1 - left / AD_WATCH_MS;

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center bg-black/88 p-4 sm:items-center">
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-white/15 bg-[#111]">
        <div className="relative h-44 bg-[linear-gradient(135deg,#1a1a12,rgba(212,255,0,0.18),rgba(255,45,149,0.2))]">
          <p className="absolute top-3 left-3 rounded bg-black/60 px-2 py-0.5 text-[10px] tracking-[0.22em] text-white/70 uppercase">
            Reklám · {sec}s
          </p>
          <p className="absolute inset-0 grid place-items-center font-display text-5xl text-white/90">
            {placement.sponsor}
          </p>
          <div className="absolute right-0 bottom-0 left-0 h-1 bg-white/10">
            <span className="block h-full bg-lime-300" style={{ width: `${pct * 100}%` }} />
          </div>
        </div>
        <div className="p-4">
          <p className="text-[11px] font-semibold tracking-[0.22em] text-lime-300 uppercase">Jutalom-reklám</p>
          <p className="mt-1 font-display text-2xl text-white">{placement.headline}</p>
          <p className="mt-1 text-sm text-white/60">{placement.body}</p>
          <p className="mt-3 text-xs text-white/35">A jutalom a videó végén jár. Bezárás = nincs boost.</p>
          <button
            type="button"
            className="mt-3 text-xs text-white/40 underline"
            onClick={() => {
              if (finished.current) return;
              finished.current = true;
              onComplete(false);
            }}
          >
            Bezárás
          </button>
        </div>
      </div>
    </div>
  );
}
