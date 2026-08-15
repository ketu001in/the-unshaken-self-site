"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

type TimeLeft = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

export default function Countdown() {
  const targetDate = new Date("2026-09-04T00:00:00").getTime();
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isMounted, setIsMounted] = useState(false);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    setIsMounted(true);

    const calculateTimeLeft = () => {
      const difference = targetDate - Date.now();

      if (difference <= 0) {
        return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      }

      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    };

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  if (!isMounted) {
    return (
      <div className="flex justify-center space-x-4 md:space-x-8 opacity-50">
        {["Days", "Hours", "Minutes", "Seconds"].map((label, idx) => (
          <div key={idx} className="flex flex-col items-center">
            <div className="text-3xl md:text-5xl font-serif text-primary">--</div>
            <div className="text-[10px] md:text-xs uppercase tracking-widest text-muted-text mt-1">{label}</div>
          </div>
        ))}
      </div>
    );
  }

  const units = [
    { label: "Days", value: timeLeft.days },
    { label: "Hours", value: timeLeft.hours },
    { label: "Minutes", value: timeLeft.minutes },
    { label: "Seconds", value: timeLeft.seconds },
  ];

  return (
    <Link
      href="/events"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="group relative flex flex-col items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-[#dfb15b]/50 rounded-3xl cursor-pointer"
      aria-label="View upcoming launch events"
    >
      {/* Soft glow ring — only visible on hover, sits behind the card */}
      <div
        className={`pointer-events-none absolute -inset-1 rounded-[28px] transition-opacity duration-500 ${
          hovered ? "opacity-100" : "opacity-0"
        }`}
        style={{
          background: "radial-gradient(circle at 50% 30%, rgba(223,177,91,0.35), transparent 70%)",
          filter: "blur(14px)",
        }}
      />

      <div
        className={`glassmorphism relative flex flex-col items-center px-6 py-6 sm:px-10 sm:py-8 rounded-3xl border transition-all duration-500 ease-out ${
          hovered
            ? "border-[#dfb15b]/60 shadow-[0_20px_55px_rgba(223,177,91,0.18)] -translate-y-1.5"
            : "border-border-custom shadow-md"
        }`}
      >
        {/* Live pulse indicator */}
        <div className="flex items-center gap-2 mb-5">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#dfb15b] opacity-60" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#dfb15b]" />
          </span>
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#dfb15b]">
            Pre-Launch Countdown
          </span>
        </div>

        {/* Timer Grid */}
        <div className="flex justify-center space-x-4 md:space-x-8 select-none">
          {units.map((item, idx) => (
            <div key={idx} className="flex flex-col items-center relative">
              <div
                className="w-16 h-20 md:w-24 md:h-28 rounded-lg flex items-center justify-center border bg-white/60 dark:bg-black/30 shadow-lg transition-all duration-500 ease-out"
                style={{
                  transitionDelay: hovered ? `${idx * 60}ms` : "0ms",
                  transform: hovered ? "translateY(-4px) scale(1.05)" : "translateY(0) scale(1)",
                  borderColor: hovered ? "rgba(223,177,91,0.5)" : "var(--border-color)",
                }}
              >
                <span className="text-3xl md:text-5xl font-serif text-[#dfb15b] font-medium tracking-tight tabular-nums">
                  {String(item.value).padStart(2, "0")}
                </span>
              </div>

              {/* Small Label below Card */}
              <span className="text-[10px] md:text-xs uppercase tracking-[0.2em] text-muted-text mt-2 font-medium">
                {item.label}
              </span>

              {/* Separator dots (except last) */}
              {idx < 3 && (
                <div className="hidden sm:flex absolute -right-3 md:-right-5 top-1/3 text-primary text-xl font-bold opacity-30 select-none animate-pulse">
                  :
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Subtitle / Focus message */}
        <p className="mt-8 text-center text-xs md:text-sm text-stone-400 font-light max-w-md tracking-wider">
          Launching on the auspicious eve of <span className="text-[#dfb15b] font-medium">Krishna Janmashtami 2026</span>
        </p>

        {/* CTA — fades/slides in on hover */}
        <div
          className={`flex items-center gap-1.5 mt-4 text-[11px] font-semibold uppercase tracking-widest transition-all duration-300 ${
            hovered ? "opacity-100 translate-y-0 text-[#dfb15b]" : "opacity-0 translate-y-1 text-muted-text"
          }`}
        >
          <span>View Launch Events</span>
          <ArrowRight className={`w-3.5 h-3.5 transition-transform duration-300 ${hovered ? "translate-x-1" : ""}`} />
        </div>
      </div>
    </Link>
  );
}
