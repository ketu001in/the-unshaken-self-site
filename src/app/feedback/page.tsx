"use client";

// A dedicated place for visitors to send feedback straight to Ketul —
// writes to the `feedback` table (public insert-only, admin-only read,
// same RLS shape as audience_questions/rsvps). Surfaced in the admin
// dashboard's "Feedback" tab so submissions are actually read, not a
// black hole.

import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AIChatbot from "@/components/AIChatbot";
import { createClient } from "@/lib/supabase/client";
import { MessageSquareHeart, Star, Send, CheckCircle } from "lucide-react";
import { playClick, playConfirm } from "@/lib/sound";

type Category = "general" | "bug" | "suggestion" | "praise" | "other";

const CATEGORIES: { value: Category; label: string }[] = [
  { value: "general", label: "General Feedback" },
  { value: "bug", label: "Something's Broken" },
  { value: "suggestion", label: "A Suggestion" },
  { value: "praise", label: "Just Saying Thanks" },
  { value: "other", label: "Other" },
];

export default function FeedbackPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [category, setCategory] = useState<Category>("general");
  const [rating, setRating] = useState<number | null>(null);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || submitting) return;
    setSubmitting(true);
    setError("");

    const supabase = createClient();
    const { error: insertError } = await supabase.from("feedback").insert({
      name: name.trim() || null,
      email: email.trim() || null,
      category,
      rating,
      message: message.trim(),
    });

    setSubmitting(false);
    if (insertError) {
      setError("Something went wrong — please try again.");
      return;
    }
    playConfirm();
    setSubmitted(true);
    setName("");
    setEmail("");
    setCategory("general");
    setRating(null);
    setMessage("");
  };

  return (
    <div className="flex-1 flex flex-col pt-16 bg-[#faf8f5] dark:bg-[#070b09]">
      <Navbar />

      <main className="max-w-2xl mx-auto w-full px-4 py-16 flex-1 space-y-8">
        <header className="text-center space-y-3">
          <span className="text-[10px] tracking-[0.3em] text-[#b5924b] dark:text-[#dfb15b] uppercase font-bold">
            We&apos;re Listening
          </span>
          <h1 className="text-3xl sm:text-4xl font-serif text-foreground">Share Your Feedback</h1>
          <p className="text-xs sm:text-sm font-light text-stone-500 dark:text-stone-400 max-w-lg mx-auto leading-relaxed">
            Loved a chapter, found a typo, or think something on this site could work better —
            Ketul reads every single note here personally.
          </p>
        </header>

        <div className="bg-white dark:bg-[#101614] border border-border-custom rounded-3xl p-6 sm:p-8 shadow-md">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-[#1e3f20]/5 dark:bg-[#dfb15b]/10 text-[#dfb15b] flex items-center justify-center flex-shrink-0">
              <MessageSquareHeart className="w-5 h-5" />
            </div>
            <h2 className="font-serif text-lg text-foreground">Tell Us What You Think</h2>
          </div>

          {submitted ? (
            <div className="p-5 border border-green-500/20 bg-green-500/5 rounded-xl flex items-center gap-3 text-sm text-green-600 dark:text-green-400 font-mono">
              <CheckCircle className="w-5 h-5 flex-shrink-0" />
              <span>Thank you — your feedback has been received.</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Category */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono uppercase text-stone-400 font-bold block">
                  What&apos;s this about?
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as Category)}
                  className="w-full text-xs bg-stone-50 dark:bg-[#070b09] border border-border-custom rounded-lg px-4 py-2.5 text-foreground focus:outline-none focus:ring-1 focus:ring-[#dfb15b]/40"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Star rating (optional) */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono uppercase text-stone-400 font-bold block">
                  Rate Your Experience (Optional)
                </label>
                <div className="flex items-center gap-1" onMouseLeave={() => setHoverRating(null)}>
                  {[1, 2, 3, 4, 5].map((n) => {
                    const filled = (hoverRating ?? rating ?? 0) >= n;
                    return (
                      <button
                        key={n}
                        type="button"
                        onClick={() => {
                          playClick();
                          setRating(rating === n ? null : n);
                        }}
                        onMouseEnter={() => setHoverRating(n)}
                        className="p-1 cursor-pointer"
                        aria-label={`Rate ${n} out of 5`}
                      >
                        <Star
                          className={`w-6 h-6 transition-colors ${
                            filled ? "fill-[#dfb15b] text-[#dfb15b]" : "text-stone-300 dark:text-stone-600"
                          }`}
                        />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Message */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono uppercase text-stone-400 font-bold block">
                  Your Feedback *
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="What's on your mind?"
                  rows={5}
                  className="w-full text-xs bg-stone-50 dark:bg-[#070b09] border border-border-custom rounded-lg p-3 text-foreground focus:outline-none focus:ring-1 focus:ring-[#dfb15b]/40 resize-none"
                  required
                />
              </div>

              {/* Name + email (optional) */}
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Name (optional)"
                  className="flex-1 text-xs bg-stone-50 dark:bg-[#070b09] border border-border-custom rounded-lg px-4 py-2.5 text-foreground focus:outline-none focus:ring-1 focus:ring-[#dfb15b]/40"
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email (optional — if you'd like a reply)"
                  className="flex-1 text-xs bg-stone-50 dark:bg-[#070b09] border border-border-custom rounded-lg px-4 py-2.5 text-foreground focus:outline-none focus:ring-1 focus:ring-[#dfb15b]/40"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full px-5 py-3 rounded-lg bg-[#1e3f20] dark:bg-[#dfb15b] hover:opacity-90 text-white dark:text-black text-xs uppercase tracking-widest font-bold cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
              >
                <Send className="w-3.5 h-3.5" />
                {submitting ? "Sending…" : "Submit Feedback"}
              </button>

              {error && (
                <div className="p-3 border border-red-500/20 bg-red-500/5 rounded-lg text-[10px] text-red-500 font-mono">
                  {error}
                </div>
              )}
            </form>
          )}
        </div>
      </main>

      <AIChatbot />
      <Footer />
    </div>
  );
}
