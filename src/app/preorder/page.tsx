"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AIChatbot from "@/components/AIChatbot";
import FoundingReadersWall from "@/components/FoundingReadersWall";
import ReferralPanel from "@/components/ReferralPanel";
import { Check, Bell, ExternalLink, Globe2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { fetchPageContent } from "@/lib/content";
import { AmazonLogo, NotionPressLogo, FlipkartLogo } from "@/components/StoreLogos";
import ReaderThankYouCard from "@/components/ReaderThankYouCard";

const REFERRAL_CODE_KEY = "unshaken_referral_code";

type RegionKey = "in" | "us" | "ca" | "au";

type PreorderStore = {
  name: string;
  format: string;
  region: string;
  status: string;
  price: string;
  link: string;
  isPopular: boolean;
  features: string[];
  logo: "amazon" | "notionpress" | "flipkart";
  // Which region tab this card belongs to. Older CMS content saved before
  // regions existed won't have this field — treated as "in" (India), which
  // is what all of it was.
  regionKey?: RegionKey;
};

type PreorderContent = {
  header_subtitle: string;
  stores: PreorderStore[];
};

const REGION_TABS: { key: RegionKey; flag: string; label: string }[] = [
  { key: "in", flag: "🇮🇳", label: "India" },
  { key: "us", flag: "🇺🇸", label: "United States" },
  { key: "ca", flag: "🇨🇦", label: "Canada" },
  { key: "au", flag: "🇦🇺", label: "Australia" },
];

// Real, live, confirmed-matching prices/links across all three platforms
// (Amazon.in, Flipkart, and Notion Press) — see the ASINs/pids/URLs the
// author supplied. Notion Press is the author's own recommended store.
const DEFAULT_PREORDER_CONTENT: PreorderContent = {
  header_subtitle: "The Unshaken Self is available now in India, the United States, Canada, and Australia — pick your region above, then choose your favorite store and format below. Notion Press is the author's own recommended store; Amazon.in and Flipkart also ship fast across India.",
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
      regionKey: "in",
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
      regionKey: "in",
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
      regionKey: "in",
      features: ["Now available with Amazon Prime.", "Fast Amazon delivery.", "Sold by Notion Press, fulfilled by Amazon."]
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
      regionKey: "in",
      features: ["Now available with Amazon Prime.", "Fast Amazon delivery.", "Sold by Notion Press, fulfilled by Amazon."]
    },
    {
      name: "Flipkart — Paperback",
      format: "Paperback Edition",
      region: "Flipkart",
      status: "Available Now",
      price: "₹499",
      link: "https://www.flipkart.com/the-unshaken-self/p/itm1004d27433425?pid=9798906961297&affid=editornoti",
      isPopular: false,
      logo: "flipkart",
      regionKey: "in",
      features: ["7 days replacement.", "Sold by NotionPress on Flipkart."]
    },
    {
      name: "Flipkart — Hardcover",
      format: "Hardcover Edition",
      region: "Flipkart",
      status: "Available Now",
      price: "₹575",
      link: "https://www.flipkart.com/unshaken-self-wisdom-gita-life-without-doubt-worry-fear/p/itm1004d27433425?pid=9798906961303&affid=editornoti",
      isPopular: false,
      logo: "flipkart",
      regionKey: "in",
      features: ["7 days replacement.", "Sold by NotionPress on Flipkart."]
    },
    // United States — verified live via Amazon.com (delivery location set
    // to a US zip before reading the price).
    {
      name: "Amazon.com — Paperback",
      format: "Paperback Edition",
      region: "Amazon.com",
      status: "Available Now",
      price: "$16.99",
      link: "https://www.amazon.com/dp/B0HHNKF7FQ",
      isPopular: false,
      logo: "amazon",
      regionKey: "us",
      features: ["Ships from Amazon.com.", "Sold by Notion Press, fulfilled by Amazon."]
    },
    {
      name: "Amazon.com — Hardcover",
      format: "Hardcover Edition",
      region: "Amazon.com",
      status: "Available Now",
      price: "$27.99",
      link: "https://www.amazon.com/dp/B0HHNW1DJH",
      isPopular: false,
      logo: "amazon",
      regionKey: "us",
      features: ["Ships from Amazon.com.", "Sold by Notion Press, fulfilled by Amazon."]
    },
    // Canada — verified live via Amazon.ca.
    {
      name: "Amazon.ca — Paperback",
      format: "Paperback Edition",
      region: "Amazon.ca",
      status: "Available Now",
      price: "$23.41",
      link: "https://www.amazon.ca/dp/B0HHNKF7FQ",
      isPopular: false,
      logo: "amazon",
      regionKey: "ca",
      features: ["Ships from Amazon.ca.", "Sold by Notion Press, fulfilled by Amazon."]
    },
    {
      name: "Amazon.ca — Hardcover",
      format: "Hardcover Edition",
      region: "Amazon.ca",
      status: "Available Now",
      price: "$38.72",
      link: "https://www.amazon.ca/dp/B0HHNW1DJH",
      isPopular: false,
      logo: "amazon",
      regionKey: "ca",
      features: ["Ships from Amazon.ca.", "Sold by Notion Press, fulfilled by Amazon."]
    },
    // Australia — verified live via Amazon.com.au (delivery location set
    // to a Sydney postcode before reading the price).
    {
      name: "Amazon.com.au — Paperback",
      format: "Paperback Edition",
      region: "Amazon.com.au",
      status: "Available Now",
      price: "$26.39",
      link: "https://www.amazon.com.au/dp/B0HHNKF7FQ",
      isPopular: false,
      logo: "amazon",
      regionKey: "au",
      features: ["Ships from Amazon.com.au.", "Sold by Notion Press, fulfilled by Amazon."]
    },
    {
      name: "Amazon.com.au — Hardcover",
      format: "Hardcover Edition",
      region: "Amazon.com.au",
      status: "Available Now",
      price: "$57.73",
      link: "https://www.amazon.com.au/dp/B0HHNW1DJH",
      isPopular: false,
      logo: "amazon",
      regionKey: "au",
      features: ["Ships from Amazon.com.au.", "Sold by Notion Press, fulfilled by Amazon."]
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
  const [activeRegion, setActiveRegion] = useState<RegionKey>("in");

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

  const stores = content.stores.filter((s) => (s.regionKey ?? "in") === activeRegion);

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

          {/* Amazon ships worldwide, so this flashes to catch the eye of
              visitors from outside the four regions listed below. */}
          <div className="flex justify-center">
            <span className="now-live-flash inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[10px] uppercase tracking-widest font-bold">
              <Globe2 className="w-3 h-3" />
              Available in 130+ Countries
            </span>
          </div>

          <p className="text-xs sm:text-sm font-light text-stone-500 dark:text-stone-400 max-w-xl mx-auto leading-relaxed">
            {content.header_subtitle}
          </p>
          <div className="pt-2">
            <FoundingReadersWall />
          </div>
        </div>
      </header>

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

        {/* Region Tabs — the book is live on the same two ASINs across
            India, US, Canada, and Australia; switching tabs filters the
            grid below to that region's stores instead of showing all
            regions' cards at once. */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          {REGION_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveRegion(tab.key)}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-[11px] uppercase tracking-widest font-bold border transition-all cursor-pointer ${
                activeRegion === tab.key
                  ? "bg-[#1e3f20] dark:bg-[#dfb15b] text-white dark:text-black border-transparent shadow-md"
                  : "border-border-custom text-muted-text hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5"
              }`}
            >
              <span aria-hidden="true">{tab.flag}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
        <p className="text-center text-[10px] text-muted-text -mt-8">
          Don&apos;t see your country above? Search Google for &quot;The Unshaken Self Amazon&quot; —
          it&apos;s likely already on your local Amazon site.
        </p>

        {/* Store Cards Grid — regions besides India only have two cards
            (Paperback/Hardcover), so cap the grid at two columns for those
            rather than leaving three empty slots in a four-column row. */}
        <div className={`grid grid-cols-1 sm:grid-cols-2 ${stores.length > 2 ? "lg:grid-cols-4" : "lg:grid-cols-2 max-w-2xl mx-auto"} gap-6`}>
          {stores.map((store, idx) => {
            const Logo = store.logo === "notionpress" ? NotionPressLogo : store.logo === "flipkart" ? FlipkartLogo : AmazonLogo;
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

        <ReaderThankYouCard />

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
