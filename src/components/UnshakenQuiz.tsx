"use client";

import React, { useState } from "react";
import Link from "next/link";
import { CheckCircle, ChevronRight, Mail, RotateCw } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type ArchetypeKey = "karma" | "bhakti" | "witness" | "seeker";

type Archetype = {
  key: ArchetypeKey;
  name: string;
  chapterRef: string;
  line: string;
};

const ARCHETYPES: Record<ArchetypeKey, Archetype> = {
  karma: {
    key: "karma",
    name: "The Karma Yogi",
    chapterRef: "Chapter 3 — Karma Yoga",
    line: "You find your calm through motion — full effort, and a clean release of the outcome.",
  },
  bhakti: {
    key: "bhakti",
    name: "The Bhakti Heart",
    chapterRef: "Chapter 12 — Bhakti Yoga",
    line: "You find your calm through devotion and connection — showing up consistently matters more than certainty.",
  },
  witness: {
    key: "witness",
    name: "The Steady Witness",
    chapterRef: "Chapter 2 — Sankhya Yoga",
    line: "You find your calm through stillness — watching the storm rather than becoming it.",
  },
  seeker: {
    key: "seeker",
    name: "The Quiet Seeker",
    chapterRef: "Chapter 7 — Jnana Vijnana Yoga",
    line: "You find your calm through understanding — once you see clearly, fear tends to loosen its grip.",
  },
};

type Question = { prompt: string; options: { label: string; key: ArchetypeKey }[] };

const QUESTIONS: Question[] = [
  {
    prompt: "A major deadline just moved up. Your first instinct is to:",
    options: [
      { label: "Make a list and start executing immediately.", key: "karma" },
      { label: "Call someone you trust and talk it through.", key: "bhakti" },
      { label: "Sit with it for a minute before reacting at all.", key: "witness" },
      { label: "Figure out exactly why it moved and what it means.", key: "seeker" },
    ],
  },
  {
    prompt: "When you're anxious, what actually helps?",
    options: [
      { label: "Doing something — anything — productive.", key: "karma" },
      { label: "Being reminded you're not alone in it.", key: "bhakti" },
      { label: "Noticing the anxiety without rushing to fix it.", key: "witness" },
      { label: "Understanding exactly where it's coming from.", key: "seeker" },
    ],
  },
  {
    prompt: "Your definition of a “good day” is one where:",
    options: [
      { label: "You got a lot done.", key: "karma" },
      { label: "You felt close to the people around you.", key: "bhakti" },
      { label: "Nothing rattled you, no matter what happened.", key: "witness" },
      { label: "You learned or understood something new.", key: "seeker" },
    ],
  },
  {
    prompt: "When a plan falls apart, you tend to:",
    options: [
      { label: "Immediately start building the next plan.", key: "karma" },
      { label: "Lean on your support system.", key: "bhakti" },
      { label: "Pause and let the disappointment pass first.", key: "witness" },
      { label: "Analyze what went wrong before doing anything else.", key: "seeker" },
    ],
  },
  {
    prompt: "If you had to pick one, you'd rather be known for:",
    options: [
      { label: "Getting things done.", key: "karma" },
      { label: "Being loyal and dependable.", key: "bhakti" },
      { label: "Staying calm when everyone else isn't.", key: "witness" },
      { label: "Seeing things clearly.", key: "seeker" },
    ],
  },
];

export default function UnshakenQuiz() {
  const [step, setStep] = useState(0); // 0..QUESTIONS.length-1 = a question; QUESTIONS.length = result
  const [scores, setScores] = useState<Record<ArchetypeKey, number>>({
    karma: 0,
    bhakti: 0,
    witness: 0,
    seeker: 0,
  });
  const [email, setEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [sending, setSending] = useState(false);

  const isResult = step >= QUESTIONS.length;

  const handleAnswer = (key: ArchetypeKey) => {
    setScores((prev) => ({ ...prev, [key]: prev[key] + 1 }));
    setStep((s) => s + 1);
  };

  const handleRetake = () => {
    setScores({ karma: 0, bhakti: 0, witness: 0, seeker: 0 });
    setEmail("");
    setEmailSent(false);
    setStep(0);
  };

  const getResult = (): Archetype => {
    let winner: ArchetypeKey = "karma";
    let best = -1;
    (Object.keys(scores) as ArchetypeKey[]).forEach((k) => {
      if (scores[k] > best) {
        best = scores[k];
        winner = k;
      }
    });
    return ARCHETYPES[winner];
  };

  const handleEmailResult = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSending(true);
    const result = getResult();
    const supabase = createClient();
    // Reuses the existing preorder_waitlist table (public INSERT policy
    // already covers this) rather than introducing a new table just to
    // store a quiz-result email capture.
    const { error } = await supabase.from("preorder_waitlist").insert({
      email: email.trim(),
      preferred_store: `Quiz result: ${result.name}`,
    });
    setSending(false);
    if (!error || error.message.includes("duplicate")) {
      setEmailSent(true);
    }
  };

  return (
    <div className="max-w-xl mx-auto bg-white dark:bg-[#101614] border border-border-custom rounded-3xl p-8 sm:p-10 shadow-md">
      {!isResult ? (
        <div className="space-y-8">
          {/* Progress */}
          <div className="flex items-center gap-1.5">
            {QUESTIONS.map((_, i) => (
              <div
                key={i}
                className={`h-1 flex-1 rounded-full transition-colors ${
                  i < step ? "bg-[#dfb15b]" : i === step ? "bg-[#dfb15b]/50" : "bg-border-custom"
                }`}
              />
            ))}
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-widest text-muted-text">
              Question {step + 1} of {QUESTIONS.length}
            </span>
            <h3 className="font-serif text-lg sm:text-xl text-foreground leading-snug">
              {QUESTIONS[step].prompt}
            </h3>
          </div>

          <div className="space-y-3">
            {QUESTIONS[step].options.map((opt, i) => (
              <button
                key={i}
                onClick={() => handleAnswer(opt.key)}
                className="w-full text-left px-5 py-3.5 rounded-2xl border border-border-custom hover:border-[#dfb15b]/60 hover:bg-[#dfb15b]/5 transition-colors text-sm text-foreground flex items-center justify-between gap-3 cursor-pointer group"
              >
                <span>{opt.label}</span>
                <ChevronRight className="w-4 h-4 text-muted-text group-hover:text-[#dfb15b] group-hover:translate-x-0.5 transition-all flex-shrink-0" />
              </button>
            ))}
          </div>
        </div>
      ) : (
        <ResultView
          result={getResult()}
          email={email}
          setEmail={setEmail}
          emailSent={emailSent}
          sending={sending}
          onEmailResult={handleEmailResult}
          onRetake={handleRetake}
        />
      )}
    </div>
  );
}

function ResultView({
  result,
  email,
  setEmail,
  emailSent,
  sending,
  onEmailResult,
  onRetake,
}: {
  result: Archetype;
  email: string;
  setEmail: (v: string) => void;
  emailSent: boolean;
  sending: boolean;
  onEmailResult: (e: React.FormEvent) => void;
  onRetake: () => void;
}) {
  return (
    <div className="space-y-6 text-center">
      <span className="text-[10px] tracking-[0.3em] text-[#b5924b] dark:text-[#dfb15b] uppercase font-bold">
        Your Unshaken Archetype
      </span>
      <h3 className="font-serif text-2xl sm:text-3xl text-foreground">{result.name}</h3>
      <p className="text-xs font-mono uppercase tracking-widest text-muted-text">{result.chapterRef}</p>
      <p className="text-sm sm:text-base font-light text-stone-500 dark:text-stone-400 leading-relaxed max-w-md mx-auto">
        {result.line}
      </p>

      {emailSent ? (
        <div className="p-4 border border-green-500/20 bg-green-500/5 rounded-2xl flex items-center justify-center gap-2 text-xs text-green-600 dark:text-green-400 font-mono">
          <CheckCircle className="w-4 h-4" />
          <span>Saved — we&apos;ll keep you posted on launch.</span>
        </div>
      ) : (
        <form onSubmit={onEmailResult} className="flex flex-col sm:flex-row gap-3 max-w-sm mx-auto pt-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email this result to yourself"
            className="flex-1 text-xs bg-stone-50 dark:bg-[#070b09] border border-border-custom rounded-lg px-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-[#dfb15b]/40 text-foreground"
            required
          />
          <button
            type="submit"
            disabled={sending}
            className="px-5 py-2.5 rounded-lg bg-[#1e3f20] dark:bg-[#dfb15b] hover:opacity-90 text-white dark:text-black text-xs uppercase tracking-widest font-bold cursor-pointer whitespace-nowrap disabled:opacity-60"
          >
            <span className="flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5" />
              {sending ? "Saving..." : "Email It"}
            </span>
          </button>
        </form>
      )}

      <div className="flex items-center justify-center gap-4 pt-4">
        <button
          onClick={onRetake}
          className="flex items-center gap-1.5 text-[11px] uppercase tracking-widest font-semibold text-muted-text hover:text-foreground transition-colors cursor-pointer"
        >
          <RotateCw className="w-3.5 h-3.5" />
          Retake
        </button>
        <Link
          href="/preorder"
          className="text-[11px] uppercase tracking-widest font-semibold text-[#b5924b] dark:text-[#dfb15b] hover:text-[#9c7b3b] dark:hover:text-[#c49945] transition-colors"
        >
          Pre-order the Book →
        </Link>
      </div>
    </div>
  );
}
