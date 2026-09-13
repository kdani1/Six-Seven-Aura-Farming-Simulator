"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GENERATORS, UPGRADES } from "@/lib/content";
import {
  generatorCost,
  isGeneratorVisible,
  isUpgradeAvailable,
  upgradeCost,
} from "@/lib/engine";
import { formatAura } from "@/lib/format";
import type { GameSnapshot } from "@/lib/types";

type ShopPanelProps = {
  state: GameSnapshot;
  buyAmount: 1 | 10 | 100;
  pulseId: string | null;
  onBuyAmount: (value: 1 | 10 | 100) => void;
  onBuyGenerator: (id: string, amount: number) => void;
  onBuyUpgrade: (id: string) => void;
};

export function ShopPanel({
  state,
  buyAmount,
  pulseId,
  onBuyAmount,
  onBuyGenerator,
  onBuyUpgrade,
}: ShopPanelProps) {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl tracking-wide text-white">TERJESZD</h2>
          <p className="text-xs text-white/50">Generátorok. A folyosótól a Vatikánig.</p>
        </div>
        <div className="flex rounded-lg border border-white/10 bg-black/30 p-0.5">
          {([1, 10, 100] as const).map((n) => (
            <Button
              key={n}
              size="xs"
              variant={buyAmount === n ? "default" : "ghost"}
              className={buyAmount === n ? "bg-lime-300 text-black hover:bg-lime-200" : "text-white/70"}
              onClick={() => onBuyAmount(n)}
            >
              ×{n}
            </Button>
          ))}
        </div>
      </div>

      <ul className="flex flex-col gap-2">
        {GENERATORS.map((gen, index) => {
          const visible = isGeneratorVisible(state, gen.id);
          const nextLocked =
            !visible &&
            GENERATORS.findIndex((item) => !isGeneratorVisible(state, item.id)) === index;
          if (!visible && !nextLocked) return null;
          if (!visible) {
            return (
              <li
                key={gen.id}
                className="rounded-xl border border-white/5 bg-white/2 px-3 py-3 text-sm text-white/30 animate-shop-in"
              >
                ??? · még nincs lore
              </li>
            );
          }
          const owned = state.generators[gen.id] ?? 0;
          const cost = generatorCost(gen.id, owned);
          const can = state.aura >= cost;
          const pulsing = pulseId === gen.id;
          return (
            <li key={gen.id} className="animate-shop-in">
              <button
                type="button"
                disabled={!can}
                onClick={() => onBuyGenerator(gen.id, buyAmount)}
                className={`flex w-full items-start gap-3 rounded-xl border bg-white/4 px-3 py-3 text-left transition duration-200 hover:bg-white/8 disabled:cursor-not-allowed disabled:opacity-40 ${
                  pulsing
                    ? "animate-purchase-flash border-lime-300"
                    : can
                      ? "animate-afford-glow"
                      : "border-white/10 hover:border-lime-300/40"
                }`}
              >
                <span
                  className={`grid size-10 shrink-0 place-items-center rounded-lg bg-black/40 text-lg ${pulsing ? "animate-badge-pop" : ""}`}
                >
                  {gen.emoji}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center justify-between gap-2">
                    <span className="font-medium text-white">{gen.name}</span>
                    <Badge
                      key={`${gen.id}-${owned}`}
                      variant="outline"
                      className={`border-white/15 text-white/70 ${pulsing ? "animate-badge-pop border-lime-300 text-lime-300" : ""}`}
                    >
                      {owned}
                    </Badge>
                  </span>
                  <span className="mt-0.5 block text-xs text-white/50">{gen.blurb}</span>
                  <span className="mt-1 block font-display text-sm text-lime-300">
                    {formatAura(cost)} aura
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      <div>
        <h2 className="font-display text-2xl tracking-wide text-white">AURA MAXXING</h2>
        <p className="mb-3 text-xs text-white/50">Fejlesztések a gesztushoz és az idle-höz.</p>
        <ul className="flex flex-col gap-2">
          {UPGRADES.map((upg) => {
            const level = state.upgrades[upg.id] ?? 0;
            const maxed = level >= upg.maxLevel;
            const available = isUpgradeAvailable(state, upg.id) || maxed;
            if (!available) {
              return (
                <li
                  key={upg.id}
                  className="rounded-xl border border-white/5 bg-white/2 px-3 py-3 text-sm text-white/30"
                >
                  {upg.name} · még locked
                </li>
              );
            }
            const cost = upgradeCost(upg.id, level);
            const can = !maxed && state.aura >= cost;
            const pulsing = pulseId === upg.id;
            return (
              <li key={upg.id} className="animate-shop-in">
                <button
                  type="button"
                  disabled={!can}
                  onClick={() => onBuyUpgrade(upg.id)}
                  className={`flex w-full items-start justify-between gap-3 rounded-xl border px-3 py-3 text-left transition duration-200 disabled:cursor-not-allowed disabled:opacity-40 ${
                    pulsing
                      ? "animate-purchase-flash border-fuchsia-300 bg-fuchsia-400/20"
                      : can
                        ? "border-fuchsia-400/50 bg-fuchsia-400/10 animate-afford-glow"
                        : "border-fuchsia-400/20 bg-fuchsia-400/5 hover:border-fuchsia-300/50"
                  }`}
                >
                  <span>
                    <span className="block font-medium text-white">{upg.name}</span>
                    <span className="mt-0.5 block text-xs text-white/50">{upg.blurb}</span>
                  </span>
                  <span className="shrink-0 text-right">
                    <span
                      key={`${upg.id}-${level}`}
                      className={`block text-[11px] text-white/40 ${pulsing ? "animate-badge-pop text-fuchsia-200" : ""}`}
                    >
                      {maxed ? "MAX" : `${level}/${upg.maxLevel}`}
                    </span>
                    <span className="font-display text-sm text-fuchsia-300">
                      {maxed ? "—" : `${formatAura(cost)}`}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
