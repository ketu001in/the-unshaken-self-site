"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, CalendarPlus, ChevronDown, Users } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type TimeLeft = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

const LAUNCH_DATE_ICS = "20260904";
const LAUNCH_DATE_ICS_END = "20260905"; // exclusive, per iCal all-day convention
const LAUNCH_TITLE = "The Unshaken Self — Book Launch";
const LAUNCH_DETAILS =
  "Launching on the auspicious eve of Krishna Janmashtami 2026.";
const EVENTS_URL = "https://the-unshaken-self-site-hcp1.vercel.app/events";

// Below this, a real signup count reads as sparse rather than as social
// proof — show a neutral aspirational line instead until it's meaningful.
const WAITLIST_DISPLAY_THRESHOLD = 5;

function buildGoogleCalendarUrl() {
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: LAUNCH_TITLE,
    dates: `${LAUNCH_DATE_ICS}/${LAUNCH_DATE_ICS_END}`,
    details: LAUNCH_DETAILS,
    location: EVENTS_URL,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

function buildIcsContent() {
  const stamp = new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//The Unshaken Self//Launch//EN",
    "BEGIN:VEVENT",
    "UID:unshaken-self-launch-2026@theunshakenself.com",
    `DTSTAMP:${stamp}`,
    `DTSTART;VALUE=DATE:${LAUNCH_DATE_ICS}`,
    `DTEND;VALUE=DATE:${LAUNCH_DATE_ICS_END}`,
    `SUMMARY:${LAUNCH_TITLE}`,
    `DESCRIPTION:${LAUNCH_DETAILS} ${EVENTS_URL}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

export default function Countdown() {
  const targetDate = new Date("2026-09-04T00:00:00").getTime();
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isMounted, setIsMounted] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [waitlistCount, setWaitlistCount] = useState<number | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

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

  useEffect(() => {
    const supabase = createClient();
    supabase
      .rpc("waitlist_count")
      .then(({ data, error }: { data: number | null; error: unknown }) => {
        if (!error && typeof data === "number") {
          setWaitlistCount(data);
        }
      });
  }, []);

  // Close the calendar dropdown on outside click.
  useEffect(() => {
    if (!menuOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  const goToEvents = () => router.push("/events");

  const handleCardKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      goToEvents();
    }
  };

  const handleDownloadIcs = (e: React.MouseEvent) => {
    e.stopPropagation();
    const blob = new Blob([buildIcsContent()], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "the-unshaken-self-launch.ics";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setMenuOpen(false);
  };

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

  const showWaitlistCount = waitlistCount !== null && waitlistCount >= WAITLIST_DISPLAY_THRESHOLD;

  return (
    <div
      role="link"
      tabIndex={0}
      onClick={goToEvents}
      onKeyDown={handleCardKeyDown}
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

        {/* Social proof — only once the number is meaningful */}
        <div className="flex items-center gap-1.5 mt-3 text-[11px] text-muted-text">
          <Users className="w-3.5 h-3.5 text-[#dfb15b]" />
          <span>
            {showWaitlistCount
              ? `${waitlistCount}+ readers already notified`
              : "Be among the first to get notified"}
          </span>
        </div>

        {/* Add to Calendar — stops propagation so it never triggers the card's own navigation */}
        <div ref={menuRef} className="relative mt-4" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-border-custom text-[10px] uppercase tracking-widest font-semibold text-foreground hover:border-[#dfb15b]/60 hover:text-[#dfb15b] transition-colors cursor-pointer"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
          >
            <CalendarPlus className="w-3.5 h-3.5" />
            <span>Add to Calendar</span>
            <ChevronDown className={`w-3 h-3 transition-transform ${menuOpen ? "rotate-180" : ""}`} />
          </button>

          {menuOpen && (
            <div
              role="menu"
              className="absolute left-1/2 -translate-x-1/2 mt-2 w-48 rounded-xl border border-border-custom bg-white dark:bg-[#101614] shadow-xl overflow-hidden z-20"
            >
              <a
                href={buildGoogleCalendarUrl()}
                target="_blank"
                rel="noopener noreferrer"
                role="menuitem"
                onClick={() => setMenuOpen(false)}
                className="block px-4 py-2.5 text-xs text-foreground hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              >
                Google Calendar
              </a>
              <button
                type="button"
                role="menuitem"
                onClick={handleDownloadIcs}
                className="w-full text-left px-4 py-2.5 text-xs text-foreground hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
              >
                Apple / Outlook (.ics)
              </button>
            </div>
          )}
        </div>

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
    </div>
  );
}
