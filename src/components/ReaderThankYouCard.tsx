"use client";

// A genuine post-purchase incentive — deliberately not a fabricated
// "first 100 buyers" claim (no way to honestly promise or track that
// here). Just a real, always-deliverable thing: email your order, get a
// personal reply. Ties to the same contact_email already used site-wide,
// and the same "Ketul personally reads every message" promise the
// chatbot already makes.

import React from "react";
import { Mail, Heart } from "lucide-react";
import { useSiteSettings } from "@/context/SiteSettingsContext";

export default function ReaderThankYouCard() {
  const { settings } = useSiteSettings();
  const email = settings.contact_email;

  return (
    <div className="max-w-2xl mx-auto bg-white dark:bg-[#2A3642] border border-[#D6A63C]/30 rounded-3xl p-6 md:p-8 flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left shadow-sm">
      <div className="w-12 h-12 rounded-2xl bg-[#0B2942]/5 dark:bg-[#D6A63C]/10 text-[#D6A63C] flex items-center justify-center flex-shrink-0">
        <Heart className="w-6 h-6" />
      </div>
      <div className="flex-1 space-y-1.5">
        <h4 className="font-serif text-base text-foreground font-semibold">Just Bought Your Copy?</h4>
        <p className="text-xs font-light text-stone-500 dark:text-stone-400 leading-relaxed">
          Email your order confirmation to <span className="font-semibold text-foreground">{email}</span> and
          Ketul will personally write back — plus you&apos;ll be first to hear when the live Q&A is scheduled.
        </p>
      </div>
      <a
        href={`mailto:${email}?subject=${encodeURIComponent("My copy of The Unshaken Self")}`}
        className="flex-shrink-0 inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-[#0B2942] hover:bg-[#071D30] dark:bg-[#D6A63C] dark:hover:bg-[#BC9235] text-white dark:text-black text-[10px] uppercase tracking-widest font-bold whitespace-nowrap transition-transform hover:scale-105"
      >
        <Mail className="w-3.5 h-3.5" />
        <span>Email My Order</span>
      </a>
    </div>
  );
}
