"use client";

import React, { useCallback, useState } from "react";
import { RotateCw, Share2, Sparkles } from "lucide-react";
import { generateWisdomShareCard } from "@/lib/shareCard";

type WisdomLine = { num: number; theme: string; line: string };

// One original, non-verse teaching per chapter — paraphrased insight, not a
// direct scripture quotation — tying each traditional chapter name to the
// book's anxiety/psychology framing established elsewhere on the site.
const WISDOM_LINES: WisdomLine[] = [
  { num: 1, theme: "Arjuna Vishada Yoga", line: "Doubt is not weakness — it's often the first honest look at a decision that matters." },
  { num: 2, theme: "Sankhya Yoga", line: "You are not the panic passing through you — you are the stillness that notices it." },
  { num: 3, theme: "Karma Yoga", line: "Give the work your full hand, and let the outcome answer to time, not to your grip." },
  { num: 4, theme: "Jnana Karma Sanyasa Yoga", line: "Right action done with clear understanding never needs to be undone by guilt." },
  { num: 5, theme: "Karma Sanyasa Yoga", line: "Renunciation isn't quitting the task — it's releasing your hold on how it should end." },
  { num: 6, theme: "Dhyana Yoga", line: "Before you can steady the world, sit still long enough to steady one breath." },
  { num: 7, theme: "Jnana Vijnana Yoga", line: "Knowledge without direct experience is a map you've never actually walked." },
  { num: 8, theme: "Akshara Brahma Yoga", line: "What you think of in the final moment is what you've quietly practiced all along." },
  { num: 9, theme: "Raja Vidya Raja Guhya Yoga", line: "The most private truths are often the simplest ones you've been avoiding." },
  { num: 10, theme: "Vibhuti Yoga", line: "Look closely enough at anything excellent, and you'll find the same quiet source behind it." },
  { num: 11, theme: "Vishwarupa Darshana Yoga", line: "Some truths are too large for comfort — see them anyway." },
  { num: 12, theme: "Bhakti Yoga", line: "Devotion isn't believing perfectly — it's showing up consistently." },
  { num: 13, theme: "Kshetra Kshetrajna Vibhaga Yoga", line: "You are not the field of your circumstances — you are the one who knows the field." },
  { num: 14, theme: "Gunatraya Vibhaga Yoga", line: "Notice which quality is driving you right now — clarity, restlessness, or heaviness — before you act from it." },
  { num: 15, theme: "Purushottama Yoga", line: "Roots reach down before branches reach up. Anchor yourself before you grow." },
  { num: 16, theme: "Daivasura Sampad Vibhaga Yoga", line: "Fear, anger, and pride shrink a life. Courage, humility, and truth expand it." },
  { num: 17, theme: "Shraddhatraya Vibhaga Yoga", line: "What you quietly have faith in is what you slowly become." },
  { num: 18, theme: "Moksha Sanyasa Yoga", line: "Freedom isn't found by escaping your duties — it's found by doing them without needing to be someone else." },
];

export default function WisdomDraw() {
  const [current, setCurrent] = useState<WisdomLine | null>(null);
  const [flipped, setFlipped] = useState(false);
  const [drawing, setDrawing] = useState(false);
  const [sharing, setSharing] = useState(false);

  const draw = useCallback(() => {
    if (drawing) return;
    setDrawing(true);
    setFlipped(false);

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
    }, current ? 220 : 0);
  }, [current, drawing]);

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
          aria-label={current ? "Draw another teaching" : "Draw a teaching"}
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
              {current ? "Draw Another" : "Draw a Verse"}
            </span>
            <span className="text-[10px] text-white/50 max-w-[200px] text-center leading-relaxed">
              One teaching, chosen at random, from the book&apos;s 18 chapters.
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
    </div>
  );
}
