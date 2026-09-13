"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { ClickStage } from "@/components/click-stage";
import { AdBoostBar } from "@/components/ad-boost-bar";
import { AdOverlay } from "@/components/ad-overlay";
import { LorePanel } from "@/components/lore-panel";
import { ShopPanel } from "@/components/shop-panel";
import { ToastStack } from "@/components/toast-stack";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGame } from "@/hooks/use-game";
import { adBoostActive } from "@/lib/engine";
import { unlockAudio } from "@/lib/sound";
import { Download, Volume2, VolumeX } from "lucide-react";

export function GameShell() {
  const game = useGame();
  const [buyAmount, setBuyAmount] = useState<1 | 10 | 100>(1);
  const [resetOpen, setResetOpen] = useState(false);
  const isNative = useSyncExternalStore(
    () => () => undefined,
    () => Boolean((window as Window & { Capacitor?: unknown }).Capacitor),
    () => false
  );

  const click = game.click;

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.repeat) return;
      const tag = (event.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (event.code === "ArrowLeft" || event.code === "KeyA" || event.code === "KeyZ") {
        event.preventDefault();
        click("six");
        return;
      }
      if (event.code === "ArrowRight" || event.code === "KeyD" || event.code === "KeyX") {
        event.preventDefault();
        click("seven");
        return;
      }
      if (event.code !== "Space" && event.code !== "Enter") return;
      if (tag === "BUTTON") return;
      event.preventDefault();
      click();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [click]);

  if (!game.ready) {
    return (
      <div className="grid min-h-dvh place-items-center bg-black text-lime-300">
        <p className="font-display text-4xl tracking-widest">6–7</p>
      </div>
    );
  }

  const shop = (
    <ShopPanel
      state={game.state}
      buyAmount={buyAmount}
      pulseId={game.shopPulse}
      onBuyAmount={setBuyAmount}
      onBuyGenerator={game.purchaseGenerator}
      onBuyUpgrade={game.purchaseUpgrade}
    />
  );

  const lore = (
    <LorePanel
      state={game.state}
      canPrestige={game.canPrestige}
      nextPrestige={game.nextPrestige}
      onPrestige={game.prestige}
      onReset={() => setResetOpen(true)}
    />
  );

  return (
    <div className="relative min-h-dvh overflow-hidden bg-[#070709] text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(212,255,0,0.1),transparent_46%)]" />

      <header className="relative z-10 flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3 sm:px-6">
        <div>
          <p className="font-display text-3xl leading-none tracking-wide">
            <span className="text-lime-300">6</span>
            <span className="text-white/30">–</span>
            <span className="text-fuchsia-400">7</span>
            <span className="ml-2 text-lg text-white/70">CLICKER</span>
          </p>
          <p className="text-[11px] tracking-[0.22em] text-white/40 uppercase">
            aura farm · {game.era.name}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {!isNative ? (
            <a
              href="/downloads/67-clicker.apk"
              download="67-clicker.apk"
              className="inline-flex h-7 items-center gap-1 rounded-lg border border-lime-300/40 bg-lime-300/10 px-2.5 text-[0.8rem] font-medium text-lime-300 hover:bg-lime-300/20"
            >
              <Download className="size-3.5" />
              APK
            </a>
          ) : null}
          <div className="hidden items-center gap-2 sm:flex">
            {game.state.sound ? (
              <Volume2 className="size-4 text-white/60" />
            ) : (
              <VolumeX className="size-4 text-white/60" />
            )}
            <Switch
              checked={game.state.sound}
              onCheckedChange={() => {
                unlockAudio();
                game.toggleSound();
              }}
              aria-label="Hang"
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            className="border-white/15 bg-white/5 text-white sm:hidden"
            onClick={() => {
              unlockAudio();
              game.toggleSound();
            }}
          >
            {game.state.sound ? "Hang be" : "Néma"}
          </Button>
        </div>
      </header>

      <main className="relative z-10 mx-auto grid w-full max-w-[1400px] grid-cols-1 lg:grid-cols-[minmax(280px,360px)_minmax(0,1fr)_minmax(280px,360px)] lg:items-start">
        <aside className="hidden max-h-[calc(100dvh-64px)] overflow-y-auto border-white/10 p-4 lg:block lg:border-r">
          {shop}
        </aside>

        <div className="flex min-w-0 flex-col">
          <ClickStage
            aura={game.state.aura}
            rate={game.rate}
            combo={game.state.combo}
            slam={game.slam}
            shaking={game.shaking}
            floaters={game.floaters}
            eraName={game.era.name}
            timing={game.timing}
            lastSide={game.lastSide}
            ultra={game.ultra}
            shout={game.shout}
            hitNonce={game.hitNonce}
            boosted={adBoostActive(game.state)}
            onHit={(side, client) => {
              unlockAudio();
              game.click({ ...client, side });
            }}
          />
          <div className="px-4 pb-4">
            <AdBoostBar state={game.state} onWatch={game.openAd} />
          </div>
        </div>

        <aside className="hidden max-h-[calc(100dvh-64px)] overflow-y-auto border-white/10 p-4 lg:block lg:border-l">
          {lore}
        </aside>
      </main>

      <div className="relative z-10 border-t border-white/10 px-3 py-3 lg:hidden">
        <Tabs defaultValue="shop">
          <TabsList className="mb-3 grid w-full grid-cols-2 bg-white/8">
            <TabsTrigger value="shop" className="text-white data-active:bg-lime-300 data-active:text-black">
              Bolt
            </TabsTrigger>
            <TabsTrigger value="lore" className="text-white data-active:bg-fuchsia-400 data-active:text-black">
              Lore
            </TabsTrigger>
          </TabsList>
          <TabsContent value="shop">{shop}</TabsContent>
          <TabsContent value="lore">{lore}</TabsContent>
        </Tabs>
      </div>

      <ToastStack toasts={game.toasts} onDismiss={game.dismissToast} />

      {game.adOpen ? (
        <AdOverlay placement={game.adPlacement} onComplete={game.finishAd} />
      ) : null}

      <Dialog open={resetOpen} onOpenChange={setResetOpen}>
        <DialogContent className="border-white/10 bg-[#111] text-white">
          <DialogHeader>
            <DialogTitle>Törlöd a mentést?</DialogTitle>
            <DialogDescription className="text-white/60">
              Minden aura, generator, prestige és trophy megy a kukába. Ez nem 6–7. Ez delete.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setResetOpen(false)}>
              Marad
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                game.reset();
                setResetOpen(false);
              }}
            >
              Törlés
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
