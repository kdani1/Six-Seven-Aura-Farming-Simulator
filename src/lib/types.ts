export type HitSide = "six" | "seven";
export type HitTiming = "start" | "perfect" | "good" | "early" | "late" | "wrong";

export type Floater = {
  id: number;
  x: number;
  y: number;
  text: string;
  crit: boolean;
  timing?: HitTiming;
};

export type Toast = {
  id: number;
  title: string;
  detail: string;
  kind: "achievement" | "era" | "prestige" | "info";
};

export type GeneratorDef = {
  id: string;
  name: string;
  blurb: string;
  emoji: string;
  baseCost: number;
  baseProd: number;
  unlockAtLifetime: number;
};

export type UpgradeDef = {
  id: string;
  name: string;
  blurb: string;
  maxLevel: number;
  baseCost: number;
  costScale: number;
  requires?: { generatorId?: string; owned?: number; lifetime?: number };
};

export type AchievementDef = {
  id: string;
  name: string;
  blurb: string;
  check: (s: GameSnapshot) => boolean;
};

export type EraDef = {
  id: string;
  name: string;
  year: string;
  blurb: string;
  minLifetime: number;
};

export type GameSnapshot = {
  aura: number;
  lifetime: number;
  clicks: number;
  generators: Record<string, number>;
  upgrades: Record<string, number>;
  achievements: string[];
  prestiges: number;
  comeback: number;
  sound: boolean;
  startedAt: number;
  lastTickAt: number;
  boostUntil: number;
  lastAdAt: number;
  adsWatched: number;
};

export type GameState = GameSnapshot & {
  combo: number;
  lastClickAt: number;
  comboExpiresAt: number;
  lastBeatIndex: number;
  lastHitSide: HitSide | null;
};
