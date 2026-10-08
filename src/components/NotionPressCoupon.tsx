"use client";

// Festive discount callout for the Notion Press option — the publisher's
// own store, the only place the UNSHAKEN20 coupon is valid. Shown on the
// Pre-order page's Notion Press cards and inside the Buy Now popup's
// Notion Press section. The code stays hidden behind a "reveal" click
// rather than sitting in plain text, and the whole thing self-expires
// (renders nothing) after the campaign's real end date, so nobody has to
// remember to come back and manually remove it later.

import React, { useState } from "react";
import { Tag, Copy, Check } from "lucide-react";
import { playClick } from "@/lib/sound";

const COUPON_CODE = "UNSHAKEN20";
// 20% off, Notion Press only, first 50 buyers — campaign end date as given
// by the author. End-of-day IST so the offer holds through the full 20th.
const COUPON_EXPIRY = new Date("2026-10-20T23:59:59+05:30");

type NotionPressCouponProps = {
  // Tighter spacing/type scale for the Buy Now modal, which is already
  // packed with three stores' worth of options.
  compact?: boolean;
};

export default function NotionPressCoupon({ compact = false }: NotionPressCouponProps) {
  const [revealed, setRevealed] = useState(false);
  const [copied, setCopied] = useState(false);

  if (Date.now() > COUPON_EXPIRY.getTime()) return null;

  const handleReveal = () => {
    playClick();
    setRevealed(true);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(COUPON_CODE);
      playClick();
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard permission denied or unavailable — the revealed code
      // itself is still enough for the visitor to copy manually.
    }
  };

  return (
    <div
      className={`rounded-lg border border-dashed border-[#D6A63C] bg-[#D6A63C]/10 ${
        compact ? "p-2 space-y-1" : "p-3 space-y-1.5"
      }`}
    >
      <div
        className={`flex items-center gap-1.5 font-bold uppercase tracking-widest text-[#AD8631] dark:text-[#D6A63C] ${
          compact ? "text-[7px]" : "text-[8px]"
        }`}
      >
        <Tag className={compact ? "w-2.5 h-2.5" : "w-3 h-3"} />
        <span>Festive Offer — 20% Off</span>
      </div>

      {!revealed ? (
        <button
          onClick={handleReveal}
          className={`underline text-[#0B2942] dark:text-[#D6A63C] font-semibold hover:opacity-80 cursor-pointer ${
            compact ? "text-[9px]" : "text-[10px]"
          }`}
        >
          Click to reveal your coupon code
        </button>
      ) : (
        <div className="flex items-center gap-1.5 flex-wrap">
          <code
            className={`px-2 py-1 rounded bg-[#0B2942] dark:bg-[#D6A63C] text-white dark:text-black font-bold tracking-wider ${
              compact ? "text-[10px]" : "text-[11px]"
            }`}
          >
            {COUPON_CODE}
          </code>
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-1 text-[9px] text-[#8B6D1F] dark:text-[#E8C874] hover:text-[#0B2942] dark:hover:text-white cursor-pointer font-semibold"
            aria-label="Copy coupon code"
          >
            {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
      )}

      <p
        className={`text-[#8B6D1F] dark:text-[#E8C874] font-medium leading-snug ${
          compact ? "text-[7px]" : "text-[8px]"
        }`}
      >
        Apply at checkout on Notion Press. First 50 buyers only · Valid till 20 Oct 2026.
      </p>
    </div>
  );
}
