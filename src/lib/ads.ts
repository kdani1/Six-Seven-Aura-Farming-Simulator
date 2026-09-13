import {
  AD_COOLDOWN_MS,
  AD_UNLOCK_CLICKS,
} from "@/lib/content";
import { adBoostActive, currentEra } from "@/lib/engine";
import type { GameSnapshot } from "@/lib/types";

export type AdPlacement = {
  id: string;
  headline: string;
  body: string;
  cta: string;
  sponsor: string;
};

const PLACEMENTS: Record<string, AdPlacement> = {
  drill: {
    id: "hallway",
    headline: "Folyosói szünet",
    body: "A szünet 1 perc. 5× aura, 10× koppintás.",
    cta: "Reklám · 1 perc boost",
    sponsor: "Hallway Cola",
  },
  ball: {
    id: "lamelo",
    headline: "6′7 brand deal",
    body: "LaMelo magassága eladó. 10× katt, 5× farm.",
    cta: "Reklám · 6′7 boost",
    sponsor: "Ball Sports",
  },
  kidEra: {
    id: "kid",
    headline: "67 Kid merch",
    body: "A gesztus most fizet. 1 perc 5× / 10×.",
    cta: "Reklám · kid boost",
    sponsor: "67 Kid",
  },
  schoolEra: {
    id: "ban",
    headline: "Tiltott reklám",
    body: "A tanár nem látja. 5× termelés, 10× kopp.",
    cta: "Reklám · cheat perc",
    sponsor: "StudyBoost",
  },
  dead: {
    id: "over",
    headline: "It's so sponsored",
    body: "A mém halott. A hirdető nem. 5× / 10×.",
    cta: "Reklám · over boost",
    sponsor: "Comeback Inc",
  },
  back: {
    id: "back",
    headline: "We're so back",
    body: "Prestige-hirdetés. 1 perc 5× aura, 10× klikk.",
    cta: "Reklám · so back",
    sponsor: "So Back",
  },
};

export function adCooldownLeft(state: GameSnapshot, now = Date.now()): number {
  return Math.max(0, (state.lastAdAt ?? 0) + AD_COOLDOWN_MS - now);
}

export function canWatchAd(state: GameSnapshot, now = Date.now()): boolean {
  if ((state.clicks ?? 0) < AD_UNLOCK_CLICKS) return false;
  if (adBoostActive(state, now)) return false;
  return adCooldownLeft(state, now) <= 0;
}

export function placementFor(state: GameSnapshot): AdPlacement {
  const era = currentEra(state.lifetime).id;
  return PLACEMENTS[era] ?? PLACEMENTS.drill;
}
