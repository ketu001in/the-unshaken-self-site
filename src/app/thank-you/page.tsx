"use client";

import React from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AIChatbot from "@/components/AIChatbot";
import { CheckCircle2, ArrowRight, Quote } from "lucide-react";

export default function ThankYouPage() {
  return (
    <div className="flex-1 flex flex-col pt-16 bg-[#faf8f5] dark:bg-[#070b09]">
      <Navbar />

      <main className="flex-1 flex items-center justify-center py-20 px-4">
        <div className="max-w-xl w-full text-center space-y-8 glassmorphism border border-border-custom p-8 md:p-12 rounded-3xl shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#dfb15b]/5 rounded-full blur-2xl pointer-events-none" />

          {/* Success Check Icon */}
          <div className="w-16 h-16 rounded-full bg-green-500/10 text-green-500 flex items-center justify-center mx-auto border border-green-500/20">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="space-y-3">
            <span className="text-[10px] tracking-[0.3em] font-mono text-[#dfb15b] uppercase font-bold">Action Completed</span>
            <h1 className="text-3xl font-serif text-foreground leading-tight">Pranam, Thank You!</h1>
            <p className="text-xs sm:text-sm font-light text-stone-500 dark:text-stone-400 leading-relaxed max-w-sm mx-auto">
              Your details have been successfully recorded in our database. We have sent a confirmation packet directly to your inbox.
            </p>
          </div>

          {/* Golden Quote Block */}
          <div className="p-6 border border-[#dfb15b]/20 bg-[#dfb15b]/5 rounded-2xl space-y-3 max-w-sm mx-auto text-left relative">
            <Quote className="absolute top-3 right-3 w-4 h-4 text-[#dfb15b]/45" />
            <p className="text-xs font-serif italic text-foreground tracking-wide">
              "Establish yourself in yoga, perform your duties, and discard all attachment to success or failure."
            </p>
            <span className="block text-[8px] font-mono text-muted-text uppercase tracking-widest text-right">— Bhagavad Gita 2.48</span>
          </div>

          {/* Navigation options */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href="/"
              className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-[#1e3f20] dark:bg-[#dfb15b] hover:opacity-90 text-white dark:text-black text-xs uppercase tracking-widest font-bold shadow-md transition-all cursor-pointer"
            >
              Return Home
            </Link>
            <Link
              href="/blog"
              className="w-full sm:w-auto px-6 py-2.5 rounded-full border border-border-custom hover:bg-black/5 dark:hover:bg-white/5 text-foreground text-xs uppercase tracking-widest font-semibold flex items-center justify-center space-x-1 transition-colors"
            >
              <span>Read Reflections</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

        </div>
      </main>

      <AIChatbot />
      <Footer />
    </div>
  );
}
