"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { BookOpen, Clock, ShoppingCart, Sparkles, X, Zap } from "lucide-react";
import { useSiteSettings } from "@/context/SiteSettingsContext";

type Store = {
  name: string;
  badge?: string;
  href: string | null;
  accent: string;
  recommended?: boolean;
};

type BuyNowButtonProps = {
  fullWidth?: boolean;
  onOpen?: () => void;
  // When true, the modal opens itself as soon as this instance mounts —
  // used once on the homepage so Buy Now is the first thing a visitor
  // sees, without duplicating a second visible trigger button.
  autoOpen?: boolean;
  // When true, only the modal (and its portal) render — no trigger
  // button — so the homepage's auto-open instance stays invisible and
  // the single red navbar button remains the only visible CTA.
  hideTrigger?: boolean;
};

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

  const stores: Store[] = [
    {
      name: "ZiffyBee",
      badge: "Fastest Delivery",
      href: settings.buy_link_ziffybee,
      accent: "#dfb15b",
      recommended: true,
    },
    { name: "Amazon", href: settings.buy_link_amazon, accent: "#ff9900" },
    { name: "Flipkart", href: settings.buy_link_flipkart, accent: "#2874f0" },
  ];

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
      aria-label="Early access — get your copy now"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => setOpen(false)}
      />

      {/* Modal card — capped height + its own scroll so tall content
          (badges, note, three store rows) never gets stranded off-screen
          with no way to reach it, since the page behind is scroll-locked
          while the modal is open. */}
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
            <span className="text-[9px] uppercase tracking-widest font-bold text-white bg-[#d64545] px-2 py-0.5 rounded-full">
              Early Access
            </span>
          </div>
          <h3 className="font-serif text-xl text-foreground">Get Your Copy Now</h3>
        </div>

        {/* Static note replacing the countdown here — buying is open now,
            ahead of the official launch date shown on the Countdown
            widget elsewhere on the site. */}
        <div className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-[#faf8f5] dark:bg-[#070b09] border border-border-custom text-center">
          <span className="text-[10px] text-muted-text leading-relaxed">
            You have early access — official launch is{" "}
            <span className="text-[#dfb15b] font-semibold">September 4, 2026</span>.
          </span>
        </div>

        <div className="space-y-3">
          {stores.map((store) => {
            const isLive = Boolean(store.href);
            const content = (
              <>
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${store.accent}1a`, color: store.accent }}
                  >
                    <ShoppingCart className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-foreground">{store.name}</p>
                    <div className="flex items-center gap-2 flex-wrap">
                      {store.recommended && (
                        <span className="inline-flex items-center gap-1 text-[9px] uppercase tracking-widest font-bold text-white bg-[#dfb15b] px-1.5 py-0.5 rounded-full">
                          <Sparkles className="w-2.5 h-2.5" />
                          Author&apos;s Recommendation
                        </span>
                      )}
                      {store.badge && (
                        <span className="inline-flex items-center gap-1 text-[9px] uppercase tracking-widest font-bold text-[#dfb15b]">
                          <Zap className="w-2.5 h-2.5" />
                          {store.badge}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                {isLive ? (
                  <span className="text-[10px] uppercase tracking-widest font-bold text-[#1e3f20] dark:text-[#dfb15b]">
                    Buy →
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-[9px] uppercase tracking-widest font-bold text-muted-text">
                    <Clock className="w-3 h-3" />
                    Coming Soon
                  </span>
                )}
              </>
            );

            const recommendedIdle = store.recommended
              ? "border-2 border-[#dfb15b] bg-[#dfb15b]/5 shadow-md shadow-[#dfb15b]/10"
              : "border border-border-custom";

            return isLive ? (
              <a
                key={store.name}
                href={store.href!}
                target="_blank"
                rel="noopener noreferrer"
                className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl transition-colors cursor-pointer hover:border-[#d64545]/50 hover:bg-[#d64545]/5 ${recommendedIdle}`}
              >
                {content}
              </a>
            ) : (
              <div
                key={store.name}
                aria-disabled="true"
                className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl cursor-not-allowed ${
                  store.recommended
                    ? "border-2 border-dashed border-[#dfb15b]/70 bg-[#dfb15b]/5"
                    : "border border-dashed border-border-custom opacity-60"
                }`}
              >
                {content}
              </div>
            );
          })}
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
          className={`relative inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-gradient-to-r from-[#d64545] to-[#b02e2e] text-white text-xs uppercase tracking-widest font-bold shadow-lg shadow-[#d64545]/25 hover:shadow-xl hover:shadow-[#d64545]/35 transition-all hover:scale-105 active:scale-95 cursor-pointer ${
            fullWidth ? "w-full justify-center" : ""
          }`}
        >
          <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-70" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white" />
          </span>
          <ShoppingCart className="w-3.5 h-3.5" />
          <span>Early Access - Get a Copy Now</span>
        </button>
      )}

      {mounted && modal ? createPortal(modal, document.body) : null}
    </>
  );
}
