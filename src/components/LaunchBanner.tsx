"use client";

// Replaces the old "days until launch" countdown now that the book is
// actually live. No fake deadline, no invented numbers — just an honest
// "it's here" moment (a one-time confetti burst, skipped entirely for
// prefers-reduced-motion), the real publication date, and a share card
// so the announcement can travel further than this one page.

import React, { useEffect, useState } from "react";
import { PartyPopper, CalendarCheck, Share2 } from "lucide-react";
import { generateLaunchShareCard } from "@/lib/shareCard";

// Confirmed from the live Amazon.in listing for both editions.
const LIVE_SINCE = "3 September 2026";

type ConfettiPiece = {
  id: number;
  left: number;
  x: number;
  rot: number;
  delay: number;
  duration: number;
  color: string;
};

const CONFETTI_COLORS = ["#dfb15b", "#1e3f20", "#f5f1e8", "#b5924b"];

function buildConfetti(): ConfettiPiece[] {
  return Array.from({ length: 14 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    x: (Math.random() - 0.5) * 140,
    rot: 180 + Math.random() * 360,
    delay: Math.random() * 0.3,
    duration: 1.6 + Math.random() * 0.9,
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
  }));
}

export default function LaunchBanner() {
  const [confetti, setConfetti] = useState<ConfettiPiece[] | null>(null);
  const [sharing, setSharing] = useState(false);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!prefersReducedMotion) setConfetti(buildConfetti());
  }, []);

  const handleShare = async () => {
    if (sharing) return;
    setSharing(true);
    try {
      const blob = await generateLaunchShareCard();
      if (!blob) return;

      const fileName = "unshaken-self-now-live.png";
      const file = new File([blob], fileName, { type: "image/png" });
      const shareData: ShareData = {
        files: [file],
        title: "The Unshaken Self",
        text: "The Unshaken Self is live — paperback & hardcover, on Amazon and Notion Press.",
      };

      if (navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch {
      // Cancelled share sheet or generation failure — low-stakes, no error UI.
    } finally {
      setSharing(false);
    }
  };

  return (
    <div className="w-full flex flex-col items-center lg:items-start gap-3 relative py-1">
      {confetti && (
        <div className="pointer-events-none absolute inset-x-0 top-0 h-0 overflow-visible" aria-hidden="true">
          {confetti.map((p) => (
            <span
              key={p.id}
              className="confetti-piece"
              style={{
                left: `${p.left}%`,
                backgroundColor: p.color,
                borderRadius: p.id % 3 === 0 ? "50%" : "2px",
                ["--x" as string]: `${p.x}px`,
                ["--rot" as string]: `${p.rot}deg`,
                ["--delay" as string]: `${p.delay}s`,
                ["--duration" as string]: `${p.duration}s`,
              }}
            />
          ))}
        </div>
      )}

      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#1e3f20] dark:bg-[#dfb15b] text-white dark:text-black shadow-md shadow-[#1e3f20]/20 dark:shadow-[#dfb15b]/25">
        <PartyPopper className="w-4 h-4" />
        <span className="text-[11px] uppercase tracking-[0.2em] font-bold">Now Live</span>
      </div>

      <div className="flex flex-wrap items-center justify-center lg:justify-start gap-x-4 gap-y-2 text-[11px] text-muted-text">
        <span className="inline-flex items-center gap-1.5">
          <CalendarCheck className="w-3.5 h-3.5 text-[#dfb15b]" />
          Live since {LIVE_SINCE}
        </span>
        <button
          onClick={handleShare}
          disabled={sharing}
          className="inline-flex items-center gap-1.5 font-semibold uppercase tracking-widest text-[#1e3f20] dark:text-[#dfb15b] hover:underline cursor-pointer disabled:opacity-50 disabled:cursor-wait"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>{sharing ? "Preparing…" : "Share the News"}</span>
        </button>
      </div>
    </div>
  );
}
