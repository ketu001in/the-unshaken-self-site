"use client";

import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AIChatbot from "@/components/AIChatbot";

export default function TermsPage() {
  return (
    <div className="flex-1 flex flex-col pt-16 bg-[#faf8f5] dark:bg-[#070b09]">
      <Navbar />

      <main className="max-w-4xl mx-auto w-full px-4 py-16 flex-1 space-y-8">
        <header className="space-y-2">
          <span className="text-[10px] tracking-[0.25em] font-mono text-[#dfb15b] uppercase font-semibold">Legal Notice</span>
          <h1 className="text-3xl sm:text-4xl font-serif text-foreground">Terms of Service</h1>
          <p className="text-xs text-muted-text">Last Updated: July 16, 2026</p>
        </header>

        <div className="bg-white dark:bg-[#101614] border border-border-custom p-8 rounded-3xl space-y-6 text-xs sm:text-sm font-light text-stone-600 dark:text-stone-300 leading-relaxed text-justify">
          <p>
            Welcome to the official website of <strong>The Unshaken Self</strong>, authored by <strong>KETUL SHAH</strong>. By browsing this website, subscribing to newsletters, or accessing preview contents, you agree to comply with and be bound by the following terms.
          </p>

          <h3 className="font-serif text-base text-foreground font-semibold pt-4">1. Intellectual Property</h3>
          <p>
            All website design, text draft copies, layout styles, 3D animations, code structures, and downloadable worksheet assets are the exclusive intellectual property of KETUL SHAH and the publishers, protected under international copyright law. You may download sample guides for personal, non-commercial use only.
          </p>

          <h3 className="font-serif text-base text-foreground font-semibold pt-4">2. Disclaimer of Counsel</h3>
          <p>
            The content, exercises, and AI chatbot reflections offered on this website are inspired by traditional Bhagavad Gita philosophy and designed as self-improvement resources. They do not constitute professional medical diagnosis, psychiatric counseling, or clinical therapy. If you are experiencing severe mental health challenges, please consult a licensed medical professional.
          </p>

          <h3 className="font-serif text-base text-foreground font-semibold pt-4">3. Mock Integrations</h3>
          <p>
            Please note that parts of this website (specifically the AI Companion chatbot, receipt validation forms, and sales charts) operate as high-fidelity interactive local simulations for validation purposes and do not connect to live financial databases or external cognitive servers.
          </p>
        </div>
      </main>

      <AIChatbot />
      <Footer />
    </div>
  );
}
