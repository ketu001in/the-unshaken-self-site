"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { ShoppingBag, X, Sparkles, Truck } from "lucide-react";
import { useSiteSettings } from "@/context/SiteSettingsContext";
import { AmazonLogo, NotionPressLogo, FlipkartLogo } from "./StoreLogos";

type BuyNowButtonProps = {
  fullWidth?: boolean;
  onOpen?: () => void;
  // When true, the modal opens itself as soon as this instance mounts —
  // used once on the homepage so the store list is the first thing a
  // visitor sees, without duplicating a second visible trigger button.
  autoOpen?: boolean;
  // When true, only the modal (and its portal) render — no trigger
  // button — so the homepage's auto-open instance stays invisible and
  // the single navbar button remains the only visible CTA.
  hideTrigger?: boolean;
};

export default function BuyNowButton({ fullWidth = false, onOpen, autoOpen = false, hideTrigger = false }: BuyNowButtonProps) {
  const { settings } = useSiteSettings();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

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

  const editions = [
    { label: "Paperback", price: settings.price_paperback, npLink: settings.buy_link_notionpress_paperback, amazonLink: settings.buy_link_amazon_paperback, flipkartLink: settings.buy_link_flipkart_paperback },
    { label: "Hardcover", price: settings.price_hardcover, npLink: settings.buy_link_notionpress_hardcover, amazonLink: settings.buy_link_amazon_hardcover, flipkartLink: settings.buy_link_flipkart_hardcover },
  ];

  // Rendered via a portal straight to document.body — this component gets
  // nested inside cards elsewhere on the site (e.g. Countdown) that apply a
  // CSS transform on hover. A transformed ancestor becomes the containing
  // block for any `position: fixed` descendant, which silently breaks a
  // normal fixed-overlay modal. Portaling sidesteps that regardless of
  // where this component is mounted.
  const modal = open && (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-label="Buy The Unshaken Self"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => setOpen(false)}
      />

      <div className="relative w-full max-w-md my-auto max-h-[92vh] overflow-y-auto bg-white dark:bg-[#101614] border border-border-custom rounded-3xl shadow-2xl p-6 sm:p-8 space-y-6 animate-[fadeIn_0.2s_ease-out]">
        <button
          onClick={() => setOpen(false)}
          className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-muted-text hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer z-10"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="space-y-2 pr-8">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[12px] tracking-[0.3em] text-[#b5924b] dark:text-[#dfb15b] uppercase font-bold">
              The Unshaken Self
            </span>
            <span className="text-[11px] uppercase tracking-widest font-bold text-white bg-[#1e3f20] dark:bg-[#dfb15b] dark:text-black px-2 py-0.5 rounded-full">
              Available Now
            </span>
          </div>
          <h3 className="font-serif text-xl text-foreground">Choose Your Edition</h3>
        </div>

        {/* Notion Press — Author's Pick */}
        <div className="rounded-2xl border-2 border-[#dfb15b]/50 bg-[#faf8f5] dark:bg-[#070b09] p-4 sm:p-5 space-y-3">
          <div className="flex items-center gap-3">
            <NotionPressLogo className="w-9 h-9 flex-shrink-0" />
            <div>
              <p className="text-sm font-serif text-foreground font-semibold">Notion Press</p>
              <span className="inline-flex items-center gap-1 text-[11px] uppercase tracking-widest font-bold text-[#b5924b] dark:text-[#dfb15b]">
                <Sparkles className="w-3 h-3" />
                Author&apos;s Recommended Store
              </span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            {editions.map((ed) =>
              ed.npLink ? (
                <a
                  key={`np-${ed.label}`}
                  href={ed.npLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center justify-center gap-0.5 py-3 rounded-xl bg-[#1e3f20] hover:bg-[#142a15] dark:bg-[#dfb15b] dark:hover:bg-[#c49945] text-white dark:text-black transition-transform hover:scale-105"
                >
                  <span className="text-[12px] uppercase tracking-widest font-bold">{ed.label}</span>
                  <span className="text-sm font-serif font-bold">{ed.price}</span>
                </a>
              ) : null
            )}
          </div>
        </div>

        {/* Amazon */}
        <div className="rounded-2xl border border-border-custom p-4 sm:p-5 space-y-3">
          <div className="flex items-center gap-3">
            <AmazonLogo className="w-9 h-9 flex-shrink-0" />
            <div>
              <p className="text-sm font-serif text-foreground font-semibold">Amazon.in</p>
              <span className="inline-flex items-center gap-1 text-[11px] uppercase tracking-widest font-bold text-[#00A8E1]">
                <Truck className="w-3 h-3" />
                Now on Amazon Prime
              </span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            {editions.map((ed) =>
              ed.amazonLink ? (
                <a
                  key={`amz-${ed.label}`}
                  href={ed.amazonLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center justify-center gap-0.5 py-3 rounded-xl border border-border-custom hover:bg-black/5 dark:hover:bg-white/5 text-foreground transition-transform hover:scale-105"
                >
                  <span className="text-[12px] uppercase tracking-widest font-bold">{ed.label}</span>
                  <span className="text-sm font-serif font-bold">{ed.price}</span>
                </a>
              ) : null
            )}
          </div>
        </div>

        {/* Flipkart */}
        <div className="rounded-2xl border border-border-custom p-4 sm:p-5 space-y-3">
          <div className="flex items-center gap-3">
            <FlipkartLogo className="w-9 h-9 flex-shrink-0" />
            <p className="text-sm font-serif text-foreground font-semibold">Flipkart</p>
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            {editions.map((ed) =>
              ed.flipkartLink ? (
                <a
                  key={`fk-${ed.label}`}
                  href={ed.flipkartLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center justify-center gap-0.5 py-3 rounded-xl border border-border-custom hover:bg-black/5 dark:hover:bg-white/5 text-foreground transition-transform hover:scale-105"
                >
                  <span className="text-[12px] uppercase tracking-widest font-bold">{ed.label}</span>
                  <span className="text-sm font-serif font-bold">{ed.price}</span>
                </a>
              ) : null
            )}
          </div>
        </div>

        <p className="text-[12px] text-center text-muted-text">
          Prices inclusive of all taxes. Delivered by each store directly.
        </p>
      </div>
    </div>
  );

  return (
    <>
      {!hideTrigger && (
        <button
          onClick={handleTrigger}
          className={`relative inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-gradient-to-r from-[#1e3f20] to-[#142a15] dark:from-[#dfb15b] dark:to-[#c49945] text-white dark:text-black text-[14px] whitespace-nowrap uppercase tracking-widest font-bold shadow-lg shadow-[#1e3f20]/20 dark:shadow-[#dfb15b]/25 hover:shadow-xl transition-all hover:scale-105 active:scale-95 cursor-pointer ${
            fullWidth ? "w-full justify-center" : ""
          }`}
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>Buy Now</span>
        </button>
      )}

      {mounted && modal ? createPortal(modal, document.body) : null}
    </>
  );
}
