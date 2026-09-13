"use client";

import { ACHIEVEMENTS, ERAS, PRESTIGE_AT, TREND_NOTES } from "@/lib/content";
import { prestigeGain } from "@/lib/engine";
import { formatAura, formatInteger } from "@/lib/format";
import type { GameSnapshot } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

type LorePanelProps = {
  state: GameSnapshot;
  canPrestige: boolean;
  nextPrestige: number;
  onPrestige: () => void;
  onReset: () => void;
};

export function LorePanel({
  state,
  canPrestige,
  nextPrestige,
  onPrestige,
  onReset,
}: LorePanelProps) {
  const progress = Math.min(100, (state.lifetime / PRESTIGE_AT) * 100);
  const gain = canPrestige ? nextPrestige : prestigeGain(PRESTIGE_AT);

  return (
    <div className="flex flex-col gap-5">
      <section className="rounded-xl border border-lime-300/20 bg-lime-300/8 p-4">
        <p className="text-[11px] font-semibold tracking-[0.25em] text-lime-300 uppercase">
          Prestige
        </p>
        <h2 className="mt-1 font-display text-3xl text-white">IT&apos;S SO OVER</h2>
        <p className="mt-2 text-sm text-white/65">
          {PRESTIGE_AT.toLocaleString("hu-HU")} lifetime auránál a mém meghal. Te comebacket kapsz: +67%
          termelés stackenként. A bolt reset, a lore megmarad.
        </p>
        <Progress value={progress} className="mt-3 h-2 bg-white/10" />
        <p className="mt-1 text-xs text-white/45">
          {formatAura(state.lifetime)} / {formatAura(PRESTIGE_AT)}
        </p>
        <Button
          disabled={!canPrestige}
          onClick={onPrestige}
          className="mt-3 h-10 w-full bg-fuchsia-500 text-white hover:bg-fuchsia-400 disabled:opacity-40"
        >
          {canPrestige ? `We're so back  ·  +${gain} comeback` : "Még él a mém"}
        </Button>
        <p className="mt-2 text-xs text-white/40">
          Jelenlegi comeback: {state.comeback} · prestigek: {state.prestiges}
        </p>
      </section>

      <section>
        <h2 className="font-display text-2xl text-white">MIÉRT 6–7?</h2>
        <p className="mt-1 mb-3 text-xs text-white/50">
          2026 szeptember. Amit a klikker-tematikák közül érdemes volt meglovagolni:
        </p>
        <ul className="flex flex-col gap-2">
          {TREND_NOTES.map((note) => (
            <li
              key={note.tag}
              className="rounded-xl border border-white/10 bg-white/4 px-3 py-3"
            >
              <p className="flex items-center justify-between gap-2 text-sm">
                <span className="font-medium text-white">{note.tag}</span>
                <span className="text-[11px] tracking-wide text-lime-300 uppercase">
                  {note.status}
                </span>
              </p>
              <p className="mt-1 text-xs leading-relaxed text-white/55">{note.body}</p>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="font-display text-2xl text-white">ERÁK</h2>
        <ol className="mt-3 flex flex-col gap-2">
          {ERAS.map((era) => {
            const unlocked = state.lifetime >= era.minLifetime || state.prestiges > 0 && era.minLifetime === 0;
            const reached = state.lifetime >= era.minLifetime || (state.comeback > 0 && era.id === "back");
            return (
              <li
                key={era.id}
                className={`rounded-xl border px-3 py-3 ${reached ? "border-white/15 bg-white/5" : "border-white/5 bg-transparent text-white/30"}`}
              >
                <p className="text-[11px] tracking-widest uppercase">{era.year}</p>
                <p className="font-medium">{unlocked || reached ? era.name : "???"}</p>
                <p className="text-xs text-white/50">
                  {reached ? era.blurb : "Még nincs meg a lifetime."}
                </p>
              </li>
            );
          })}
        </ol>
      </section>

      <section>
        <h2 className="font-display text-2xl text-white">TROFEÁK</h2>
        <ul className="mt-3 grid grid-cols-1 gap-2">
          {ACHIEVEMENTS.map((a) => {
            const got = state.achievements.includes(a.id);
            return (
              <li
                key={a.id}
                className={`rounded-xl border px-3 py-3 ${got ? "border-lime-300/30 bg-lime-300/10" : "border-white/8 bg-white/3 opacity-50"}`}
              >
                <p className="text-sm font-medium text-white">{got ? a.name : "???"}</p>
                <p className="text-xs text-white/55">{got ? a.blurb : "Még locked."}</p>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="rounded-xl border border-white/10 p-4 text-xs text-white/45">
        <p>
          Kattintások: {formatInteger(state.clicks)} · lifetime ebben a runban:{" "}
          {formatAura(state.lifetime)}
        </p>
        <Button
          variant="ghost"
          size="sm"
          className="mt-2 text-white/50 hover:text-white"
          onClick={onReset}
        >
          Mentés törlése
        </Button>
      </section>
    </div>
  );
}
