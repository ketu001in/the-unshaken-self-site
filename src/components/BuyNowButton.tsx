"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { BookOpen, CalendarClock, X } from "lucide-react";
import { useSiteSettings } from "@/context/SiteSettingsContext";

type BuyNowButtonProps = {
  fullWidth?: boolean;
  onOpen?: () => void;
  // When true, the modal opens itself as soon as this instance mounts —
  // used once on the homepage so the closure notice is the first thing a
  // visitor sees, without duplicating a second visible trigger button.
  autoOpen?: boolean;
  // When true, only the modal (and its portal) render — no trigger
  // button — so the homepage's auto-open instance stays invisible and
  // the single red navbar button remains the only visible CTA.
  hideTrigger?: boolean;
};

// Early access has closed — the three store links (Amazon, Flipkart,
// ZiffyBee) have been pulled from the whole site. This component now
// exists purely to communicate that clearly, wherever it's mounted
// (navbar, Countdown card, homepage auto-open).
const CLOSED_MESSAGE =
  "Early Access window is closed & Book will be available to Order from 5th September 2026";

export default function BuyNowButton({ fullWidth = false, onOpen, autoOpen = false, hideTrigger = false }: BuyNowButtonProps) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { settings } = useSiteSettings();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (autoOpen) setOpen(true);
  }, [autoOpen]);

  const handleTrigger = () => {
    setOpen(true);
    onOpen?.();
  };

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  // Rendered via a portal straight to document.body — this component gets
  // nested inside cards elsewhere on the site (e.g. Countdown) that apply a
  // CSS transform on hover. A transformed ancestor becomes the containing
  // block for any `position: fixed` descendant, which silently breaks a
  // normal fixed-overlay modal (wrong position, wrong size, feels like it's
  // "flickering" as hover states toggle). Portaling sidesteps that
  // regardless of where this component is mounted.
  const modal = open && (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-label="Early access closed"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => setOpen(false)}
      />

      <div className="relative w-full max-w-md my-auto max-h-[85vh] overflow-y-auto bg-white dark:bg-[#101614] border border-border-custom rounded-3xl shadow-2xl p-6 sm:p-8 space-y-6 animate-[fadeIn_0.2s_ease-out]">
        <button
          onClick={() => setOpen(false)}
          className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-muted-text hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="space-y-2 pr-8">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] tracking-[0.3em] text-[#d64545] uppercase font-bold">
              The Unshaken Self
            </span>
            <span className="text-[9px] uppercase tracking-widest font-bold text-white bg-stone-500 px-2 py-0.5 rounded-full">
              Closed
            </span>
          </div>
          <h3 className="font-serif text-xl text-foreground">Early Access Has Closed</h3>
        </div>

        <div className="flex flex-col items-center gap-3 py-6 px-5 rounded-2xl bg-[#faf8f5] dark:bg-[#070b09] border border-[#dfb15b]/30 text-center">
          <CalendarClock className="w-6 h-6 text-[#dfb15b]" />
          <p className="text-sm text-foreground font-medium leading-relaxed">
            {CLOSED_MESSAGE}
          </p>
        </div>

        <div className="pt-4 border-t border-border-custom/50 flex items-center gap-2 text-[10px] text-muted-text">
          <BookOpen className="w-3.5 h-3.5 text-[#dfb15b] flex-shrink-0" />
          <span>Published by {settings.publisher_name}</span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {!hideTrigger && (
        <button
          onClick={handleTrigger}
          className={`relative inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-gradient-to-r from-[#d64545] to-[#b02e2e] text-white text-[12px] whitespace-nowrap uppercase tracking-widest font-bold shadow-lg shadow-[#d64545]/25 hover:shadow-xl hover:shadow-[#d64545]/35 transition-all hover:scale-105 active:scale-95 cursor-pointer ${
            fullWidth ? "w-full justify-center" : ""
          }`}
        >
          <CalendarClock className="w-3.5 h-3.5" />
          <span>Ordering Opens 5 Sept 2026</span>
        </button>
      )}

      {mounted && modal ? createPortal(modal, document.body) : null}
    </>
  );
}
