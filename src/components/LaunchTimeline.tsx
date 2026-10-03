// A compact, static "the wait is over" story — four honest beats ending
// at today, rather than a countdown to nothing. Pure presentation, no
// state, no invented numbers.

import React from "react";
import { BookOpen, Feather, CheckCircle2, PartyPopper, ChevronRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";

type TimelineStep = {
  icon: LucideIcon;
  label: string;
  desc: string;
};

const STEPS: TimelineStep[] = [
  {
    icon: BookOpen,
    label: "Years of Study",
    desc: "Two decades in high-pressure IT work, and just as many spent quietly studying the Gita.",
  },
  {
    icon: Feather,
    label: "The Manuscript",
    desc: "Eighteen chapters, each rooted in one of the Gita's own, replanted into ordinary life.",
  },
  {
    icon: CheckCircle2,
    label: "Published",
    desc: "3 September 2026 — The Unshaken Self goes to print.",
  },
  {
    icon: PartyPopper,
    label: "Today — In Your Hands",
    desc: "Live now on Amazon and Notion Press, in paperback and hardcover.",
  },
];

export default function LaunchTimeline() {
  return (
    <section className="py-20 px-4 bg-white dark:bg-[#202A33] border-t border-border-custom">
      <div className="max-w-6xl mx-auto space-y-12">
        <div className="text-center space-y-3">
          <h2 className="text-xs uppercase tracking-[0.25em] text-[#AD8631] dark:text-[#D6A63C] font-semibold">
            The Wait Is Over
          </h2>
          <h3 className="text-2xl sm:text-3xl font-serif text-foreground">
            From a Quiet Study to Your Hands
          </h3>
        </div>

        <div className="flex flex-col lg:flex-row items-stretch lg:items-start gap-6 lg:gap-2">
          {STEPS.map((step, idx) => {
            const Icon = step.icon;
            const isLast = idx === STEPS.length - 1;
            return (
              <React.Fragment key={step.label}>
                <div className="flex-1 flex flex-col items-center text-center space-y-3 px-2">
                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                      isLast
                        ? "bg-[#0B2942] dark:bg-[#D6A63C] text-white dark:text-black"
                        : "bg-[#0B2942]/5 dark:bg-[#D6A63C]/10 text-primary dark:text-[#D6A63C]"
                    }`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-serif font-semibold text-foreground">
                    {step.label}
                  </h4>
                  <p className="text-[11px] font-light text-stone-500 dark:text-stone-400 leading-relaxed max-w-[220px]">
                    {step.desc}
                  </p>
                </div>

                {!isLast && (
                  <div className="hidden lg:flex items-center justify-center pt-5">
                    <ChevronRight className="w-5 h-5 text-[#D6A63C]/50" />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </section>
  );
}
