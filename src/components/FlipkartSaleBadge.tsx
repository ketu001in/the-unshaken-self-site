"use client";

// Flags Flipkart's "Big Billion Sale" as currently live next to the
// Flipkart buy option, on both the Pre-order page and the Buy Now popup.
// Unlike NotionPressCoupon, this has no code to reveal and no known end
// date — Flipkart runs and ends the sale on its own platform, so this
// stays a simple "it's live, check the price there" flag rather than a
// hardcoded percentage or expiry that could go stale or be wrong.

import React from "react";
import { Flame } from "lucide-react";

type FlipkartSaleBadgeProps = {
  // Tighter spacing/type scale for the Buy Now modal.
  compact?: boolean;
};

export default function FlipkartSaleBadge({ compact = false }: FlipkartSaleBadgeProps) {
  return (
    <div
      className={`rounded-lg border border-dashed border-[#2874F0] bg-[#2874F0]/10 ${
        compact ? "p-2 space-y-0.5" : "p-3 space-y-1"
      }`}
    >
      <div
        className={`flex items-center gap-1.5 font-bold uppercase tracking-widest text-[#2874F0] dark:text-[#7FAEFF] ${
          compact ? "text-[7px]" : "text-[8px]"
        }`}
      >
        <Flame className={compact ? "w-2.5 h-2.5" : "w-3 h-3"} />
        <span>Big Billion Sale — Live Now</span>
      </div>
      <p
        className={`text-[#1B4FAE] dark:text-[#9FC2FF] font-medium leading-snug ${
          compact ? "text-[7px]" : "text-[8px]"
        }`}
      >
        Extra sale savings active on Flipkart right now — check the live price at checkout.
      </p>
    </div>
  );
}
