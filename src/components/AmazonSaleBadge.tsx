"use client";

// Flags Amazon India's "The Great Indian Sale" as currently live next to
// the Amazon.in buy option, on both the Pre-order page and the Buy Now
// popup — India only, since the sale is specific to Amazon.in, not
// Amazon's US/CA/AU storefronts. Same pattern as FlipkartSaleBadge: no
// hardcoded percentage or end date, since Amazon controls the sale's
// pricing/timing on its own platform.

import React from "react";
import { Flame } from "lucide-react";

type AmazonSaleBadgeProps = {
  // Tighter spacing/type scale for the Buy Now modal.
  compact?: boolean;
};

export default function AmazonSaleBadge({ compact = false }: AmazonSaleBadgeProps) {
  return (
    <div
      className={`rounded-lg border border-dashed border-[#FF9900] bg-[#FF9900]/10 ${
        compact ? "p-2 space-y-0.5" : "p-3 space-y-1"
      }`}
    >
      <div
        className={`flex items-center gap-1.5 font-bold uppercase tracking-widest text-[#B36B00] dark:text-[#FFB84D] ${
          compact ? "text-[7px]" : "text-[8px]"
        }`}
      >
        <Flame className={compact ? "w-2.5 h-2.5" : "w-3 h-3"} />
        <span>The Great Indian Sale — Live Now</span>
      </div>
      <p
        className={`text-[#8A5200] dark:text-[#FFCB80] font-medium leading-snug ${
          compact ? "text-[7px]" : "text-[8px]"
        }`}
      >
        Extra sale savings active on Amazon.in right now — check the live price at checkout.
      </p>
    </div>
  );
}
