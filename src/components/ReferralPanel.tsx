"use client";

// Shown once a visitor has a referral_code (either just signed up on
// this device, or returning with one saved from a previous visit).
// Reads only an aggregate count via get_referral_count() — never the
// underlying waitlist rows — so no RLS/email exposure risk.

import React, { useCallback, useEffect, useState } from "react";
import { Copy, Gift, Lock, MessageCircle, Unlock } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const REFERRAL_GOAL = 2;
const SITE_URL = "https://the-unshaken-self-site-hcp1.vercel.app";

// An original, paraphrased-style teaser distinct from the one-line
// Wisdom Draw quote for the same chapter — framed as a short excerpt
// rather than a single aphorism, so unlocking it feels like new content.
const CHAPTER_2_SNEAK_PEEK =
  "You keep asking the mind to be still, but you're asking the wrong part of yourself. The mind was never built for stillness — it was built for motion, comparison, judgment. What's still is what's underneath it: the one who notices the mind moving at all. Chapter 2 isn't about silencing your thoughts. It's about locating the seat behind them.";

export default function ReferralPanel({ referralCode }: { referralCode: string | null }) {
  const [count, setCount] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!referralCode) return;
    const supabase = createClient();
    supabase
      .rpc("get_referral_count", { p_code: referralCode })
      .then(({ data }: { data: number | null }) => {
        if (typeof data === "number") setCount(data);
      });
  }, [referralCode]);

  const shareLink = referralCode ? `${SITE_URL}/preorder?ref=${referralCode}` : "";

  const handleCopy = useCallback(async () => {
    if (!shareLink) return;
    try {
      await navigator.clipboard.writeText(shareLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard permission denied — the link is still visible to copy by hand.
    }
  }, [shareLink]);

  if (!referralCode) return null;

  const progress = Math.min(count ?? 0, REFERRAL_GOAL);
  const unlocked = progress >= REFERRAL_GOAL;
  const remaining = REFERRAL_GOAL - progress;

  return (
    <div className="max-w-2xl mx-auto bg-white dark:bg-[#101614] border border-[#dfb15b]/30 rounded-3xl p-6 md:p-8 space-y-6 shadow-sm">
      <div className="flex items-center gap-3 text-[#dfb15b]">
        <Gift className="w-5 h-5 flex-shrink-0" />
        <h4 className="font-serif text-base text-foreground font-semibold">
          Invite {REFERRAL_GOAL} Friends, Unlock a Chapter 2 Sneak Peek
        </h4>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch gap-2">
        <input
          readOnly
          value={shareLink}
          onFocus={(e) => e.currentTarget.select()}
          className="flex-1 text-[13px] bg-stone-50 dark:bg-[#070b09] border border-border-custom rounded-lg px-4 py-2.5 text-foreground font-mono"
        />
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleCopy}
            className="flex-1 sm:flex-initial px-4 py-2.5 rounded-lg bg-[#1e3f20] dark:bg-[#dfb15b] hover:opacity-90 text-white dark:text-black text-xs uppercase tracking-widest font-bold cursor-pointer whitespace-nowrap flex items-center justify-center gap-1.5"
          >
            <Copy className="w-3.5 h-3.5" />
            {copied ? "Copied" : "Copy"}
          </button>
          <a
            href={`https://wa.me/?text=${encodeURIComponent(
              `Join me on the waitlist for The Unshaken Self — ${shareLink}`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2.5 rounded-lg border border-border-custom hover:border-[#dfb15b]/60 text-muted-text hover:text-[#dfb15b] transition-colors flex items-center justify-center"
            aria-label="Share on WhatsApp"
          >
            <MessageCircle className="w-4 h-4" />
          </a>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-[12px] uppercase tracking-widest text-muted-text font-mono">
          <span>Referrals</span>
          <span>
            {progress}/{REFERRAL_GOAL}
          </span>
        </div>
        <div className="h-1.5 rounded-full bg-stone-100 dark:bg-[#070b09] overflow-hidden">
          <div
            className="h-full bg-[#dfb15b] transition-all duration-500"
            style={{ width: `${(progress / REFERRAL_GOAL) * 100}%` }}
          />
        </div>
      </div>

      {unlocked ? (
        <div className="p-5 border border-[#dfb15b]/30 bg-[#dfb15b]/5 rounded-2xl space-y-3">
          <div className="flex items-center gap-2 text-[#dfb15b] text-[12px] uppercase tracking-widest font-bold">
            <Unlock className="w-3.5 h-3.5" />
            <span>Chapter 2 — Unlocked</span>
          </div>
          <p className="text-sm font-serif italic text-foreground leading-relaxed">
            &ldquo;{CHAPTER_2_SNEAK_PEEK}&rdquo;
          </p>
        </div>
      ) : (
        <div className="p-5 border border-dashed border-border-custom rounded-2xl flex items-center gap-3 text-xs text-muted-text">
          <Lock className="w-4 h-4 text-[#dfb15b] flex-shrink-0" />
          <span>
            Share your link with {remaining} more {remaining === 1 ? "person" : "people"} to unlock
            a short Chapter 2 excerpt.
          </span>
        </div>
      )}
    </div>
  );
}
