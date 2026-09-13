"use client";

import { useEffect, useState } from "react";
import { AD_UNLOCK_CLICKS, AD_CLICK_MULT, AD_IDLE_MULT } from "@/lib/content";
import { adCooldownLeft, canWatchAd, placementFor } from "@/lib/ads";
import { adBoostActive } from "@/lib/engine";
import type { GameSnapshot } from "@/lib/types";

type AdBoostBarProps = {
  state: GameSnapshot;
  onWatch: () => void;
};

function formatRemain(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function AdBoostBar({ state, onWatch }: AdBoostBarProps) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 500);
    return () => window.clearInterval(id);
  }, []);

  const boosted = adBoostActive(state, now);
  const remainBoost = Math.max(0, (state.boostUntil ?? 0) - now);
  const cool = adCooldownLeft(state, now);
  const ready = canWatchAd(state, now);
  const placement = placementFor(state);

  if ((state.clicks ?? 0) < AD_UNLOCK_CLICKS && !boosted) return null;

  if (boosted) {
    return (
      <div className="mx-auto mt-3 w-full max-w-[340px] rounded-xl border border-lime-300/50 bg-lime-300 px-3 py-2 text-center text-black">
        <p className="font-display text-lg leading-none">
          BOOST {formatRemain(remainBoost)}
        </p>
        <p className="mt-0.5 text-[11px] font-semibold tracking-wide">
          {AD_IDLE_MULT}× minden · {AD_CLICK_MULT}× kattintás
        </p>
      </div>
    );
  }

  if (ready) {
    return (
      <button
        type="button"
        onClick={onWatch}
        className="mx-auto mt-3 flex w-full max-w-[340px] flex-col rounded-xl border border-fuchsia-400/40 bg-fuchsia-500/15 px-3 py-2 text-left"
      >
        <span className="text-[10px] font-semibold tracking-[0.2em] text-fuchsia-300 uppercase">
          {placement.cta}
        </span>
        <span className="font-display text-lg leading-tight text-white">{placement.headline}</span>
        <span className="text-xs text-white/60">{placement.body}</span>
      </button>
    );
  }

  if (cool > 0) {
    return (
      <p className="mx-auto mt-3 max-w-[340px] text-center text-[11px] text-white/35">
        Következő reklám {formatRemain(cool)}
      </p>
    );
  }

  return null;
}
