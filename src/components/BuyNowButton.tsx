"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { ShoppingBag, X, Sparkles, Truck, Globe2 } from "lucide-react";
import { useSiteSettings, type SiteSettings } from "@/context/SiteSettingsContext";
import { AmazonLogo, NotionPressLogo, FlipkartLogo } from "./StoreLogos";
import { playClick } from "@/lib/sound";

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

type Region = "in" | "us" | "ca" | "au";

// Amazon is live on the same two ASINs across all four regions — this
// picker is what keeps four regions' worth of links from stacking the
// modal past a usable height: only the selected region's Amazon card
// content is rendered, everything else swaps under it.
const REGIONS: { key: Region; flag: string; label: string; domain: string }[] = [
  { key: "in", flag: "🇮🇳", label: "India", domain: "Amazon.in" },
  { key: "us", flag: "🇺🇸", label: "United States", domain: "Amazon.com" },
  { key: "ca", flag: "🇨🇦", label: "Canada", domain: "Amazon.ca" },
  { key: "au", flag: "🇦🇺", label: "Australia", domain: "Amazon.com.au" },
];

function amazonEditionsFor(region: Region, settings: SiteSettings) {
  switch (region) {
    case "us":
      return [
        { label: "Paperback", price: settings.price_paperback_us, link: settings.buy_link_amazon_us_paperback },
        { label: "Hardcover", price: settings.price_hardcover_us, link: settings.buy_link_amazon_us_hardcover },
      ];
    case "ca":
      return [
        { label: "Paperback", price: settings.price_paperback_ca, link: settings.buy_link_amazon_ca_paperback },
        { label: "Hardcover", price: settings.price_hardcover_ca, link: settings.buy_link_amazon_ca_hardcover },
      ];
    case "au":
      return [
        { label: "Paperback", price: settings.price_paperback_au, link: settings.buy_link_amazon_au_paperback },
        { label: "Hardcover", price: settings.price_hardcover_au, link: settings.buy_link_amazon_au_hardcover },
      ];
    case "in":
    default:
      return [
        { label: "Paperback", price: settings.price_paperback, link: settings.buy_link_amazon_paperback },
        { label: "Hardcover", price: settings.price_hardcover, link: settings.buy_link_amazon_hardcover },
      ];
  }
}

export default function BuyNowButton({ fullWidth = false, onOpen, autoOpen = false, hideTrigger = false }: BuyNowButtonProps) {
  const { settings } = useSiteSettings();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [region, setRegion] = useState<Region>("in");

  useEffect(() => {
    // Hydration guard — real value only settles client-side.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  useEffect(() => {
    // autoOpen is a prop set once by the parent (the homepage's single
    // auto-opening instance) — not state this component owns, so syncing
    // it into local `open` here is the correct pattern, not a loop risk.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (autoOpen) setOpen(true);
  }, [autoOpen]);

  const handleTrigger = () => {
    playClick();
    setOpen(true);
    onOpen?.();
  };

  const handleClose = () => {
    playClick();
    setOpen(false);
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

  const npEditions = [
    { label: "Paperback", price: settings.price_paperback, link: settings.buy_link_notionpress_paperback },
    { label: "Hardcover", price: settings.price_hardcover, link: settings.buy_link_notionpress_hardcover },
  ];
  const flipkartEditions = [
    { label: "Paperback", price: settings.price_paperback, link: settings.buy_link_flipkart_paperback },
    { label: "Hardcover", price: settings.price_hardcover, link: settings.buy_link_flipkart_hardcover },
  ];
  const amazonEditions = amazonEditionsFor(region, settings);
  const selectedRegion = REGIONS.find((r) => r.key === region) ?? REGIONS[0];

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
        onClick={handleClose}
      />

      {/* Font sizes below are deliberately set as fixed px values rather
          than the site's bumped text-xs/sm/base tokens. The Amazon region
          picker (India/US/Canada/Australia) keeps only one region's links
          on screen at a time, which is what keeps this modal compact even
          with four regions' worth of options behind it — but the fixed,
          smaller px scale is still what keeps everything fully visible on
          laptop screens without relying on internal scrolling. */}
      <div className="relative w-full max-w-md my-auto max-h-[92vh] overflow-y-auto bg-white dark:bg-[#101614] border border-border-custom rounded-3xl shadow-2xl p-5 sm:p-6 space-y-3.5 animate-[fadeIn_0.2s_ease-out]">
        <button
          onClick={handleClose}
          className="absolute top-3.5 right-3.5 w-7 h-7 rounded-full flex items-center justify-center text-muted-text hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer z-10"
          aria-label="Close"
        >
          <X className="w-3.5 h-3.5" />
        </button>

        <div className="space-y-1 pr-7">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[8px] tracking-[0.25em] text-[#b5924b] dark:text-[#dfb15b] uppercase font-bold">
              The Unshaken Self
            </span>
            <span className="text-[7px] uppercase tracking-widest font-bold text-white bg-[#1e3f20] dark:bg-[#dfb15b] dark:text-black px-1.5 py-0.5 rounded-full">
              Available Now
            </span>
          </div>
          <h3 className="font-serif text-[15px] text-foreground">Choose Your Edition</h3>
        </div>

        {/* Amazon ships worldwide, so this flashes to catch the eye of
            visitors from outside the four regions listed below. */}
        <div className="flex justify-center">
          <span className="now-live-flash inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[8px] uppercase tracking-widest font-bold">
            <Globe2 className="w-2.5 h-2.5" />
            Available in 130+ Countries
          </span>
        </div>

        {/* Notion Press — Author's Pick (direct-from-publisher, India +
            international shipping — the one store that isn't region-split) */}
        <div className="rounded-xl border-2 border-[#dfb15b]/50 bg-[#faf8f5] dark:bg-[#070b09] p-3 space-y-2">
          <div className="flex items-center gap-2.5">
            <NotionPressLogo className="w-7 h-7 flex-shrink-0" />
            <div>
              <p className="text-[11px] font-serif text-foreground font-semibold leading-tight">Notion Press</p>
              <span className="inline-flex items-center gap-1 text-[7px] uppercase tracking-widest font-bold text-[#b5924b] dark:text-[#dfb15b]">
                <Sparkles className="w-2.5 h-2.5" />
                Author&apos;s Recommended Store
              </span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {npEditions.map((ed) =>
              ed.link ? (
                <a
                  key={`np-${ed.label}`}
                  href={ed.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={playClick}
                  className="flex flex-col items-center justify-center gap-0.5 py-2 rounded-lg bg-[#1e3f20] hover:bg-[#142a15] dark:bg-[#dfb15b] dark:hover:bg-[#c49945] text-white dark:text-black transition-transform hover:scale-105"
                >
                  <span className="text-[8px] uppercase tracking-widest font-bold">{ed.label}</span>
                  <span className="text-[11px] font-serif font-bold">{ed.price}</span>
                </a>
              ) : null
            )}
          </div>
        </div>

        {/* Amazon — region-aware. Pick a region, its Paperback/Hardcover
            links + native price swap in below like a submenu. */}
        <div className="rounded-xl border border-border-custom p-3 space-y-2.5">
          <div className="flex items-center gap-2.5">
            <AmazonLogo className="w-7 h-7 flex-shrink-0" />
            <div>
              <p className="text-[11px] font-serif text-foreground font-semibold leading-tight">{selectedRegion.domain}</p>
              {region === "in" && (
                <span className="inline-flex items-center gap-1 text-[7px] uppercase tracking-widest font-bold text-[#00A8E1]">
                  <Truck className="w-2.5 h-2.5" />
                  Now on Amazon Prime
                </span>
              )}
            </div>
          </div>

          <label className="flex items-center gap-1.5 text-[7px] uppercase tracking-widest font-bold text-muted-text">
            <Globe2 className="w-2.5 h-2.5" />
            Ship to
          </label>
          <select
            value={region}
            onChange={(e) => setRegion(e.target.value as Region)}
            className="w-full text-[11px] font-semibold bg-stone-50 dark:bg-[#070b09] border border-border-custom rounded-lg px-2.5 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-[#dfb15b]/40 cursor-pointer"
          >
            {REGIONS.map((r) => (
              <option key={r.key} value={r.key}>
                {r.flag} {r.label}
              </option>
            ))}
          </select>

          <div className="grid grid-cols-2 gap-2">
            {amazonEditions.map((ed) =>
              ed.link ? (
                <a
                  key={`amz-${region}-${ed.label}`}
                  href={ed.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={playClick}
                  className="flex flex-col items-center justify-center gap-0.5 py-2 rounded-lg border border-border-custom hover:bg-black/5 dark:hover:bg-white/5 text-foreground transition-transform hover:scale-105"
                >
                  <span className="text-[8px] uppercase tracking-widest font-bold">{ed.label}</span>
                  <span className="text-[11px] font-serif font-bold">{ed.price}</span>
                </a>
              ) : (
                <div
                  key={`amz-${region}-${ed.label}-soon`}
                  className="flex flex-col items-center justify-center gap-0.5 py-2 rounded-lg border border-dashed border-border-custom text-muted-text"
                >
                  <span className="text-[8px] uppercase tracking-widest font-bold">{ed.label}</span>
                  <span className="text-[9px]">Coming soon</span>
                </div>
              )
            )}
          </div>
        </div>

        {/* Flipkart — India only */}
        {region === "in" && (
          <div className="rounded-xl border border-border-custom p-3 space-y-2">
            <div className="flex items-center gap-2.5">
              <FlipkartLogo className="w-7 h-7 flex-shrink-0" />
              <p className="text-[11px] font-serif text-foreground font-semibold leading-tight">Flipkart</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {flipkartEditions.map((ed) =>
                ed.link ? (
                  <a
                    key={`fk-${ed.label}`}
                    href={ed.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={playClick}
                    className="flex flex-col items-center justify-center gap-0.5 py-2 rounded-lg border border-border-custom hover:bg-black/5 dark:hover:bg-white/5 text-foreground transition-transform hover:scale-105"
                  >
                    <span className="text-[8px] uppercase tracking-widest font-bold">{ed.label}</span>
                    <span className="text-[11px] font-serif font-bold">{ed.price}</span>
                  </a>
                ) : null
              )}
            </div>
          </div>
        )}

        <p className="text-[8px] text-center text-muted-text">
          Prices inclusive of all taxes. Delivered by each store directly.
        </p>
        <p className="text-[11px] text-center text-muted-text font-bold">
          If your country is not listed here, please search on Amazon of your country / region
          for this book title.
        </p>
      </div>
    </div>
  );

  return (
    <>
      {!hideTrigger && (
        <button
          onClick={handleTrigger}
          className={`relative inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-gradient-to-r from-[#1e3f20] to-[#142a15] dark:from-[#dfb15b] dark:to-[#c49945] text-white dark:text-black text-[12px] whitespace-nowrap uppercase tracking-widest font-bold shadow-lg shadow-[#1e3f20]/20 dark:shadow-[#dfb15b]/25 hover:shadow-xl transition-all hover:scale-105 active:scale-95 cursor-pointer ${
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
