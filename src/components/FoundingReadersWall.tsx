"use client";

// Social-proof strip: live waitlist count + a scrolling ticker of names
// from anyone who opted to share theirs. Only ever reads an aggregate
// count and a name-only RPC — never raw waitlist rows/emails, so this
// stays safe against the table's admin-only SELECT policy.

import React, { useEffect, useState } from "react";
import { Users } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

// Below this, a real count reads as sparse rather than as social proof —
// mirrors the same threshold Countdown uses for its own waitlist line.
const DISPLAY_THRESHOLD = 5;
const NAME_LIMIT = 14;

export default function FoundingReadersWall() {
  const [count, setCount] = useState<number | null>(null);
  const [names, setNames] = useState<string[]>([]);

  useEffect(() => {
    const supabase = createClient();
    supabase.rpc("waitlist_count").then(({ data }: { data: number | null }) => {
      if (typeof data === "number") setCount(data);
    });
    supabase
      .rpc("waitlist_recent_names", { p_limit: NAME_LIMIT })
      .then(({ data }: { data: { name: string }[] | null }) => {
        if (Array.isArray(data)) {
          setNames(data.map((row) => row.name).filter(Boolean));
        }
      });
  }, []);

  if (count === null || count < DISPLAY_THRESHOLD) return null;

  // Duplicated so the CSS animation can scroll exactly one copy's width
  // and loop with no visible seam.
  const marqueeNames = names.length > 0 ? [...names, ...names] : [];

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <div className="flex items-center gap-2 text-sm text-foreground">
        <Users className="w-4 h-4 text-[#dfb15b]" />
        <span>
          <span className="text-[#dfb15b] font-serif font-bold">{count}+</span> readers already on
          the path
        </span>
      </div>

      {marqueeNames.length > 0 && (
        <div
          className="w-full max-w-xl overflow-hidden"
          style={{ maskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)" }}
        >
          <div className="founding-scroll flex gap-3 w-max">
            {marqueeNames.map((n, i) => (
              <span
                key={i}
                className="flex-shrink-0 px-3 py-1.5 rounded-full border border-border-custom bg-white dark:bg-[#101614] text-[10px] uppercase tracking-widest font-semibold text-muted-text"
              >
                {n}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
