"use client";

import { useCallback, useRef, useState, useSyncExternalStore } from "react";
import { OFFLINE_CAP_MS, PRESTIGE_AT, SAVE_KEY, TICK_MS } from "@/lib/content";
import {
  applyIdle,
  buyGenerator,
  buyUpgrade,
  cloneState,
  createState,
  currentEra,
  doPrestige,
    grantAchievements,
    hydrate,
    performClick,
    expectedSideAt,
    prestigeGain,
    productionPerSecond,
    serialize,
    grantAdBoost,
  } from "@/lib/engine";
import { playBuy, playClick, playPrestige, unlockAudio } from "@/lib/sound";
import { canWatchAd, placementFor } from "@/lib/ads";
import type { Floater, GameState, HitSide, HitTiming, Toast } from "@/lib/types";

const EMPTY = createState(0);
const listeners = new Set<() => void>();
let current: GameState = EMPTY;
let bootstrapped = false;
let tickTimer: number | null = null;
let saveTimer: number | null = null;

function emit() {
  for (const listener of listeners) listener();
}

function loadSave(): GameState {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return createState();
    return hydrate(JSON.parse(raw) as Partial<GameState>);
  } catch {
    return createState();
  }
}

function persist(state: GameState) {
  try {
    state.lastTickAt = Date.now();
    localStorage.setItem(SAVE_KEY, JSON.stringify(serialize(state)));
  } catch {
    // private mode / quota — the run still works in memory
  }
}

function mutate(updater: (state: GameState) => void) {
  const next = cloneState(current === EMPTY ? createState() : current);
  updater(next);
  current = next;
  emit();
}

function onLeave() {
  persist(current);
}

function startLoops() {
  if (tickTimer !== null) return;
  tickTimer = window.setInterval(() => {
    if (current === EMPTY) return;
    const now = Date.now();
    const dt = Math.min((now - current.lastTickAt) / 1000, 2);
    applyIdle(current, dt);
    current.lastTickAt = now;
    if (now > current.comboExpiresAt && current.combo !== 0) current.combo = 0;
    current = { ...current };
    emit();
  }, TICK_MS);
  saveTimer = window.setInterval(() => persist(current), 2000);
  window.addEventListener("beforeunload", onLeave);
  document.addEventListener("visibilitychange", onLeave);
}

function stopLoopsIfIdle() {
  if (listeners.size > 0) return;
  if (tickTimer !== null) window.clearInterval(tickTimer);
  if (saveTimer !== null) window.clearInterval(saveTimer);
  tickTimer = null;
  saveTimer = null;
  window.removeEventListener("beforeunload", onLeave);
  document.removeEventListener("visibilitychange", onLeave);
  persist(current);
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  if (!bootstrapped) {
    bootstrapped = true;
    const loaded = loadSave();
    const elapsedMs = Math.min(Date.now() - loaded.lastTickAt, OFFLINE_CAP_MS);
    applyIdle(loaded, elapsedMs / 1000);
    loaded.lastTickAt = Date.now();
    grantAchievements(loaded);
    current = loaded;
  }
  startLoops();
  return () => {
    listeners.delete(listener);
    stopLoopsIfIdle();
  };
}

function getSnapshot() {
  return current;
}

function getServerSnapshot() {
  return EMPTY;
}

export function useGame() {
  const state = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [floaters, setFloaters] = useState<Floater[]>([]);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [shaking, setShaking] = useState(false);
  const [slam, setSlam] = useState(false);
  const [timing, setTiming] = useState<HitTiming | null>(null);
  const [shopPulse, setShopPulse] = useState<string | null>(null);
  const [lastSide, setLastSide] = useState<HitSide | null>(null);
  const [ultra, setUltra] = useState(false);
  const [shout, setShout] = useState<"SIX" | "SEVEN" | "SIX SEVEN" | null>(null);
  const [hitNonce, setHitNonce] = useState(0);
  const [adOpen, setAdOpen] = useState(false);
  const floaterId = useRef(1);
  const toastId = useRef(1);

  const pushToast = useCallback((toast: Omit<Toast, "id">) => {
    const id = toastId.current++;
    setToasts((list) => [...list.slice(-4), { ...toast, id }]);
    window.setTimeout(() => {
      setToasts((list) => list.filter((t) => t.id !== id));
    }, 4200);
  }, []);

  const spawnFloater = useCallback(
    (text: string, crit: boolean, x?: number, y?: number, hit?: HitTiming) => {
    const id = floaterId.current++;
    const floater: Floater = {
      id,
      x: x ?? 42 + Math.random() * 16,
      y: y ?? 38 + Math.random() * 18,
      text,
      crit,
      timing: hit,
    };
    setFloaters((list) => [...list.slice(-5), floater]);
    window.setTimeout(() => {
      setFloaters((list) => list.filter((f) => f.id !== id));
    }, 800);
  }, []);

  const click = useCallback(
    (input?: { x: number; y: number; rect: DOMRect; side?: HitSide } | HitSide) => {
      const side: HitSide =
        typeof input === "string"
          ? input
          : input?.side ?? expectedSideAt(Date.now());
      const client = typeof input === "string" ? undefined : input;

      let result = {
        gained: 0,
        crit: false,
        combo: 1,
        timing: "start" as HitTiming,
        side,
        expected: side,
        ultra: false,
        pair: false,
        ignored: false,
      };
      let eraBefore = "";
      mutate((next) => {
        eraBefore = currentEra(next.lifetime).id;
        result = performClick(next, Date.now(), side);
        const unlocked = grantAchievements(next);
        for (const a of unlocked) {
          pushToast({ kind: "achievement", title: a.name, detail: a.blurb });
        }
        const era = currentEra(next.lifetime);
        if (era.id !== eraBefore) {
          pushToast({ kind: "era", title: era.name, detail: era.blurb });
        }
      });
      if (result.ignored) return;
      if (current.sound) {
        playClick(result.combo, result.crit, result.timing, result.side, result.ultra);
      }
      if (result.crit && typeof navigator !== "undefined" && navigator.vibrate) {
        navigator.vibrate(12);
      }
      setTiming(result.timing);
      setLastSide(result.side);
      setUltra(result.ultra);
      setHitNonce((n) => n + 1);
      setSlam(true);
      window.setTimeout(() => setSlam(false), 120);
      const shoutWord = result.pair || result.crit ? "SIX SEVEN" : result.side === "six" ? "SIX" : "SEVEN";
      setShout(shoutWord);
      window.setTimeout(() => setShout(null), result.pair || result.crit ? 360 : 220);
      if (result.crit || result.pair) {
        setShaking(true);
        window.setTimeout(() => setShaking(false), 180);
      }
      let x = result.side === "six" ? 28 : 72;
      let y = 38;
      if (client) {
        const px = ((client.x - client.rect.left) / client.rect.width) * 100;
        const py = ((client.y - client.rect.top) / client.rect.height) * 100;
        if (Number.isFinite(px) && Number.isFinite(py) && px >= 4 && px <= 96 && py >= 8 && py <= 92) {
          x = px;
          y = py;
        }
      }
      const amount = result.gained >= 10 ? Math.floor(result.gained) : Number(result.gained.toFixed(1));
      const label = result.crit || result.pair
        ? `SIX SEVEN +${amount}`
        : result.timing === "early"
          ? "túl gyors"
          : result.timing === "late"
            ? "túl lassú"
            : result.timing === "wrong"
              ? "váltani"
              : result.timing === "perfect"
                ? `${result.side === "six" ? "SIX" : "SEVEN"} +${amount}`
                : `${result.side === "six" ? "six" : "seven"} +${amount}`;
      spawnFloater(label, result.crit || result.pair, x, y, result.timing);
    },
    [pushToast, spawnFloater]
  );

  const purchaseGenerator = useCallback(
    (id: string, amount: number) => {
      let bought = false;
      mutate((next) => {
        const eraBefore = currentEra(next.lifetime).id;
        if (!buyGenerator(next, id, amount)) return;
        bought = true;
        if (next.sound) playBuy();
        const unlocked = grantAchievements(next);
        for (const a of unlocked) {
          pushToast({ kind: "achievement", title: a.name, detail: a.blurb });
        }
        const era = currentEra(next.lifetime);
        if (era.id !== eraBefore) {
          pushToast({ kind: "era", title: era.name, detail: era.blurb });
        }
      });
      if (!bought) return;
      setShopPulse(id);
      window.setTimeout(() => setShopPulse((currentId) => (currentId === id ? null : currentId)), 520);
    },
    [pushToast]
  );

  const purchaseUpgrade = useCallback(
    (id: string) => {
      let bought = false;
      mutate((next) => {
        if (!buyUpgrade(next, id)) return;
        bought = true;
        if (next.sound) playBuy();
        const unlocked = grantAchievements(next);
        for (const a of unlocked) {
          pushToast({ kind: "achievement", title: a.name, detail: a.blurb });
        }
      });
      if (!bought) return;
      setShopPulse(id);
      window.setTimeout(() => setShopPulse((currentId) => (currentId === id ? null : currentId)), 520);
    },
    [pushToast]
  );

  const prestige = useCallback(() => {
    let gain = 0;
    mutate((next) => {
      gain = doPrestige(next);
      if (gain <= 0) return;
      grantAchievements(next);
      persist(next);
    });
    if (gain <= 0) return;
    if (current.sound) playPrestige();
    pushToast({
      kind: "prestige",
      title: "We're so back",
      detail: `+${gain} comeback. A mém meghalt, te nem.`,
    });
  }, [pushToast]);

  const toggleSound = useCallback(() => {
    mutate((next) => {
      next.sound = !next.sound;
      if (next.sound) unlockAudio();
      persist(next);
    });
  }, []);

  const reset = useCallback(() => {
    const sound = current.sound;
    const fresh = createState();
    fresh.sound = sound;
    current = fresh;
    persist(current);
    emit();
    pushToast({
      kind: "info",
      title: "Új run",
      detail: "A lore törölve. A gesztus marad.",
    });
  }, [pushToast]);

  const openAd = useCallback(() => {
    if (!canWatchAd(current)) return;
    setAdOpen(true);
  }, []);

  const finishAd = useCallback(
    (watched: boolean) => {
      setAdOpen(false);
      if (!watched) return;
      mutate((next) => {
        grantAdBoost(next);
      });
      pushToast({
        kind: "info",
        title: "5× / 10× BOOST",
        detail: "1 perc: minden 5×, koppintás 10×.",
      });
    },
    [pushToast]
  );

  const ready = state !== EMPTY;
  const rate = productionPerSecond(state);
  const era = currentEra(state.lifetime);
  const nextPrestige = prestigeGain(state.lifetime);
  const canPrestige = state.lifetime >= PRESTIGE_AT;

  return {
    ready,
    state,
    rate,
    era,
    nextPrestige,
    canPrestige,
    floaters,
    toasts,
    shaking,
    slam,
    timing,
    shopPulse,
    lastSide,
    ultra,
    shout,
    hitNonce,
    adOpen,
    adPlacement: placementFor(state),
    click,
    openAd,
    finishAd,
    purchaseGenerator,
    purchaseUpgrade,
    prestige,
    toggleSound,
    reset,
    dismissToast: (id: number) => setToasts((list) => list.filter((t) => t.id !== id)),
  };
}
