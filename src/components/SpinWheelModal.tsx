"use client";

// The "prize" behind the visitor-count badge — a hand-rolled SVG spin
// wheel (no charting library needed for six pie slices). Six segments,
// each pointing at a different curiosity/engagement loop already built
// elsewhere on the site (Wisdom Draw, the Archetype Quiz, the referral
// panel, the Breath Widget, the notify-me waitlist) plus a couple of
// standalone rewards (a random wisdom line, a Gita fun fact) so a spin
// is worth taking even with nothing to "win" in a literal sense.

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X, Sparkles } from "lucide-react";
import { WISDOM_LINES } from "@/lib/wisdomLines";
import { GITA_FACTS } from "@/lib/gitaFacts";

type SegmentKey = "wisdom" | "fact" | "quiz" | "share" | "breath" | "notify";

type Segment = { key: SegmentKey; emoji: string; label: string; color: string };

// Six brand-tone colors, alternating dark/light so adjacent slices stay
// distinguishable at a glance.
const SEGMENTS: Segment[] = [
  { key: "wisdom", emoji: "📜", label: "Wisdom Line", color: "#1e3f20" },
  { key: "fact", emoji: "💡", label: "Gita Fact", color: "#dfb15b" },
  { key: "quiz", emoji: "🧭", label: "Your Archetype", color: "#142a15" },
  { key: "share", emoji: "🔗", label: "Share & Unlock", color: "#c49945" },
  { key: "breath", emoji: "🌬️", label: "3-Breath Reset", color: "#2c5a2f" },
  { key: "notify", emoji: "🔔", label: "Notify Me First", color: "#b5924b" },
];

const SEGMENT_ANGLE = 360 / SEGMENTS.length;
const SPIN_DURATION_MS = 4200;
const CENTER = 150;
const RADIUS = 140;

function polarToCartesian(angleDeg: number, radius: number) {
  // angleDeg = 0 is straight up (12 o'clock), increasing clockwise —
  // matches how a physical prize wheel is read against a fixed top pointer.
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: CENTER + radius * Math.cos(rad), y: CENTER + radius * Math.sin(rad) };
}

function describeSector(startAngle: number, endAngle: number) {
  const start = polarToCartesian(endAngle, RADIUS);
  const end = polarToCartesian(startAngle, RADIUS);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
  return `M ${CENTER} ${CENTER} L ${start.x} ${start.y} A ${RADIUS} ${RADIUS} 0 ${largeArcFlag} 0 ${end.x} ${end.y} Z`;
}

type ResultContent = {
  emoji: string;
  title: string;
  body: string;
  ctaLabel: string;
  href: string;
};

function buildResult(key: SegmentKey): ResultContent {
  switch (key) {
    case "wisdom": {
      const line = WISDOM_LINES[Math.floor(Math.random() * WISDOM_LINES.length)];
      return {
        emoji: "📜",
        title: `Chapter ${line.num} — ${line.theme}`,
        body: line.line,
        ctaLabel: "Draw More Teachings",
        href: "#wisdom-draw",
      };
    }
    case "fact": {
      const fact = GITA_FACTS[Math.floor(Math.random() * GITA_FACTS.length)];
      return {
        emoji: "💡",
        title: "Did You Know?",
        body: fact,
        ctaLabel: "More About the Book",
        href: "/about-book",
      };
    }
    case "quiz":
      return {
        emoji: "🧭",
        title: "Know Your Archetype",
        body: "Five quick questions on how you respond under pressure — matched to one of the Gita's paths to steadiness.",
        ctaLabel: "Take the Quiz",
        href: "#archetype-quiz",
      };
    case "share":
      return {
        emoji: "🔗",
        title: "Share & Unlock",
        body: "Share your invite link with a couple of people and unlock a Chapter 2 excerpt as a thank-you.",
        ctaLabel: "Get My Link",
        href: "/preorder",
      };
    case "breath":
      return {
        emoji: "🌬️",
        title: "3-Breath Reset",
        body: "Right now: breathe in for 4 counts, hold for 4, and let it out for 6. Do that three times.",
        ctaLabel: "Try the Guided Version",
        href: "/resources",
      };
    case "notify":
      return {
        emoji: "🔔",
        title: "Be First to Know",
        body: "Ordering opens 5th September 2026 — join the notify list and we'll email you the moment it does.",
        ctaLabel: "Join the Notify List",
        href: "/preorder#waitlist-form",
      };
  }
}

type SpinWheelModalProps = {
  open: boolean;
  onClose: () => void;
};

export default function SpinWheelModal({ open, onClose }: SpinWheelModalProps) {
  const [mounted, setMounted] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<ResultContent | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Reset to a fresh wheel each time the modal is reopened.
  useEffect(() => {
    if (open) {
      setResult(null);
      setSpinning(false);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  const spin = () => {
    if (spinning) return;
    setResult(null);
    setSpinning(true);

    const targetIndex = Math.floor(Math.random() * SEGMENTS.length);
    const segmentCenter = targetIndex * SEGMENT_ANGLE + SEGMENT_ANGLE / 2;
    const desiredMod = (360 - segmentCenter + 360) % 360;
    const currentMod = ((rotation % 360) + 360) % 360;
    const forwardDelta = (desiredMod - currentMod + 360) % 360;
    const EXTRA_FULL_SPINS = 6;
    const newRotation = rotation + EXTRA_FULL_SPINS * 360 + forwardDelta;

    setRotation(newRotation);
    window.setTimeout(() => {
      setSpinning(false);
      setResult(buildResult(SEGMENTS[targetIndex].key));
    }, SPIN_DURATION_MS);
  };

  const handleCta = (href: string) => {
    onClose();
    if (href.startsWith("#")) {
      const el = document.getElementById(href.slice(1));
      if (el) {
        window.setTimeout(() => el.scrollIntoView({ behavior: "smooth", block: "start" }), 150);
        return;
      }
      window.location.href = "/" + href;
      return;
    }
    window.location.href = href;
  };

  const modal = open && (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-label="Spin the wheel"
    >
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-md my-auto max-h-[92vh] overflow-y-auto bg-white dark:bg-[#101614] border border-border-custom rounded-3xl shadow-2xl p-6 sm:p-8 space-y-6 animate-[fadeIn_0.2s_ease-out] text-center">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-muted-text hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer z-10"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="space-y-1.5">
          <span className="text-[12px] tracking-[0.3em] text-[#b5924b] dark:text-[#dfb15b] uppercase font-bold">
            A Small Surprise
          </span>
          <h3 className="font-serif text-xl text-foreground">Spin the Wheel</h3>
        </div>

        {/* Wheel */}
        <div className="relative w-[220px] h-[220px] sm:w-[260px] sm:h-[260px] mx-auto">
          {/* Pointer — fixed, does not rotate */}
          <div
            className="absolute -top-1 left-1/2 -translate-x-1/2 z-10 w-0 h-0"
            style={{
              borderLeft: "10px solid transparent",
              borderRight: "10px solid transparent",
              borderTop: "16px solid #d64545",
              filter: "drop-shadow(0 2px 2px rgba(0,0,0,0.25))",
            }}
          />

          <div
            className="w-full h-full rounded-full border-4 border-white dark:border-[#101614] shadow-xl"
            style={{
              transform: `rotate(${rotation}deg)`,
              transition: spinning ? `transform ${SPIN_DURATION_MS}ms cubic-bezier(0.12, 0.67, 0.15, 1)` : "none",
            }}
          >
            <svg viewBox="0 0 300 300" className="w-full h-full">
              {SEGMENTS.map((seg, i) => {
                const start = i * SEGMENT_ANGLE;
                const end = start + SEGMENT_ANGLE;
                const mid = start + SEGMENT_ANGLE / 2;
                // Anchor both labels on the 12-o'clock axis, then rotate the
                // whole (x, transform) pair by the segment's mid-angle around
                // the wheel's center — lands them centered in their wedge,
                // reading outward from the hub, at any angle.
                const emojiY = CENTER - RADIUS * 0.62;
                const labelY = emojiY + 24;
                return (
                  <g key={seg.key}>
                    <path d={describeSector(start, end)} fill={seg.color} stroke="#faf8f5" strokeWidth="2" />
                    <text
                      x={CENTER}
                      y={emojiY}
                      transform={`rotate(${mid} ${CENTER} ${CENTER})`}
                      textAnchor="middle"
                      fontSize="26"
                    >
                      {seg.emoji}
                    </text>
                    <text
                      x={CENTER}
                      y={labelY}
                      transform={`rotate(${mid} ${CENTER} ${CENTER})`}
                      textAnchor="middle"
                      fontSize="11"
                      fontWeight="700"
                      fill="#faf8f5"
                      style={{ textTransform: "uppercase", letterSpacing: "0.03em" }}
                    >
                      {seg.label}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Center hub / spin trigger */}
          <button
            onClick={spin}
            disabled={spinning}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-white dark:bg-[#101614] border-4 border-[#dfb15b] shadow-lg flex flex-col items-center justify-center text-[11px] font-bold uppercase tracking-wider text-foreground cursor-pointer disabled:cursor-not-allowed hover:scale-105 active:scale-95 transition-transform"
            aria-label="Spin the wheel"
          >
            <Sparkles className="w-4 h-4 text-[#dfb15b] mb-0.5" />
            {spinning ? "..." : "Spin"}
          </button>
        </div>

        {/* Result */}
        {result ? (
          <div className="space-y-4 pt-2 animate-[fadeIn_0.3s_ease-out]">
            <div className="p-5 rounded-2xl bg-[#faf8f5] dark:bg-[#070b09] border border-[#dfb15b]/30 space-y-2">
              <div className="text-2xl">{result.emoji}</div>
              <h4 className="font-serif text-base text-foreground">{result.title}</h4>
              <p className="text-xs sm:text-sm font-light text-stone-600 dark:text-stone-300 leading-relaxed">
                {result.body}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => handleCta(result.href)}
                className="flex-1 px-5 py-3 rounded-full bg-[#1e3f20] hover:bg-[#142a15] dark:bg-[#dfb15b] dark:hover:bg-[#c49945] text-white dark:text-black text-xs uppercase tracking-widest font-bold shadow-md transition-transform hover:scale-105 cursor-pointer"
              >
                {result.ctaLabel}
              </button>
              <button
                onClick={spin}
                disabled={spinning}
                className="flex-1 px-5 py-3 rounded-full border border-border-custom hover:bg-black/5 dark:hover:bg-white/5 text-foreground text-xs uppercase tracking-widest font-semibold transition-colors cursor-pointer"
              >
                Spin Again
              </button>
            </div>
          </div>
        ) : (
          <p className="text-xs font-light text-stone-500 dark:text-stone-400">
            {spinning ? "Spinning…" : "Tap the wheel to see what you land on."}
          </p>
        )}
      </div>
    </div>
  );

  return mounted && modal ? createPortal(modal, document.body) : null;
}
