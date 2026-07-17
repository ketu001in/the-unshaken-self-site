"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AIChatbot from "@/components/AIChatbot";
import Countdown from "@/components/Countdown";
import { Check, Bell } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { fetchPageContent } from "@/lib/content";

type PreorderStore = {
  name: string;
  format: string;
  region: string;
  status: string;
  isPopular: boolean;
  features: string[];
};

type PreorderContent = {
  header_subtitle: string;
  stores: PreorderStore[];
};

const DEFAULT_PREORDER_CONTENT: PreorderContent = {
  header_subtitle: "The book isn't listed for sale yet, and final pricing hasn't been confirmed. Join the notify list below for your preferred store and we'll email you the moment pre-orders open — plus a bundle of digital resources and live workshop credentials.",
  stores: [
    {
      name: "Amazon Kindle & Hardback",
      format: "Kindle / Hardcover",
      region: "Global Store",
      status: "Coming Soon",
      isPopular: false,
      features: ["Chapter 1 digital preview instantly.", "Vedic Reflection Sheets download."]
    },
    {
      name: "Flipkart Paperback",
      format: "Paperback Edition",
      region: "India Only",
      status: "Coming Soon",
      isPopular: false,
      features: ["Chapter 1 digital preview instantly.", "Vedic Reflection Sheets download."]
    },
    {
      name: "Publisher Direct Deluxe Bundle",
      format: "Hardcover + Audio + PDFs",
      region: "International Shipping",
      status: "Coming Soon",
      isPopular: true,
      features: [
        "Chapter 1 digital preview instantly.",
        "Vedic Reflection Sheets download.",
        "Simulated Audiobook CD/MP3 access.",
        "Invite to live launch session."
      ]
    }
  ]
};

export default function PreorderPage() {
  const [content, setContent] = useState<PreorderContent>(DEFAULT_PREORDER_CONTENT);
  const [waitlistEmail, setWaitlistEmail] = useState("");
  const [waitlistStore, setWaitlistStore] = useState("");
  const [waitlistMsg, setWaitlistMsg] = useState("");
  const [waitlisted, setWaitlisted] = useState(false);

  useEffect(() => {
    fetchPageContent("preorder", DEFAULT_PREORDER_CONTENT).then(setContent);
  }, []);

  const handleJoinWaitlist = async (storeName: string) => {
    setWaitlistStore(storeName);
    const el = document.getElementById("waitlist-form");
    el?.scrollIntoView({ behavior: "smooth" });
  };

  const handleWaitlistSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!waitlistEmail.trim()) return;

    const supabase = createClient();
    const { error } = await supabase.from("preorder_waitlist").insert({
      email: waitlistEmail.trim(),
      preferred_store: waitlistStore || "Any",
    });

    if (error && !error.message.includes("duplicate")) {
      setWaitlistMsg("Something went wrong — please try again.");
      return;
    }

    setWaitlisted(true);
    setWaitlistMsg("You're on the list! We'll email you the moment pre-orders go live.");
    setWaitlistEmail("");
  };

  const stores = content.stores;

  return (
    <div className="flex-1 flex flex-col pt-16 bg-[#faf8f5] dark:bg-[#070b09]">
      <Navbar />

      {/* Page Header */}
      <header className="py-20 px-4 text-center border-b border-border-custom bg-white dark:bg-[#050806] relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,rgba(223,177,91,0.03)_0%,transparent_70%)] pointer-events-none" />
        <div className="max-w-4xl mx-auto space-y-4 relative z-10">
          <span className="text-[10px] tracking-[0.3em] text-[#b5924b] dark:text-[#dfb15b] uppercase font-bold">
            Secure Your Edition
          </span>
          <h1 className="text-4xl sm:text-5xl font-serif text-foreground leading-tight">
            Pre-Order The Unshaken Self
          </h1>
          <p className="text-xs sm:text-sm font-light text-stone-500 dark:text-stone-400 max-w-xl mx-auto leading-relaxed">
            {content.header_subtitle}
          </p>
        </div>
      </header>

      {/* Countdown Panel */}
      <section className="py-12 bg-white dark:bg-[#050806] border-b border-border-custom">
        <div className="max-w-4xl mx-auto flex flex-col items-center space-y-6">
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#dfb15b]">Pre-Launch Countdown</span>
          <Countdown />
        </div>
      </section>

      {/* Pricing Comparison Hub */}
      <section className="py-20 px-4 max-w-7xl mx-auto w-full flex-1 space-y-16">
        
        <div className="text-center space-y-4">
          <h2 className="text-xs uppercase tracking-[0.25em] text-[#b5924b] dark:text-[#dfb15b] font-semibold">
            Price Comparison
          </h2>
          <h3 className="text-2xl sm:text-3xl font-serif text-foreground">
            Compare Editions & Channels
          </h3>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {stores.map((store, idx) => {
            return (
              <div
                key={idx}
                className={`bg-white dark:bg-[#101614] border rounded-3xl p-8 flex flex-col justify-between hover:shadow-xl transition-all duration-350 relative ${
                  store.isPopular 
                    ? "border-[#dfb15b] md:-translate-y-2 shadow-md" 
                    : "border-border-custom"
                }`}
              >
                {/* Popularity Badge */}
                {store.isPopular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#dfb15b] text-black font-mono text-[9px] uppercase tracking-widest font-bold px-4 py-1 rounded-full">
                    Recommended
                  </span>
                )}

                <div className="space-y-6">
                  {/* Store Details Header */}
                  <div className="space-y-1">
                    <h4 className="font-serif text-base text-foreground font-semibold">
                      {store.name}
                    </h4>
                    <p className="text-[10px] font-mono text-muted-text uppercase tracking-wider">
                      {store.format} • {store.region}
                    </p>
                  </div>

                  {/* Price info */}
                  <div className="py-4 border-y border-border-custom/50">
                    <span className="text-lg font-serif font-bold text-[#dfb15b] tracking-wide">
                      PRICES WILL BE OUT SOON
                    </span>
                    <span className="text-[9px] font-mono text-green-600 dark:text-green-400 mt-1.5 block uppercase">
                      {store.status}
                    </span>
                  </div>

                  {/* Preorder Features */}
                  <ul className="space-y-3.5 text-xs text-stone-500 dark:text-stone-400 font-light leading-relaxed">
                    {store.features.map((feature, fIdx) => (
                      <li key={fIdx} className="flex space-x-2">
                        <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-8 pt-4">
                  <button
                    onClick={() => handleJoinWaitlist(store.name)}
                    className={`w-full py-3.5 rounded-full flex items-center justify-center space-x-2 text-xs uppercase tracking-widest font-bold shadow-md cursor-pointer transition-all hover:scale-103 ${
                      store.isPopular
                        ? "bg-[#1e3f20] dark:bg-[#dfb15b] text-white dark:text-black"
                        : "border border-border-custom hover:bg-black/5 dark:hover:bg-white/5 text-foreground"
                    }`}
                  >
                    <Bell className="w-3.5 h-3.5" />
                    <span>Notify Me — {store.name.split(" ")[0]}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Notify-Me Waitlist */}
        <div id="waitlist-form" className="max-w-2xl mx-auto bg-white dark:bg-[#101614] border border-[#dfb15b]/30 rounded-3xl p-6 md:p-8 space-y-6 shadow-sm">
          <div className="flex items-center space-x-3 text-[#dfb15b]">
            <Bell className="w-5 h-5" />
            <h4 className="font-serif text-base text-foreground font-semibold">Get Notified at Launch</h4>
          </div>
          <p className="text-xs font-light text-stone-500 leading-relaxed">
            {waitlistStore
              ? <>We'll email you the moment <span className="font-semibold text-foreground">{waitlistStore}</span> goes live.</>
              : "Pre-orders aren't open yet. Leave your email and we'll notify you the moment they are."}
          </p>

          {waitlisted ? (
            <div className="p-4 border border-green-500/20 bg-green-500/5 rounded-lg flex items-center gap-2 text-[11px] text-green-600 dark:text-green-400 font-mono">
              <Check className="w-4 h-4 flex-shrink-0" />
              <span>{waitlistMsg}</span>
            </div>
          ) : (
            <form onSubmit={handleWaitlistSubmit} className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                value={waitlistEmail}
                onChange={(e) => setWaitlistEmail(e.target.value)}
                placeholder="Enter your email address"
                className="flex-1 text-xs bg-stone-50 dark:bg-[#070b09] border border-border-custom rounded-lg px-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-[#dfb15b]/40 text-foreground"
                required
              />
              <button
                type="submit"
                className="px-5 py-2.5 rounded-lg bg-[#1e3f20] dark:bg-[#dfb15b] hover:bg-[#142a15] dark:hover:bg-[#c49945] text-white dark:text-black text-xs uppercase tracking-widest font-bold cursor-pointer whitespace-nowrap"
              >
                Notify Me
              </button>
            </form>
          )}
          {waitlistMsg && !waitlisted && (
            <div className="p-3 border border-red-500/20 bg-red-500/5 rounded-lg text-[10px] text-red-500 font-mono">
              {waitlistMsg}
            </div>
          )}
        </div>

      </section>

      <AIChatbot />
      <Footer />
    </div>
  );
}
