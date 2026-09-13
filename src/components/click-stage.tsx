"use client";

import { useEffect, useRef } from "react";
import { formatAura } from "@/lib/format";
import { BEAT_MS } from "@/lib/content";
import type { Floater, HitSide, HitTiming } from "@/lib/types";

type ClickStageProps = {
  aura: number;
  rate: number;
  combo: number;
  slam: boolean;
  shaking: boolean;
  floaters: Floater[];
  eraName: string;
  timing: HitTiming | null;
  lastSide: HitSide | null;
  ultra: boolean;
  shout: "SIX" | "SEVEN" | "SIX SEVEN" | null;
  hitNonce: number;
  boosted: boolean;
  onHit: (side: HitSide, client: { x: number; y: number; rect: DOMRect }) => void;
};

const TIMING_COPY: Record<HitTiming, string> = {
  start: "így tovább",
  perfect: "ULTRA HIT",
  good: "6–7",
  early: "túl gyors",
  late: "túl lassú",
  wrong: "másik oldal",
};

export function ClickStage({
  aura,
  rate,
  combo,
  slam,
  shaking,
  floaters,
  eraName,
  timing,
  lastSide,
  ultra,
  shout,
  hitNonce,
  boosted,
  onHit,
}: ClickStageProps) {
  const cycleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = cycleRef.current;
    if (!node) return;
    const delay = `-${Date.now() % (BEAT_MS * 2)}ms`;
    for (const el of node.querySelectorAll<HTMLElement>("[data-beat]")) {
      el.style.animationDelay = delay;
    }
  }, []);

  const onBeat = timing === "perfect" || timing === "good" || timing === "start";
  const missed = timing === "early" || timing === "late" || timing === "wrong";

  return (
    <section
      className={`relative flex min-h-[420px] flex-1 flex-col items-center justify-center px-4 py-6 sm:min-h-[520px] ${shaking ? "animate-screen-shake" : ""}`}
    >
      <p className="mb-2 text-[11px] font-semibold tracking-[0.28em] text-lime-300/80 uppercase">
        {eraName}
      </p>
      <p className={`font-display text-5xl leading-none text-white sm:text-7xl ${slam ? "animate-aura-pop" : ""}`}>
        {formatAura(aura)}
      </p>
      <p className="mt-2 text-sm text-fuchsia-200/80">
        aura · {formatAura(rate)}
        <span className="text-white/40"> / mp</span>
        {boosted ? <span className="ml-2 text-lime-300">· 5×</span> : null}
      </p>

      <div ref={cycleRef} className="relative mt-8">
        <div
          className={`relative size-[min(86vw,320px)] overflow-hidden rounded-full border border-white/15 bg-[#101014] ring-2 ${
            boosted ? "ring-lime-300/50" : "ring-lime-300/10"
          }`}
        >
          <span
            data-beat
            className="pointer-events-none absolute inset-y-3 left-3 w-[46%] rounded-l-full bg-lime-300/30 animate-side-six"
          />
          <span
            data-beat
            className="pointer-events-none absolute inset-y-3 right-3 w-[46%] rounded-r-full bg-fuchsia-400/30 animate-side-seven"
          />

          {slam && lastSide === "six" ? (
            <span key={`f6-${hitNonce}`} className="pointer-events-none absolute inset-y-0 left-0 z-20 w-1/2 rounded-l-full bg-lime-300/40 animate-hit-flash" />
          ) : null}
          {slam && lastSide === "seven" ? (
            <span key={`f7-${hitNonce}`} className="pointer-events-none absolute inset-y-0 right-0 z-20 w-1/2 rounded-r-full bg-fuchsia-400/40 animate-hit-flash" />
          ) : null}

          <button
            type="button"
            aria-label="Six"
            onPointerDown={(event) => {
              event.preventDefault();
              const rect = event.currentTarget.parentElement?.getBoundingClientRect();
              if (!rect) return;
              onHit("six", { x: event.clientX, y: event.clientY, rect });
            }}
            className="absolute inset-y-0 left-0 z-30 w-1/2 touch-manipulation rounded-l-full select-none outline-none"
          />
          <button
            type="button"
            aria-label="Seven"
            onPointerDown={(event) => {
              event.preventDefault();
              const rect = event.currentTarget.parentElement?.getBoundingClientRect();
              if (!rect) return;
              onHit("seven", { x: event.clientX, y: event.clientY, rect });
            }}
            className="absolute inset-y-0 right-0 z-30 w-1/2 touch-manipulation rounded-r-full select-none outline-none"
          />

          <div className="pointer-events-none relative z-10 flex h-full items-center justify-center gap-1">
            <span data-beat className="inline-block origin-bottom font-display text-[7rem] leading-none text-lime-300 sm:text-[8.5rem] animate-weigh-left">
              6
            </span>
            <span className="font-display text-4xl text-white/25">–</span>
            <span data-beat className="inline-block origin-bottom font-display text-[7rem] leading-none text-fuchsia-400 sm:text-[8.5rem] animate-weigh-right">
              7
            </span>
          </div>
        </div>

        <div className="pointer-events-none absolute inset-0 z-40 overflow-visible">
          {floaters.map((floater) => (
            <span
              key={floater.id}
              className={`absolute whitespace-nowrap font-display tracking-wide animate-floater ${
                floater.crit
                  ? "text-3xl text-lime-300"
                  : floater.timing === "wrong"
                    ? "text-lg text-fuchsia-300"
                    : "text-xl text-white"
              }`}
              style={{ left: `${floater.x}%`, top: `${floater.y}%` }}
            >
              {floater.text}
            </span>
          ))}
        </div>

        {shout ? (
          <div className="pointer-events-none absolute inset-0 z-50 grid place-items-center">
            <p
              key={`shout-${hitNonce}`}
              className={`font-display animate-shout-pop ${
                shout === "SIX" ? "text-5xl text-lime-300" : shout === "SEVEN" ? "text-5xl text-fuchsia-400" : "text-4xl text-white"
              }`}
            >
              {shout}
            </p>
          </div>
        ) : null}
      </div>

      <div className="mt-5 flex h-14 flex-col items-center justify-center gap-1">
        {combo > 1 ? (
          <p
            className={`rounded-full px-4 py-1 font-display text-lg ${
              missed
                ? "bg-fuchsia-500 text-white"
                : ultra
                  ? "bg-lime-300 text-black"
                  : "bg-lime-300/90 text-black"
            }`}
          >
            {ultra ? "ULTRA " : ""}COMBO {combo}
          </p>
        ) : (
          <p className="text-xs text-white/40">Világító oldal · bal 6, jobb 7</p>
        )}
        {timing ? (
          <p className={`text-[11px] font-semibold tracking-[0.2em] uppercase ${onBeat ? "text-lime-300" : missed ? "text-fuchsia-300" : "text-white/40"}`}>
            {TIMING_COPY[timing]}
          </p>
        ) : null}
      </div>
    </section>
  );
}
