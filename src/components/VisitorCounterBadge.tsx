"use client";

// A genuine, live-growing visit counter (backed by the site_stats table —
// see get_visit_count/increment_visit_count RPCs) doubling as the entry
// point into the Spin Wheel engagement loop. Counts once per device
// (localStorage-gated) rather than once per page load, so the number
// reflects visitors, not page views, and never gets inflated by a single
// person refreshing the page.

import React, { useEffect, useState } from "react";
import { Eye } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import SpinWheelModal from "./SpinWheelModal";

const VISIT_COUNTED_KEY = "unshaken_visit_counted";

export default function VisitorCounterBadge() {
  const [count, setCount] = useState<number | null>(null);
  const [wheelOpen, setWheelOpen] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    const alreadyCounted = typeof window !== "undefined" && localStorage.getItem(VISIT_COUNTED_KEY) === "1";

    if (alreadyCounted) {
      supabase.rpc("get_visit_count").then(({ data }: { data: number | null }) => {
        if (typeof data === "number") setCount(data);
      });
    } else {
      supabase.rpc("increment_visit_count").then(({ data, error }: { data: number | null; error: unknown }) => {
        if (!error && typeof data === "number") {
          setCount(data);
          localStorage.setItem(VISIT_COUNTED_KEY, "1");
        } else {
          // Fall back to a read-only count if the increment failed for any
          // reason, so the badge still shows something real.
          supabase.rpc("get_visit_count").then(({ data: readData }: { data: number | null }) => {
            if (typeof readData === "number") setCount(readData);
          });
        }
      });
    }
  }, []);

  if (count === null) return null;

  return (
    <>
      <button
        onClick={() => setWheelOpen(true)}
        className="visitor-badge-pulse inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-[#101614] border border-[#dfb15b]/40 shadow-sm hover:shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer"
        aria-label="See visitor count and spin the wheel"
      >
        <Eye className="w-3.5 h-3.5 text-[#dfb15b] flex-shrink-0" />
        <span className="text-xs text-foreground">
          <span className="font-serif font-bold text-[#b5924b] dark:text-[#dfb15b]">
            {count.toLocaleString()}
          </span>{" "}
          visitors so far
        </span>
        <span className="hidden sm:inline text-[10px] uppercase tracking-widest font-bold text-[#1e3f20] dark:text-[#dfb15b] border-l border-border-custom pl-2 ml-0.5">
          Spin for a Surprise →
        </span>
      </button>

      <SpinWheelModal open={wheelOpen} onClose={() => setWheelOpen(false)} />
    </>
  );
}
