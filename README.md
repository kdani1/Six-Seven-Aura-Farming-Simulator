# 6–7 Clicker — Aura Farm

Brainrot klikker a **6–7** (six seven) mémre: kattintasz, a két szám weighingel, aura jön, a mém terjed a folyosótól a Vatikánig, aztán meghal, és prestige-elsz.

## Miért épp ez?

2026-ban a tematikás klikkerek mezőnye nagyjából így néz ki:

| Trend | Állapot | Klikkerre? |
| --- | --- | --- |
| **6–7 / Six Seven** | 2025-ös csúcs, Dictionary.com év szava, 2026-ra „dead”, de még mindig a gesztus | Igen — ritmus, szám, kiabálás, prestige = *it's so over / we're so back* |
| **Italian brainrot** | Tralalero, Bombardiro, Tung Tung Tung Sahur; Steal a Brainrot-klónok | Túlzsúfolt, mások karakterei |
| **Aura / mog / unc** | Élő Gen Alpha szleng | A valuta és a hang |
| **Labubu, 41** | Hűlő, illetve villanás | Nem bírnak el egy játékot |

A 6–7-et választottuk, mert ez a gesztus, amit te is említettél, és mert 2026-os viszonya a mémhez (*már cringe, de a naptár még ünnepli*) magát a prestige-hurkot adja.

## Futtatás

```bash
npm install
npm run dev
```

A játék a [http://127.0.0.1:46767](http://127.0.0.1:46767) címen megy.

## Android APK

Sideload csomag (debug-aláírt, ~4.5 MB), csomagnév: `com.sixtyseven.clicker`.

- **Közvetlen letöltés (72 óra):** [https://litter.catbox.moe/7ay16v.apk](https://litter.catbox.moe/7ay16v.apk)
- **Gofile (hosszabb):** [https://gofile.io/d/Hw92dI2C](https://gofile.io/d/Hw92dI2C)
- **A repóban:** [`releases/67-clicker.apk`](releases/67-clicker.apk)

Telepítés: Androidon engedélyezd az ismeretlen forrásból származó appokat, nyisd meg az APK-t.

Újraépítés (Android SDK + JDK 21):

```bash
npm install
npm run build:apk
```

## Hogy megy

- Kattints **balra a 6-ra** (SIX) és **jobbra a 7-re** (SEVEN). A játék kiabálja: *six* / *seven*. A kombó akkor megy, ha váltod: 6–7–6–7. Az ütemablak széles, a dupla koppintás nem töri el. Nyilak / A–D is megy.
- 6.7% eséllyel **SIX SEVEN** krit.
- Aura → generátorok (folyosó, 67 Kid, TikTok, tanári tiltás, márkaakció, pápa, 6–7 Weekend).
- 67 millió lifetime auránál: **It's so over** → prestige → **We're so back** (+35% termelés stackenként).
- 8 koppintás után **reklám-boost**: 5 mp jutalomvideó → 1 percig **5× minden** termelés és **10× kattintás**. A szöveg az aktuális erához igazodik. Később AdMob-ra cserélhető a `src/lib/ads.ts` interfész.
- A haladás szándékosan lassabb: a kombó kevesebbet fizet, a generátorok drágábbak, az erák tovább tartanak. Így jobban bent tart egy-egy korszakban.
- Mentés: `localStorage` kulcs `sixty-seven-aura-farm-v2` (új futás — a régi túl gyors mentés nem jön át). Nincs szerver, nincs belépés.

## Stack

Next.js, TypeScript, Tailwind, shadcn/ui.
