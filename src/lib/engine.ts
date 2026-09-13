import {
  ACHIEVEMENTS,
  AD_BOOST_MS,
  AD_CLICK_MULT,
  AD_IDLE_MULT,
  BEAT_MS,
  ERAS,
  GENERATORS,
  GOOD_WINDOW_BASE,
  MAX_COMBO,
  PERFECT_WINDOW_BASE,
  PRESTIGE_AT,
  SIDE_GRACE_MS,
  UPGRADES,
} from "@/lib/content";
import type { AchievementDef, GameSnapshot, GameState, HitSide, HitTiming } from "@/lib/types";

export function emptyGenerators(): Record<string, number> {
  return Object.fromEntries(GENERATORS.map((g) => [g.id, 0]));
}

export function emptyUpgrades(): Record<string, number> {
  return Object.fromEntries(UPGRADES.map((u) => [u.id, 0]));
}

export function createState(now = Date.now()): GameState {
  return {
    aura: 0,
    lifetime: 0,
    clicks: 0,
    generators: emptyGenerators(),
    upgrades: emptyUpgrades(),
    achievements: [],
    prestiges: 0,
    comeback: 0,
    sound: true,
    startedAt: now,
    lastTickAt: now,
    combo: 0,
    lastClickAt: 0,
    comboExpiresAt: 0,
    lastBeatIndex: -1,
    lastHitSide: null,
    boostUntil: 0,
    lastAdAt: 0,
    adsWatched: 0,
  };
}

export function generatorCost(id: string, owned: number): number {
  const def = GENERATORS.find((g) => g.id === id);
  if (!def) return Infinity;
  return Math.floor(def.baseCost * 1.18 ** owned);
}

export function upgradeCost(id: string, level: number): number {
  const def = UPGRADES.find((u) => u.id === id);
  if (!def) return Infinity;
  return Math.floor(def.baseCost * def.costScale ** level);
}

export function beatInterval(): number {
  return BEAT_MS;
}

export function timingWindows(state: GameSnapshot): { perfect: number; good: number } {
  const level = state.upgrades.combo ?? 0;
  const half = beatInterval() / 2 - 2;
  return {
    perfect: Math.min(half - 8, PERFECT_WINDOW_BASE + level * 6),
    good: Math.min(half, GOOD_WINDOW_BASE + level * 4),
  };
}

export function critChance(state: GameSnapshot): number {
  return Math.min(0.5, 0.067 + (state.upgrades.critChance ?? 0) * 0.025);
}

export function critMultiplier(state: GameSnapshot): number {
  return 6.7 + (state.upgrades.critMulti ?? 0) * 1.5;
}

export function comebackMultiplier(state: GameSnapshot): number {
  return 1 + state.comeback * 0.35;
}

export function adBoostActive(state: GameSnapshot, now = Date.now()): boolean {
  return now < (state.boostUntil ?? 0);
}

export function idleMultiplier(state: GameSnapshot): number {
  let multi = comebackMultiplier(state);
  multi *= 1 + (state.upgrades.idle ?? 0) * 0.12;
  if ((state.upgrades.soOver ?? 0) > 0) multi *= 2;
  if (adBoostActive(state)) multi *= AD_IDLE_MULT;
  return multi;
}

export function clickBase(state: GameSnapshot): number {
  let power = 1 + (state.upgrades.click ?? 0);
  if ((state.upgrades.noMeaning ?? 0) > 0) power *= 2;
  power *= comebackMultiplier(state);
  if (adBoostActive(state)) power *= AD_CLICK_MULT;
  return power;
}

export function grantAdBoost(state: GameState, now = Date.now()) {
  state.boostUntil = now + AD_BOOST_MS;
  state.lastAdAt = now;
  state.adsWatched += 1;
}

export function productionPerSecond(state: GameSnapshot): number {
  const idle = idleMultiplier(state);
  let total = 0;
  for (const gen of GENERATORS) {
    const owned = state.generators[gen.id] ?? 0;
    let prod = gen.baseProd * owned;
    if (gen.id === "ban" && (state.upgrades.bannedViral ?? 0) > 0) prod *= 2;
    total += prod;
  }
  return total * idle;
}

export function isUpgradeAvailable(state: GameSnapshot, id: string): boolean {
  const def = UPGRADES.find((u) => u.id === id);
  if (!def) return false;
  const level = state.upgrades[id] ?? 0;
  if (level >= def.maxLevel) return false;
  const req = def.requires;
  if (!req) return true;
  if (req.lifetime && state.lifetime < req.lifetime) return false;
  if (req.generatorId && (state.generators[req.generatorId] ?? 0) < (req.owned ?? 1)) {
    return false;
  }
  return true;
}

export function isGeneratorVisible(state: GameSnapshot, id: string): boolean {
  const index = GENERATORS.findIndex((g) => g.id === id);
  if (index <= 0) return true;
  const def = GENERATORS[index];
  if (state.lifetime >= def.unlockAtLifetime) return true;
  const prev = GENERATORS[index - 1];
  return (state.generators[prev.id] ?? 0) > 0;
}

export function currentEra(lifetime: number) {
  let era = ERAS[0];
  for (const next of ERAS) {
    if (lifetime >= next.minLifetime) era = next;
  }
  return era;
}

export function prestigeGain(lifetime: number): number {
  if (lifetime < PRESTIGE_AT) return 0;
  return Math.max(1, Math.floor(Math.sqrt(lifetime / PRESTIGE_AT)));
}

export function applyIdle(state: GameState, seconds: number) {
  if (seconds <= 0) return 0;
  const gained = productionPerSecond(state) * seconds;
  state.aura += gained;
  state.lifetime += gained;
  return gained;
}

export function grantAchievements(state: GameSnapshot): AchievementDef[] {
  const unlocked: AchievementDef[] = [];
  for (const a of ACHIEVEMENTS) {
    if (state.achievements.includes(a.id)) continue;
    if (a.check(state)) {
      state.achievements.push(a.id);
      unlocked.push(a);
    }
  }
  return unlocked;
}

export function buyGenerator(state: GameState, id: string, amount: number): boolean {
  if (amount < 1) return false;
  if (!isGeneratorVisible(state, id)) return false;
  let owned = state.generators[id] ?? 0;
  let spent = 0;
  let bought = 0;
  for (let i = 0; i < amount; i++) {
    const cost = generatorCost(id, owned);
    if (state.aura < cost) break;
    state.aura -= cost;
    spent += cost;
    owned += 1;
    bought += 1;
  }
  if (bought === 0) return false;
  state.generators[id] = owned;
  void spent;
  return true;
}

export function buyUpgrade(state: GameState, id: string): boolean {
  if (!isUpgradeAvailable(state, id)) return false;
  const level = state.upgrades[id] ?? 0;
  const cost = upgradeCost(id, level);
  if (state.aura < cost) return false;
  state.aura -= cost;
  state.upgrades[id] = level + 1;
  return true;
}

export function expectedSideAt(now: number): HitSide {
  const beatIndex = Math.round(now / beatInterval());
  return beatIndex % 2 === 0 ? "six" : "seven";
}

export function sideFitsBeat(now: number, side: HitSide): boolean {
  if (side === expectedSideAt(now)) return true;
  if (side === expectedSideAt(now + SIDE_GRACE_MS)) return true;
  if (side === expectedSideAt(now - SIDE_GRACE_MS)) return true;
  return false;
}

export function performClick(
  state: GameState,
  now: number,
  side: HitSide
): {
  gained: number;
  crit: boolean;
  combo: number;
  timing: HitTiming;
  side: HitSide;
  expected: HitSide;
  ultra: boolean;
  pair: boolean;
  ignored: boolean;
} {
  const beat = beatInterval();
  const { perfect, good } = timingWindows(state);
  const beatIndex = Math.round(now / beat);
  const nearest = beatIndex * beat;
  const abs = Math.abs(now - nearest);
  const expected = expectedSideAt(now);
  const onBeat = abs <= good;
  const precise = abs <= perfect;
  const correct = sideFitsBeat(now, side);

  const empty = {
    gained: 0,
    crit: false,
    combo: state.combo,
    timing: "early" as HitTiming,
    side,
    expected,
    ultra: state.combo >= 4,
    pair: false,
    ignored: true,
  };

  if (state.lastClickAt !== 0 && beatIndex === state.lastBeatIndex && side === state.lastHitSide) {
    return empty;
  }

  let timing: HitTiming;
  let chained = false;

  if (correct && (onBeat || state.combo > 0)) {
    state.combo = Math.min(MAX_COMBO, state.combo + 1);
    timing = precise ? "perfect" : state.combo === 1 ? "start" : "good";
    chained = true;
  } else if (correct) {
    state.combo = 1;
    timing = "start";
    chained = true;
  } else {
    state.combo = Math.max(0, state.combo - 1);
    timing = "wrong";
  }

  state.lastBeatIndex = beatIndex;
  state.lastClickAt = now;
  state.lastHitSide = side;
  state.comboExpiresAt = now + beat * 3.4;

  const ultra = chained && state.combo >= 4;
  const pair = chained && side === "seven" && state.combo >= 2;
  const crit = Math.random() < critChance(state) + (chained && precise ? 0.04 : 0);

  let gained = clickBase(state);
  if (chained) {
    const growth = precise ? 1.11 : 1.06;
    gained *= growth ** Math.min(state.combo, 12);
    if (precise) gained *= 1.12;
    if (pair) gained *= 1.25;
    if (state.combo === 6 || state.combo === 7) gained *= 1.2;
    if (state.combo === 67) gained *= 2.5;
  }
  if (crit) gained *= critMultiplier(state);

  state.aura += gained;
  state.lifetime += gained;
  state.clicks += 1;
  return { gained, crit, combo: state.combo, timing, side, expected, ultra, pair, ignored: false };
}

export function doPrestige(state: GameState, now = Date.now()): number {
  const gain = prestigeGain(state.lifetime);
  if (gain <= 0) return 0;
  state.comeback += gain;
  state.prestiges += 1;
  state.aura = 0;
  state.lifetime = 0;
  state.clicks = 0;
  state.generators = emptyGenerators();
  state.upgrades = emptyUpgrades();
  state.combo = 0;
  state.lastClickAt = 0;
  state.comboExpiresAt = 0;
  state.lastBeatIndex = -1;
  state.lastHitSide = null;
  state.lastTickAt = now;
  return gain;
}

export function cloneState(state: GameState): GameState {
  return {
    ...state,
    generators: { ...state.generators },
    upgrades: { ...state.upgrades },
    achievements: [...state.achievements],
  };
}

export function serialize(state: GameState): GameSnapshot {
  return {
    aura: state.aura,
    lifetime: state.lifetime,
    clicks: state.clicks,
    generators: { ...state.generators },
    upgrades: { ...state.upgrades },
    achievements: [...state.achievements],
    prestiges: state.prestiges,
    comeback: state.comeback,
    sound: state.sound,
    startedAt: state.startedAt,
    lastTickAt: state.lastTickAt,
    boostUntil: state.boostUntil ?? 0,
    lastAdAt: state.lastAdAt ?? 0,
    adsWatched: state.adsWatched ?? 0,
  };
}

export function hydrate(raw: Partial<GameSnapshot> | null, now = Date.now()): GameState {
  const base = createState(now);
  if (!raw) return base;
  return {
    ...base,
    aura: Number(raw.aura) || 0,
    lifetime: Number(raw.lifetime) || 0,
    clicks: Number(raw.clicks) || 0,
    generators: { ...base.generators, ...(raw.generators ?? {}) },
    upgrades: { ...base.upgrades, ...(raw.upgrades ?? {}) },
    achievements: Array.isArray(raw.achievements) ? raw.achievements : [],
    prestiges: Number(raw.prestiges) || 0,
    comeback: Number(raw.comeback) || 0,
    sound: raw.sound !== false,
    startedAt: Number(raw.startedAt) || now,
    lastTickAt: Number(raw.lastTickAt) || now,
    boostUntil: Number(raw.boostUntil) || 0,
    lastAdAt: Number(raw.lastAdAt) || 0,
    adsWatched: Number(raw.adsWatched) || 0,
  };
}
