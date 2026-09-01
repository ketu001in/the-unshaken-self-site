"use client";

// Entry point into the Spin Wheel engagement loop. Still quietly counts
// real visits in the background (site_stats table via get_visit_count /
// increment_visit_count — counted once per device, localStorage-gated,
// never inflated by a refresh), but deliberately does NOT display that
// raw number on the badge itself: early on a real count reads as sparse
// rather than as social proof, and showing a number that's obviously tiny
// undermines trust more than showing no number at all. The count still
// exists server-side if a future threshold-gated display is wanted (see
// FoundingReadersWall for that pattern).

import React, { useEffect } from "react";
import { Dice5 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import SpinWheelModal from "./SpinWheelModal";

const VISIT_COUNTED_KEY = "unshaken_visit_counted";

export default function VisitorCounterBadge() {
  const [wheelOpen, setWheelOpen] = React.useState(false);

  useEffect(() => {
    const supabase = createClient();
    const alreadyCounted = typeof window !== "undefined" && localStorage.getItem(VISIT_COUNTED_KEY) === "1";
    if (alreadyCounted) return;

    supabase.rpc("increment_visit_count").then(({ error }: { error: unknown }) => {
      if (!error) localStorage.setItem(VISIT_COUNTED_KEY, "1");
    });
  }, []);

  return (
    <>
      <button
        onClick={() => setWheelOpen(true)}
        className="visitor-badge-pulse inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-[#101614] border border-[#dfb15b]/40 shadow-sm hover:shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer"
        aria-label="Spin the wheel for a surprise"
      >
        <Dice5 className="w-3.5 h-3.5 text-[#dfb15b] flex-shrink-0" />
        <span className="text-xs uppercase tracking-widest font-bold text-[#1e3f20] dark:text-[#dfb15b]">
          Curious? Spin the Wheel →
        </span>
      </button>

      <SpinWheelModal open={wheelOpen} onClose={() => setWheelOpen(false)} />
    </>
  );
}
