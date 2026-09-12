// Tiny synthesized sound engine for the site's UI feedback and rituals —
// built on the Web Audio API (OscillatorNode + GainNode) rather than
// shipping external audio files. Keeps the bundle at zero extra bytes,
// avoids any network fetch for sound assets, and gives full control over
// tone so every sound can stay soft, short, and on-brand rather than
// sounding like a generic notification ping.
//
// This module owns a single lazily-created AudioContext and a module-level
// `enabled` flag. SoundContext (the React layer) is the only thing that
// flips `enabled` — every play* function below checks it first, so even a
// stray call from a component that forgot to check context can never
// produce sound while the visitor has muted the site.

let audioCtx: AudioContext | null = null;
let enabled = true;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const AudioContextClass =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioContextClass) return null;

  if (!audioCtx) {
    audioCtx = new AudioContextClass();
  }
  // Browsers create/keep contexts in a "suspended" state until a user
  // gesture. Every play* call here is already the direct result of a
  // click/keypress, so resuming synchronously (fire-and-forget) is safe.
  if (audioCtx.state === "suspended") {
    void audioCtx.resume();
  }
  return audioCtx;
}

/** Global on/off switch — set by SoundContext, read by every play* call. */
export function setSoundEnabled(value: boolean) {
  enabled = value;
}

export function isSoundEnabled() {
  return enabled;
}

type ToneOptions = {
  type?: OscillatorType;
  gain?: number;
  attack?: number;
  release?: number;
  delay?: number;
  glideTo?: number;
};

/**
 * Plays a single short tone. All other play* helpers are built from this.
 * Uses a quick linear attack + exponential release envelope so nothing
 * ever pops or clicks at the start/end of the note.
 */
export function playTone(freq: number, duration: number, opts: ToneOptions = {}) {
  if (!enabled) return;
  const ctx = getCtx();
  if (!ctx) return;

  const { type = "sine", gain = 0.09, attack = 0.008, release = duration * 0.7, delay = 0, glideTo } = opts;

  const osc = ctx.createOscillator();
  const gainNode = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, ctx.currentTime + delay);
  if (glideTo) {
    osc.frequency.exponentialRampToValueAtTime(glideTo, ctx.currentTime + delay + duration);
  }

  const start = ctx.currentTime + delay;
  const end = start + duration;
  gainNode.gain.setValueAtTime(0, start);
  gainNode.gain.linearRampToValueAtTime(gain, start + attack);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, end + release);

  osc.connect(gainNode);
  gainNode.connect(ctx.destination);

  osc.start(start);
  osc.stop(end + release + 0.02);
}

/** Soft, quiet click for buttons, toggles, and general UI feedback. */
export function playClick() {
  playTone(720, 0.045, { type: "sine", gain: 0.06, attack: 0.003, release: 0.04 });
}

/** Two-note ascending confirmation — form submits, successful saves. */
export function playConfirm() {
  playTone(523.25, 0.09, { type: "sine", gain: 0.08 });
  playTone(659.25, 0.14, { type: "sine", gain: 0.09, delay: 0.09 });
}

/** Three-note ascending chime — bigger reveals: quiz result, wheel win. */
export function playChime() {
  playTone(523.25, 0.11, { type: "sine", gain: 0.07 });
  playTone(659.25, 0.11, { type: "sine", gain: 0.08, delay: 0.1 });
  playTone(783.99, 0.24, { type: "sine", gain: 0.09, delay: 0.2 });
}

/** Very short, quiet high tick — repeatable, for the spin wheel. */
export function playTick() {
  playTone(1000, 0.02, { type: "square", gain: 0.035, attack: 0.001, release: 0.015 });
}

/** Quick downward pitch sweep — a card "flip". */
export function playFlip() {
  playTone(520, 0.09, { type: "triangle", gain: 0.06, attack: 0.004, release: 0.05, glideTo: 260 });
}

/** Gentle rising tone for a breathing inhale cue. */
export function playInhale() {
  playTone(300, 0.5, { type: "sine", gain: 0.05, attack: 0.15, release: 0.3, glideTo: 460 });
}

/** Gentle falling tone for a breathing exhale cue. */
export function playExhale() {
  playTone(460, 0.6, { type: "sine", gain: 0.05, attack: 0.15, release: 0.4, glideTo: 260 });
}
