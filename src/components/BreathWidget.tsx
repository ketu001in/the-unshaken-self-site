"use client";

import React, { useEffect, useState } from "react";
import { Pause, Play } from "lucide-react";

type Phase = { name: string; label: string; duration: number; scale: number };

// Classic 4-7-8 pattern: inhale 4s, hold 7s, exhale 8s.
const PHASES: Phase[] = [
  { name: "inhale", label: "Breathe In", duration: 4, scale: 1.35 },
  { name: "hold", label: "Hold", duration: 7, scale: 1.35 },
  { name: "exhale", label: "Breathe Out", duration: 8, scale: 0.85 },
];

export default function BreathWidget() {
  const [running, setRunning] = useState(false);
  const [state, setState] = useState({ index: 0, seconds: PHASES[0].duration });

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setState((prev) => {
        if (prev.seconds <= 1) {
          const nextIndex = (prev.index + 1) % PHASES.length;
          return { index: nextIndex, seconds: PHASES[nextIndex].duration };
        }
        return { ...prev, seconds: prev.seconds - 1 };
      });
    }, 1000);
    return () => clearInterval(id);
  }, [running]);

  const toggleRunning = () => {
    if (!running) {
      setState({ index: 0, seconds: PHASES[0].duration });
    }
    setRunning((r) => !r);
  };

  const phase = PHASES[state.index];

  return (
    <div className="flex flex-col items-center gap-8 py-4">
      <div className="relative w-56 h-56 sm:w-64 sm:h-64 flex items-center justify-center">
        {/* Static outer ring */}
        <div className="absolute inset-0 rounded-full border border-[#dfb15b]/20" />

        {/* Breathing circle — scales over the exact duration of the active phase */}
        <div
          className="absolute rounded-full bg-gradient-to-br from-[#dfb15b]/25 to-[#1e3f20]/10 dark:from-[#dfb15b]/20 dark:to-[#dfb15b]/5 border border-[#dfb15b]/40"
          style={{
            width: "60%",
            height: "60%",
            transform: `scale(${running ? phase.scale : 1})`,
            transition: running ? `transform ${phase.duration}s ease-in-out` : "transform 0.6s ease-out",
          }}
        />

        {/* Center label */}
        <div className="relative z-10 flex flex-col items-center gap-1">
          <span className="text-xs sm:text-sm uppercase tracking-[0.2em] font-semibold text-[#b5924b] dark:text-[#dfb15b]">
            {running ? phase.label : "Ready"}
          </span>
          {running && (
            <span className="text-2xl sm:text-3xl font-serif text-foreground tabular-nums">
              {state.seconds}
            </span>
          )}
        </div>
      </div>

      <button
        onClick={toggleRunning}
        className="flex items-center gap-2 px-6 py-3 rounded-full bg-[#1e3f20] dark:bg-[#dfb15b] hover:opacity-90 text-white dark:text-black text-xs uppercase tracking-widest font-bold shadow-md transition-all cursor-pointer"
      >
        {running ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
        <span>{running ? "Pause" : "Begin Breathing"}</span>
      </button>

      <p className="text-[11px] text-muted-text max-w-xs text-center leading-relaxed">
        The 4-7-8 pattern echoed in Chapter 6 (Dhyana Yoga) — inhale for 4, hold for 7, exhale for 8. A few rounds is enough to settle the nervous system.
      </p>
    </div>
  );
}
