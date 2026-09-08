"use client";

// "Ask Ketul" panel: a banner for the next live session (CMS-driven —
// shows "coming soon" until an admin actually schedules one via Site
// Editor) plus an always-open question box that writes to
// audience_questions, so visitors have somewhere to leave a question
// long before any session date exists.

import React, { useState } from "react";
import { CalendarClock, CheckCircle, Mic, Send } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useSiteSettings } from "@/context/SiteSettingsContext";

export default function AskKetulPanel() {
  const { settings } = useSiteSettings();
  const [question, setQuestion] = useState("");
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const hasSession = Boolean(settings.live_session_datetime.trim());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || submitting) return;
    setSubmitting(true);
    setError("");

    const supabase = createClient();
    const { error: insertError } = await supabase.from("audience_questions").insert({
      question: question.trim(),
      name: name.trim() || null,
    });

    setSubmitting(false);
    if (insertError) {
      setError("Something went wrong — please try again.");
      return;
    }
    setSubmitted(true);
    setQuestion("");
    setName("");
  };

  return (
    <div className="max-w-3xl mx-auto bg-white dark:bg-[#101614] border border-border-custom rounded-3xl overflow-hidden shadow-md">
      {/* Session banner */}
      <div className="p-6 md:p-8 border-b border-border-custom bg-gradient-to-br from-[#1e3f20]/5 to-[#dfb15b]/5 flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
        <div className="w-11 h-11 rounded-xl bg-[#dfb15b]/10 text-[#dfb15b] flex items-center justify-center flex-shrink-0">
          <Mic className="w-5 h-5" />
        </div>
        <div className="flex-1 space-y-1">
          <h3 className="font-serif text-base text-foreground font-semibold">
            {settings.live_session_title}
          </h3>
          {hasSession ? (
            <p className="text-xs text-muted-text flex items-center justify-center sm:justify-start gap-1.5">
              <CalendarClock className="w-3.5 h-3.5 text-[#dfb15b]" />
              <span>{settings.live_session_datetime}</span>
            </p>
          ) : (
            <p className="text-xs text-muted-text">
              A live Q&A is being planned — leave a question below and Ketul will answer it when the
              session is announced.
            </p>
          )}
        </div>
        {hasSession && settings.live_session_link && (
          <a
            href={settings.live_session_link}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-shrink-0 px-5 py-2.5 rounded-full bg-[#1e3f20] dark:bg-[#dfb15b] hover:opacity-90 text-white dark:text-black text-xs uppercase tracking-widest font-bold whitespace-nowrap"
          >
            Join Session
          </a>
        )}
      </div>

      {/* Question box */}
      <div className="p-6 md:p-8 space-y-4">
        <p className="text-xs font-light text-stone-500 dark:text-stone-400 leading-relaxed">
          What would you ask KETUL SHAH about anxiety, focus, or the Gita? Submit it here — questions
          are read and may be answered live or in a future post.
        </p>

        {submitted ? (
          <div className="p-4 border border-green-500/20 bg-green-500/5 rounded-xl flex items-center gap-2 text-xs text-green-600 dark:text-green-400 font-mono">
            <CheckCircle className="w-4 h-4 flex-shrink-0" />
            <span>Question received — thank you for asking.</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Your question…"
              rows={3}
              className="w-full text-xs bg-stone-50 dark:bg-[#070b09] border border-border-custom rounded-lg p-3 text-foreground focus:outline-none focus:ring-1 focus:ring-[#dfb15b]/40 resize-none"
              required
            />
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Name (optional)"
                className="flex-1 text-xs bg-stone-50 dark:bg-[#070b09] border border-border-custom rounded-lg px-4 py-2.5 text-foreground focus:outline-none focus:ring-1 focus:ring-[#dfb15b]/40"
              />
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2.5 rounded-lg bg-[#1e3f20] dark:bg-[#dfb15b] hover:opacity-90 text-white dark:text-black text-xs uppercase tracking-widest font-bold cursor-pointer whitespace-nowrap disabled:opacity-60 flex items-center justify-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                {submitting ? "Sending…" : "Submit Question"}
              </button>
            </div>
            {error && (
              <div className="p-3 border border-red-500/20 bg-red-500/5 rounded-lg text-[10px] text-red-500 font-mono">
                {error}
              </div>
            )}
          </form>
        )}
      </div>
    </div>
  );
}
