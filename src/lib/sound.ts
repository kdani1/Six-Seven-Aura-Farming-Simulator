let ctx: AudioContext | null = null;
let sixBuf: AudioBuffer | null = null;
let sevenBuf: AudioBuffer | null = null;
let loadStarted = false;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const Ctor =
      window.AudioContext ||
      (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    ctx = new Ctor();
  }
  return ctx;
}

async function loadVoices() {
  const audio = getCtx();
  if (!audio || loadStarted) return;
  loadStarted = true;
  try {
    const [sixBytes, sevenBytes] = await Promise.all([
      fetch("/sfx/six.mp3").then((r) => r.arrayBuffer()),
      fetch("/sfx/seven.mp3").then((r) => r.arrayBuffer()),
    ]);
    sixBuf = await audio.decodeAudioData(sixBytes.slice(0));
    sevenBuf = await audio.decodeAudioData(sevenBytes.slice(0));
  } catch {
    loadStarted = false;
  }
}

export function unlockAudio() {
  const audio = getCtx();
  if (audio?.state === "suspended") void audio.resume();
  void loadVoices();
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.getVoices();
  }
}

function tone(
  frequency: number,
  duration: number,
  type: OscillatorType,
  gainValue: number,
  at = 0
) {
  const audio = getCtx();
  if (!audio) return;
  const t = audio.currentTime + at;
  const osc = audio.createOscillator();
  const gain = audio.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(frequency, t);
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(gainValue, t + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);
  osc.connect(gain);
  gain.connect(audio.destination);
  osc.start(t);
  osc.stop(t + duration + 0.02);
}

function speakFallback(side: "six" | "seven", ultra: boolean) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  const synth = window.speechSynthesis;
  synth.cancel();
  const line = new SpeechSynthesisUtterance(side === "six" ? "six" : "seven");
  line.lang = "en-US";
  line.rate = ultra ? 2.4 : 1.9;
  line.pitch = side === "six" ? 1.35 : 0.72;
  line.volume = 1;
  synth.speak(line);
}

export function speakSide(side: "six" | "seven", ultra: boolean) {
  const audio = getCtx();
  const buf = side === "six" ? sixBuf : sevenBuf;
  if (audio && buf) {
    const src = audio.createBufferSource();
    const gain = audio.createGain();
    src.buffer = buf;
    src.playbackRate.value = ultra ? 1.28 : 1.05;
    gain.gain.value = ultra ? 1 : 0.92;
    src.connect(gain);
    gain.connect(audio.destination);
    src.start();
    return;
  }
  void loadVoices();
  speakFallback(side, ultra);
}

export function playClick(
  combo: number,
  crit: boolean,
  timing: "start" | "perfect" | "good" | "early" | "late" | "wrong",
  side: "six" | "seven",
  ultra: boolean
) {
  unlockAudio();
  speakSide(side, ultra || combo >= 4);

  if (timing === "early" || timing === "late" || timing === "wrong") {
    tone(side === "six" ? 196 : 165, 0.07, "square", 0.035);
    return;
  }

  const root = side === "six" ? 392 : 311;
  const punch = timing === "perfect" ? 0.07 : 0.05;
  tone(root, 0.07, "square", punch);
  tone(root * 2, 0.05, "triangle", 0.03, 0.012);
  if (timing === "perfect") tone(root * 3, 0.08, "triangle", 0.025, 0.02);
  if (combo >= 6) tone(root * 1.5, 0.09, "sawtooth", 0.03, 0.03);
  if (crit) {
    tone(880, 0.12, "square", 0.055, 0.02);
    tone(1320, 0.14, "triangle", 0.04, 0.04);
  }
}

export function playBuy() {
  unlockAudio();
  tone(330, 0.07, "square", 0.045);
  tone(392, 0.09, "triangle", 0.04, 0.04);
  tone(523, 0.12, "square", 0.035, 0.09);
  tone(659, 0.16, "triangle", 0.03, 0.14);
}

export function playPrestige() {
  unlockAudio();
  tone(196, 0.2, "sawtooth", 0.05);
  tone(247, 0.22, "square", 0.04, 0.08);
  tone(330, 0.28, "triangle", 0.05, 0.16);
  tone(440, 0.35, "square", 0.04, 0.26);
}
