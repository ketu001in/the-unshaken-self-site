"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AIChatbot from "@/components/AIChatbot";
import Countdown from "@/components/Countdown";
import FoundingReadersWall from "@/components/FoundingReadersWall";
import ReferralPanel from "@/components/ReferralPanel";
import { Check, Bell, ExternalLink } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { fetchPageContent } from "@/lib/content";
import { AmazonLogo, NotionPressLogo } from "@/components/StoreLogos";

const REFERRAL_CODE_KEY = "unshaken_referral_code";

type PreorderStore = {
  name: string;
  format: string;
  region: string;
  status: string;
  price: string;
  link: string;
  isPopular: boolean;
  features: string[];
  logo: "amazon" | "notionpress";
};

type PreorderContent = {
  header_subtitle: string;
  stores: PreorderStore[];
};

// Real, live, confirmed-matching prices/links across both platforms
// (Amazon.in and Notion Press) — see the two format ASINs/URLs the
// author supplied. Notion Press is the author's own recommended store.
const DEFAULT_PREORDER_CONTENT: PreorderContent = {
  header_subtitle: "The Unshaken Self is available now — choose your favorite store and format below. Notion Press is the author's own recommended store; Amazon.in ships fast across India.",
  stores: [
    {
      name: "Notion Press — Paperback",
      format: "Paperback Edition",
      region: "India + International Shipping",
      status: "Available Now",
      price: "₹499",
      link: "https://direct.notionpress.com/in/read/the-unshaken-self/paperback",
      isPopular: true,
      logo: "notionpress",
      features: ["Author's own recommended store.", "Direct from the publisher.", "Track your shipping status online."]
    },
    {
      name: "Notion Press — Hardcover",
      format: "Hardcover Edition",
      region: "India + International Shipping",
      status: "Available Now",
      price: "₹575",
      link: "https://direct.notionpress.com/in/read/the-unshaken-self-hardcover/hardcover",
      isPopular: true,
      logo: "notionpress",
      features: ["Author's own recommended store.", "Premium hardbound edition.", "Direct from the publisher."]
    },
    {
      name: "Amazon.in — Paperback",
      format: "Paperback Edition",
      region: "Amazon.in",
      status: "Available Now",
      price: "₹499",
      link: "https://www.amazon.in/dp/B0HHNKF7FQ",
      isPopular: false,
      logo: "amazon",
      features: ["Fast Amazon delivery.", "Sold by Notion Press, fulfilled by Amazon."]
    },
    {
      name: "Amazon.in — Hardcover",
      format: "Hardcover Edition",
      region: "Amazon.in",
      status: "Available Now",
      price: "₹575",
      link: "https://www.amazon.in/dp/B0HHNW1DJH",
      isPopular: false,
      logo: "amazon",
      features: ["Fast Amazon delivery.", "Sold by Notion Press, fulfilled by Amazon."]
    }
  ]
};

export default function PreorderPage() {
  const [content, setContent] = useState<PreorderContent>(DEFAULT_PREORDER_CONTENT);
  const [waitlistEmail, setWaitlistEmail] = useState("");
  const [waitlistName, setWaitlistName] = useState("");
  const [waitlistMsg, setWaitlistMsg] = useState("");
  const [waitlisted, setWaitlisted] = useState(false);
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [referredByCode, setReferredByCode] = useState<string | null>(null);

  useEffect(() => {
    fetchPageContent("preorder", DEFAULT_PREORDER_CONTENT).then(setContent);
  }, []);

  // Restore a previously-issued referral code (returning visitor), and
  // capture ?ref=CODE from a shared link so a fresh signup can be
  // attributed to whoever shared it. Read directly from
  // window.location rather than next/navigation's useSearchParams, which
  // would force this already-client-only page into a Suspense boundary
  // just for one query param.
  useEffect(() => {
    const savedCode = localStorage.getItem(REFERRAL_CODE_KEY);
    if (savedCode) setReferralCode(savedCode);

    const params = new URLSearchParams(window.location.search);
    const ref = params.get("ref");
    if (ref) setReferredByCode(ref);
  }, []);

  const handleWaitlistSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!waitlistEmail.trim()) return;

    const supabase = createClient();
    const { data, error } = await supabase.rpc("join_waitlist", {
      p_email: waitlistEmail.trim(),
      p_preferred_store: "Newsletter",
      p_name: waitlistName.trim() || null,
      p_referred_by_code: referredByCode,
    });

    if (error) {
      setWaitlistMsg("Something went wrong — please try again.");
      return;
    }

    if (typeof data === "string" && data) {
      localStorage.setItem(REFERRAL_CODE_KEY, data);
      setReferralCode(data);
    }

    setWaitlisted(true);
    setWaitlistMsg("You're on the list! We'll keep you posted on events, freebies, and future releases.");
    setWaitlistEmail("");
    setWaitlistName("");
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
            Order The Unshaken Self
          </h1>
          <p className="text-xs sm:text-sm font-light text-stone-500 dark:text-stone-400 max-w-xl mx-auto leading-relaxed">
            {content.header_subtitle}
          </p>
          <div className="pt-2">
            <FoundingReadersWall />
          </div>
        </div>
      </header>

      {/* Countdown Panel — click through to Events */}
      <section className="py-16 px-4 bg-white dark:bg-[#050806] border-b border-border-custom flex justify-center">
        <Countdown />
      </section>

      {/* Editions Comparison Hub */}
      <section className="py-20 px-4 max-w-7xl mx-auto w-full flex-1 space-y-16">

        <div className="text-center space-y-4">
          <h2 className="text-xs uppercase tracking-[0.25em] text-[#b5924b] dark:text-[#dfb15b] font-semibold">
            Available Editions
          </h2>
          <h3 className="text-2xl sm:text-3xl font-serif text-foreground">
            Compare Editions & Channels
          </h3>
        </div>

        {/* Store Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stores.map((store, idx) => {
            const Logo = store.logo === "notionpress" ? NotionPressLogo : AmazonLogo;
            return (
              <div
                key={idx}
                className={`bg-white dark:bg-[#101614] border rounded-3xl p-6 flex flex-col justify-between hover:shadow-xl transition-all duration-350 relative ${
                  store.isPopular
                    ? "border-[#dfb15b] md:-translate-y-2 shadow-md"
                    : "border-border-custom"
                }`}
              >
                {/* Popularity Badge */}
                {store.isPopular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#dfb15b] text-black font-mono text-[9px] uppercase tracking-widest font-bold px-4 py-1 rounded-full whitespace-nowrap">
                    Author&apos;s Pick
                  </span>
                )}

                <div className="space-y-5">
                  {/* Store Details Header */}
                  <div className="flex items-center gap-3">
                    <Logo className="w-9 h-9 flex-shrink-0" />
                    <div>
                      <h4 className="font-serif text-sm text-foreground font-semibold leading-tight">
                        {store.name}
                      </h4>
                      <p className="text-[9px] font-mono text-muted-text uppercase tracking-wider">
                        {store.format}
                      </p>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="py-3 border-y border-border-custom/50 flex items-baseline justify-between">
                    <span className="text-xl font-serif font-bold text-[#b5924b] dark:text-[#dfb15b]">
                      {store.price}
                    </span>
                    <span className="text-[8px] font-mono text-green-600 dark:text-green-400 uppercase">
                      {store.status}
                    </span>
                  </div>

                  {/* Preorder Features */}
                  <ul className="space-y-3 text-[11px] text-stone-500 dark:text-stone-400 font-light leading-relaxed">
                    {store.features.map((feature, fIdx) => (
                      <li key={fIdx} className="flex space-x-2">
                        <Check className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-6 pt-4">
                  <a
                    href={store.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`w-full py-3 rounded-full flex items-center justify-center space-x-2 text-[11px] uppercase tracking-widest font-bold shadow-md cursor-pointer transition-all hover:scale-103 ${
                      store.isPopular
                        ? "bg-[#1e3f20] dark:bg-[#dfb15b] text-white dark:text-black"
                        : "border border-border-custom hover:bg-black/5 dark:hover:bg-white/5 text-foreground"
                    }`}
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Buy Now</span>
                  </a>
                </div>
              </div>
            );
          })}
        </div>

        {/* Stay-updated newsletter — no longer a "notify when it opens"
            gate now that ordering is live, just an optional way to hear
            about events, freebies, and future releases. */}
        <div id="waitlist-form" className="max-w-2xl mx-auto bg-white dark:bg-[#101614] border border-[#dfb15b]/30 rounded-3xl p-6 md:p-8 space-y-6 shadow-sm">
          <div className="flex items-center space-x-3 text-[#dfb15b]">
            <Bell className="w-5 h-5" />
            <h4 className="font-serif text-base text-foreground font-semibold">Stay in the Loop</h4>
          </div>
          <p className="text-xs font-light text-stone-500 leading-relaxed">
            Want a heads-up on events, bonus content, and future releases from Ketul? Leave your email below.
          </p>

          {waitlisted ? (
            <div className="p-4 border border-green-500/20 bg-green-500/5 rounded-lg flex items-center gap-2 text-[11px] text-green-600 dark:text-green-400 font-mono">
              <Check className="w-4 h-4 flex-shrink-0" />
              <span>{waitlistMsg}</span>
            </div>
          ) : (
            <form onSubmit={handleWaitlistSubmit} className="space-y-3">
              <div className="flex flex-col sm:flex-row gap-3">
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
                  Keep Me Posted
                </button>
              </div>
              <input
                type="text"
                value={waitlistName}
                onChange={(e) => setWaitlistName(e.target.value)}
                placeholder="First name (optional — appears on the Founding Readers wall)"
                className="w-full text-xs bg-stone-50 dark:bg-[#070b09] border border-border-custom rounded-lg px-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-[#dfb15b]/40 text-foreground"
              />
            </form>
          )}
          {waitlistMsg && !waitlisted && (
            <div className="p-3 border border-red-500/20 bg-red-500/5 rounded-lg text-[10px] text-red-500 font-mono">
              {waitlistMsg}
            </div>
          )}
        </div>

        <ReferralPanel referralCode={referralCode} />

      </section>

      <AIChatbot />
      <Footer />
    </div>
  );
}
