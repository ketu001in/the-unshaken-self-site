"use client";

import React, { useEffect, useState } from "react";
import { BookOpen, Clock, ShoppingCart, X, Zap } from "lucide-react";
import { useSiteSettings } from "@/context/SiteSettingsContext";

type Store = {
  name: string;
  badge?: string;
  href: string | null;
  accent: string;
};

type BuyNowButtonProps = {
  fullWidth?: boolean;
  onOpen?: () => void;
};

export default function BuyNowButton({ fullWidth = false, onOpen }: BuyNowButtonProps) {
  const [open, setOpen] = useState(false);
  const { settings } = useSiteSettings();

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
    { name: "Amazon", href: settings.buy_link_amazon, accent: "#ff9900" },
    { name: "Flipkart", href: settings.buy_link_flipkart, accent: "#2874f0" },
    { name: "ZiffyBee", badge: "Fastest Delivery", href: settings.buy_link_ziffybee, accent: "#dfb15b" },
  ];

  return (
    <>
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
        <span>Buy Now</span>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Buy Now — choose a store"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />

          {/* Modal card */}
          <div className="relative w-full max-w-md bg-white dark:bg-[#101614] border border-border-custom rounded-3xl shadow-2xl p-6 sm:p-8 space-y-6 animate-[fadeIn_0.2s_ease-out]">
            <button
              onClick={() => setOpen(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-muted-text hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-1.5 pr-8">
              <span className="text-[10px] tracking-[0.3em] text-[#d64545] uppercase font-bold">
                The Unshaken Self
              </span>
              <h3 className="font-serif text-xl text-foreground">Choose Where to Buy</h3>
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
                        {store.badge && (
                          <span className="inline-flex items-center gap-1 text-[9px] uppercase tracking-widest font-bold text-[#dfb15b]">
                            <Zap className="w-2.5 h-2.5" />
                            {store.badge}
                          </span>
                        )}
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

                return isLive ? (
                  <a
                    key={store.name}
                    href={store.href!}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-between px-4 py-3.5 rounded-2xl border border-border-custom hover:border-[#d64545]/50 hover:bg-[#d64545]/5 transition-colors cursor-pointer"
                  >
                    {content}
                  </a>
                ) : (
                  <div
                    key={store.name}
                    aria-disabled="true"
                    className="w-full flex items-center justify-between px-4 py-3.5 rounded-2xl border border-dashed border-border-custom opacity-60 cursor-not-allowed"
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
      )}
    </>
  );
}
