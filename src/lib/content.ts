import type { AchievementDef, EraDef, GeneratorDef, UpgradeDef } from "@/lib/types";

export const SAVE_KEY = "sixty-seven-aura-farm-v2";
export const TICK_MS = 250;
export const BEAT_MS = 300;
export const PERFECT_WINDOW_BASE = 125;
export const GOOD_WINDOW_BASE = 148;
export const SIDE_GRACE_MS = 120;
export const MAX_COMBO = 67;
export const PRESTIGE_AT = 67_000_000;
export const OFFLINE_CAP_MS = 8 * 60 * 60 * 1000;
export const AD_BOOST_MS = 60_000;
export const AD_COOLDOWN_MS = 75_000;
export const AD_IDLE_MULT = 5;
export const AD_CLICK_MULT = 10;
export const AD_UNLOCK_CLICKS = 8;
export const AD_WATCH_MS = 5_000;

export const GENERATORS: GeneratorDef[] = [
  {
    id: "hallway",
    name: "Folyosós gyerek",
    blurb: "Szünetben elkiáltja magát. Senki nem tudja, miért.",
    emoji: "🏫",
    baseCost: 18,
    baseProd: 0.08,
    unlockAtLifetime: 0,
  },
  {
    id: "kid",
    name: "67 Kid",
    blurb: "Kosár meccs. Tenyér felfelé. A gesztus megszületik.",
    emoji: "🏀",
    baseCost: 95,
    baseProd: 0.35,
    unlockAtLifetime: 80,
  },
  {
    id: "edit",
    name: "TikTok edit",
    blurb: "LaMelo 6′7. A szám elszakad a jelentéstől.",
    emoji: "📱",
    baseCost: 620,
    baseProd: 1.8,
    unlockAtLifetime: 450,
  },
  {
    id: "classroom",
    name: "Osztálytermi járvány",
    blurb: "Minden matekfeladat megoldása: 67.",
    emoji: "✏️",
    baseCost: 4_200,
    baseProd: 9,
    unlockAtLifetime: 2_800,
  },
  {
    id: "ban",
    name: "Tanári tiltás",
    blurb: "Ha tiltják, akkor terjed. Ez a szabály.",
    emoji: "🚫",
    baseCost: 28_000,
    baseProd: 42,
    unlockAtLifetime: 18_000,
  },
  {
    id: "emote",
    name: "Fortnite emote",
    blurb: "Most már a battle pass is weighing.",
    emoji: "🎮",
    baseCost: 280_000,
    baseProd: 190,
    unlockAtLifetime: 140_000,
  },
  {
    id: "brand",
    name: "Márkaakció",
    blurb: "67 centes krumpli. Itt halt meg a mém.",
    emoji: "🍟",
    baseCost: 3_200_000,
    baseProd: 850,
    unlockAtLifetime: 1_200_000,
  },
  {
    id: "dictionary",
    name: "Az év szava",
    blurb: "Dictionary.com. Unc behavior. Vége a coolnak.",
    emoji: "📕",
    baseCost: 38_000_000,
    baseProd: 3_800,
    unlockAtLifetime: 12_000_000,
  },
  {
    id: "vatican",
    name: "Vatikáni gesztus",
    blurb: "Ha a pápa csinálja, az már nem trend. Az lore.",
    emoji: "🇻🇦",
    baseCost: 420_000_000,
    baseProd: 18_000,
    unlockAtLifetime: 90_000_000,
  },
  {
    id: "weekend",
    name: "6–7 Weekend",
    blurb: "A naptár maga a mém. Június 6–7, újra és újra.",
    emoji: "📅",
    baseCost: 5_600_000_000,
    baseProd: 95_000,
    unlockAtLifetime: 800_000_000,
  },
];

export const UPGRADES: UpgradeDef[] = [
  {
    id: "click",
    name: "Nehezebb gesztus",
    blurb: "Minden kattintás +1 alaperő.",
    maxLevel: 200,
    baseCost: 25,
    costScale: 1.62,
  },
  {
    id: "idle",
    name: "Autopilot brainrot",
    blurb: "+12% aura másodpercenként.",
    maxLevel: 40,
    baseCost: 400,
    costScale: 2.25,
    requires: { lifetime: 150 },
  },
  {
    id: "critChance",
    name: "6.7% energy",
    blurb: "+2.5% esély a SIX SEVEN kritre.",
    maxLevel: 18,
    baseCost: 900,
    costScale: 2.0,
    requires: { lifetime: 700 },
  },
  {
    id: "critMulti",
    name: "Seesaw slam",
    blurb: "A krit 1.5-ször fájdalmasabb.",
    maxLevel: 12,
    baseCost: 4_200,
    costScale: 2.3,
    requires: { lifetime: 4_000 },
  },
  {
    id: "combo",
    name: "Ritmusfül",
    blurb: "Még tágabb perfect-ablak a 6–7 váltáshoz.",
    maxLevel: 8,
    baseCost: 2_400,
    costScale: 2.45,
    requires: { lifetime: 1_800 },
  },
  {
    id: "noMeaning",
    name: "Semmi jelentése",
    blurb: "Pont ez a poén. 2× kattintás.",
    maxLevel: 1,
    baseCost: 12_000,
    costScale: 1,
    requires: { lifetime: 8_000 },
  },
  {
    id: "bannedViral",
    name: "Tiltani tilos",
    blurb: "A tiltás 2×-esíti a tanári tiltást.",
    maxLevel: 1,
    baseCost: 120_000,
    costScale: 1,
    requires: { generatorId: "ban", owned: 1 },
  },
  {
    id: "soOver",
    name: "It's so over",
    blurb: "A mém meghalt, a farm él. 2× minden.",
    maxLevel: 1,
    baseCost: 14_000_000,
    costScale: 1,
    requires: { generatorId: "brand", owned: 1 },
  },
];

export const ACHIEVEMENTS: AchievementDef[] = [
  {
    id: "first",
    name: "Chat, is this real?",
    blurb: "Először kimondtad: six seven.",
    check: (s) => s.clicks >= 1,
  },
  {
    id: "sixtySeven",
    name: "Pont 67",
    blurb: "67 aura. A szám, ami nem jelent semmit.",
    check: (s) => s.lifetime >= 67,
  },
  {
    id: "kid",
    name: "A gesztus",
    blurb: "Feloldottad a 67 Kidet.",
    check: (s) => (s.generators.kid ?? 0) >= 1,
  },
  {
    id: "school",
    name: "Matektanár nightmare",
    blurb: "Kitört az osztálytermi járvány.",
    check: (s) => (s.generators.classroom ?? 0) >= 1,
  },
  {
    id: "hundredClicks",
    name: "Mewing helyett ez",
    blurb: "100 kattintás. A csuklód cooked.",
    check: (s) => s.clicks >= 100,
  },
  {
    id: "thousand",
    name: "Aura farmer",
    blurb: "1 000 lifetime aura.",
    check: (s) => s.lifetime >= 1_000,
  },
  {
    id: "ban",
    name: "Tiltott fruit",
    blurb: "Megvetted a tanári tiltást.",
    check: (s) => (s.generators.ban ?? 0) >= 1,
  },
  {
    id: "brand",
    name: "Unc behavior",
    blurb: "A márkák rárepültek. A coolnak vége.",
    check: (s) => (s.generators.brand ?? 0) >= 1,
  },
  {
    id: "million",
    name: "Brainrot millionaire",
    blurb: "1 000 000 lifetime aura.",
    check: (s) => s.lifetime >= 1_000_000,
  },
  {
    id: "prestige",
    name: "We're so back",
    blurb: "Egyszer már vége volt. Aztán mégsem.",
    check: (s) => s.prestiges >= 1,
  },
  {
    id: "weekend",
    name: "A naptár is 67",
    blurb: "Feloldottad a 6–7 Weekendet.",
    check: (s) => (s.generators.weekend ?? 0) >= 1,
  },
  {
    id: "mogged",
    name: "Mogged by lore",
    blurb: "Három comeback. A mém halhatatlan, te nem.",
    check: (s) => s.prestiges >= 3,
  },
];

export const ERAS: EraDef[] = [
  {
    id: "drill",
    name: "Doot Doot",
    year: "2024",
    blurb: "Skrilla. Philadelphia, 67th Street. Még van jelentése.",
    minLifetime: 0,
  },
  {
    id: "ball",
    name: "6′7 edits",
    year: "2025 tél",
    blurb: "LaMelo Ball magassága. A szám leválik az utcáról.",
    minLifetime: 500,
  },
  {
    id: "kidEra",
    name: "67 Kid",
    year: "2025 március",
    blurb: "Egy gyerek a kamerába kiabál. A gesztus világszintű.",
    minLifetime: 6_000,
  },
  {
    id: "schoolEra",
    name: "Iskolai járvány",
    year: "2025 ősz",
    blurb: "Folyosók, tanári szobák, tiltások. Dictionary.com az év szava.",
    minLifetime: 140_000,
  },
  {
    id: "dead",
    name: "It's so over",
    year: "2026",
    blurb: "Márkák, pápa, 6–7 Weekend. A gyerekek szerint cringe. A farm megy tovább.",
    minLifetime: 8_000_000,
  },
  {
    id: "back",
    name: "We're so back",
    year: "most",
    blurb: "A mém halott. Te mégis kattintasz. Ez a prestige.",
    minLifetime: 67_000_000,
  },
];

export const TREND_NOTES = [
  {
    tag: "6–7",
    status: "peak utáni ikon",
    body: "2025 Dictionary.com év szava, 2026-ra a nagyobb gyerekek szerint dead. Mégis ez a legismertebb gesztus-mém, és júniusban 6–7 Weekendként tér vissza. Klikkerre tökéletes: ritmus, szám, kiabálás.",
  },
  {
    tag: "Italian brainrot",
    status: "klikker-meta",
    body: "Tralalero Tralala, Bombardiro Crocodilo, Tung Tung Tung Sahur. A Steal a Brainrot és a klón klikkerek ezt viszik. Túlzsúfolt, más IP-je. Mi nem másoltuk a bestiáriumot.",
  },
  {
    tag: "Aura farm",
    status: "még élő szleng",
    body: "Aura, mog, glaze, unc, cooked. 2026-ban ez a nyelv, amivel a 6–7-et temetik. A valutád aura, a prestige pedig comeback.",
  },
  {
    tag: "Labubu / 41",
    status: "hűlő / villanás",
    body: "A Labubu-láz 2025 nyarán tört, 2026-ra collector niche. A 41 egy rövid 6–7-utód volt az osztálytermekben, aztán eltűnt. Nem bírnak el egy egész játékot.",
  },
] as const;
