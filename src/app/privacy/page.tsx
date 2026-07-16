"use client";

import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AIChatbot from "@/components/AIChatbot";

export default function PrivacyPage() {
  return (
    <div className="flex-1 flex flex-col pt-16 bg-[#faf8f5] dark:bg-[#070b09]">
      <Navbar />

      <main className="max-w-4xl mx-auto w-full px-4 py-16 flex-1 space-y-8">
        <header className="space-y-2">
          <span className="text-[10px] tracking-[0.25em] font-mono text-[#dfb15b] uppercase font-semibold">Legal Notice</span>
          <h1 className="text-3xl sm:text-4xl font-serif text-foreground">Privacy Policy</h1>
          <p className="text-xs text-muted-text">Last Updated: July 16, 2026</p>
        </header>

        <div className="bg-white dark:bg-[#101614] border border-border-custom p-8 rounded-3xl space-y-6 text-xs sm:text-sm font-light text-stone-600 dark:text-stone-300 leading-relaxed text-justify">
          <p>
            At <strong>The Unshaken Self</strong>, we prioritize the privacy and security of our readers. This Privacy Policy details how we collect, use, and protect your information when you subscribe to our newsletters, RSVP for workshops, or claim preorder bonuses.
          </p>

          <h3 className="font-serif text-base text-foreground font-semibold pt-4">1. Information Collection</h3>
          <p>
            We collect personal information that you voluntarily submit to us, including your name, email address, and order/receipt IDs. We do not collect payment credentials directly; all purchases are managed by third-party retailers (e.g., Amazon, Flipkart, or our publisher's direct checkout systems).
          </p>

          <h3 className="font-serif text-base text-foreground font-semibold pt-4">2. Use of Information</h3>
          <p>
            Your information is used solely to:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>Deliver news and newsletters regarding KETUL SHAH's book launch and articles.</li>
            <li>Send connection links and schedules for virtual events you registered for.</li>
            <li>Approve preorder bonuses and deliver printable workbooks.</li>
            <li>Improve website interaction through simulated testing metrics.</li>
          </ul>

          <h3 className="font-serif text-base text-foreground font-semibold pt-4">3. Data Sharing</h3>
          <p>
            We do not sell, rent, or trade your personal information to third parties. For local testing purposes, all data submitted on this website is stored in your local browser's `localStorage` and is never sent to external telemetry databases without your consent.
          </p>

          <h3 className="font-serif text-base text-foreground font-semibold pt-4">4. GDPR & CCPA Compliance</h3>
          <p>
            You have the right to request access to, correction of, or complete deletion of your submitted emails. If you wish to clear all cookies or stored data, you can click 'Reset Database Simulator' on the Admin Console or clear your browser's data.
          </p>
        </div>
      </main>

      <AIChatbot />
      <Footer />
    </div>
  );
}
