"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Flame, RotateCw, Share2, Sparkles } from "lucide-react";
import { generateWisdomShareCard } from "@/lib/shareCard";
import { WISDOM_LINES, type WisdomLine } from "@/lib/wisdomLines";
import { playFlip, playConfirm } from "@/lib/sound";

// Day-of-year, used to deterministically pick "today's teaching" — the
// same chapter for every visitor on a given calendar date, so the first
// draw of the day is a shared, shareable, repeatable ritual rather than
// pure randomness.
function getDayOfYear(d: Date): number {
  const start = new Date(d.getFullYear(), 0, 0);
  return Math.floor((d.getTime() - start.getTime()) / 86400000);
}

const STREAK_KEY = "unshaken_wisdom_streak";

function loadStreak(): { streak: number; lastVisit: string } {
  if (typeof window === "undefined") return { streak: 0, lastVisit: "" };
  try {
    const raw = localStorage.getItem(STREAK_KEY);
    return raw ? JSON.parse(raw) : { streak: 0, lastVisit: "" };
  } catch {
    return { streak: 0, lastVisit: "" };
  }
}

export default function WisdomDraw() {
  const [current, setCurrent] = useState<WisdomLine | null>(null);
  const [flipped, setFlipped] = useState(false);
  const [drawing, setDrawing] = useState(false);
  const [sharing, setSharing] = useState(false);
  // Whether the visitor has revealed anything yet this visit — controls
  // the back-face copy ("Reveal Today's Teaching" vs "Draw Another").
  const [revealed, setRevealed] = useState(false);
  // True while `current` is today's deterministic pick; false once the
  // visitor has drawn again at random.
  const [isTodayTeaching, setIsTodayTeaching] = useState(true);
  const [streak, setStreak] = useState(0);

  // Pre-load today's teaching (unrevealed — card still shows its back
  // face) and update the daily-visit streak, once on mount.
  useEffect(() => {
    const today = new Date();
    const todayStr = today.toISOString().slice(0, 10);
    const { streak: prevStreak, lastVisit } = loadStreak();

    let nextStreak = prevStreak;
    if (lastVisit !== todayStr) {
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().slice(0, 10);
      nextStreak = lastVisit === yesterdayStr ? prevStreak + 1 : 1;
      localStorage.setItem(STREAK_KEY, JSON.stringify({ streak: nextStreak, lastVisit: todayStr }));
    } else {
      nextStreak = prevStreak || 1;
    }
    // One-time sync from localStorage on mount — not a subscription loop.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setStreak(nextStreak);

    const idx = getDayOfYear(today) % WISDOM_LINES.length;
    setCurrent(WISDOM_LINES[idx]);
  }, []);

  const draw = useCallback(() => {
    if (drawing) return;

    // First interaction of the visit — just reveal the already-loaded
    // teaching for today, no shuffle needed since nothing was shown yet.
    if (!revealed) {
      playFlip();
      setRevealed(true);
      setFlipped(true);
      return;
    }

    playFlip();
    setDrawing(true);
    setFlipped(false);
    setIsTodayTeaching(false);

    // A brief pause before loading the next line so repeat draws feel like a
    // genuine shuffle (flip back to blank, then flip to a new line) rather
    // than an instant content swap mid-flip.
    window.setTimeout(() => {
      setCurrent((prev) => {
        let next = WISDOM_LINES[Math.floor(Math.random() * WISDOM_LINES.length)];
        if (prev && WISDOM_LINES.length > 1) {
          while (next.num === prev.num) {
            next = WISDOM_LINES[Math.floor(Math.random() * WISDOM_LINES.length)];
          }
        }
        return next;
      });
      setFlipped(true);
      setDrawing(false);
      playFlip();
    }, 220);
  }, [drawing, revealed]);

  const handleShare = useCallback(
    async (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!current || sharing) return;
      setSharing(true);
      try {
        const blob = await generateWisdomShareCard(current);
        if (!blob) return;

        const fileName = `unshaken-self-chapter-${current.num}.png`;
        const file = new File([blob], fileName, { type: "image/png" });
        const shareData: ShareData = {
          files: [file],
          title: "The Unshaken Self",
          text: `Chapter ${current.num} · ${current.theme} — a teaching from The Unshaken Self.`,
        };

        if (navigator.canShare && navigator.canShare(shareData)) {
          await navigator.share(shareData);
        } else {
          // Desktop / unsupported browsers — direct download fallback.
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.download = fileName;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        }
        playConfirm();
      } catch {
        // User cancelled the native share sheet, or generation failed —
        // no error UI needed, this is a low-stakes secondary action.
      } finally {
        setSharing(false);
      }
    },
    [current, sharing]
  );

  return (
    <div className="flex flex-col items-center gap-5">
      <div className="w-full max-w-sm h-64 sm:h-72" style={{ perspective: "1200px" }}>
        <div
          onClick={draw}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              draw();
            }
          }}
          aria-label={revealed ? "Draw another teaching" : "Reveal today's teaching"}
          className="relative w-full h-full cursor-pointer transition-transform duration-500 ease-out"
          style={{
            transformStyle: "preserve-3d",
            transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
          }}
        >
          {/* Back face — face-down card, shown before/between draws */}
          <div
            className="absolute inset-0 rounded-3xl border border-[#dfb15b]/30 bg-gradient-to-br from-[#1e3f20] to-[#0f2b1a] dark:from-[#101614] dark:to-[#070b09] flex flex-col items-center justify-center gap-4 shadow-xl px-8"
            style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" }}
          >
            <div className="absolute inset-4 rounded-2xl border border-dashed border-[#dfb15b]/25 pointer-events-none" />
            <Sparkles className="w-8 h-8 text-[#dfb15b]" />
            <span className="text-[11px] uppercase tracking-[0.25em] text-[#dfb15b] font-semibold">
              {revealed ? "Draw Another" : "Reveal Today's Teaching"}
            </span>
            <span className="text-[10px] text-white/50 max-w-[200px] text-center leading-relaxed">
              {revealed
                ? "One teaching, chosen at random, from the book's 18 chapters."
                : "A new teaching is chosen each day — click to reveal today's."}
            </span>
          </div>

          {/* Front face — revealed teaching */}
          <div
            className="absolute inset-0 rounded-3xl border border-[#dfb15b]/40 bg-white dark:bg-[#101614] flex flex-col items-center justify-center gap-4 shadow-xl px-8 text-center"
            style={{
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
            }}
          >
            {current && (
              <>
                {isTodayTeaching && (
                  <span className="text-[9px] uppercase tracking-widest font-bold text-white bg-[#dfb15b] px-2 py-0.5 rounded-full">
                    Today&apos;s Teaching
                  </span>
                )}
                <span className="text-[10px] font-mono uppercase tracking-widest text-muted-text">
                  Chapter {current.num} • {current.theme}
                </span>
                <p className="font-serif text-base sm:text-lg text-foreground leading-relaxed">
                  &ldquo;{current.line}&rdquo;
                </p>
                <div className="flex items-center gap-4 mt-2">
                  <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-[#dfb15b] font-semibold">
                    <RotateCw className="w-3 h-3" />
                    Draw Another
                  </span>
                  <button
                    type="button"
                    onClick={handleShare}
                    disabled={sharing}
                    className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-muted-text hover:text-[#dfb15b] font-semibold transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-wait"
                    aria-label="Share this teaching as an image"
                  >
                    <Share2 className="w-3 h-3" />
                    {sharing ? "Preparing…" : "Share"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {streak > 1 && (
        <div className="flex items-center gap-1.5 text-[11px] text-[#dfb15b] font-semibold">
          <Flame className="w-3.5 h-3.5" />
          <span>{streak}-day streak — keep it going through launch</span>
        </div>
      )}
    </div>
  );
}
