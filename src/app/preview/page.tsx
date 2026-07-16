"use client";

import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AIChatbot from "@/components/AIChatbot";
import {
  ArrowLeft, ArrowRight, Download, BookOpen, FileText
} from "lucide-react";

type PageContent = {
  header: string;
  title?: string;
  subtitle?: string;
  content: string[];
  footer?: string;
};

type BookPage = {
  left: PageContent;
  right: PageContent;
};

export default function Preview() {
  // Flipbook State
  const [page, setPage] = useState(0);

  const bookPages: BookPage[] = [
    {
      left: {
        header: "THE UNSHAKEN SELF — CHAPTER 1 DRAFT",
        title: "When Life Freezes You",
        subtitle: "Confusion is not your enemy — It is your invitation to grow",
        content: [
          "Imagine standing at a crossroads where every signpost has been washed blank by rain. You do not know which way leads home, which way leads forward, and which way leads to a dead end. Your feet feel heavy. Your mind races in circles. You want someone — anyone — to tell you what to do. This is utter confusion.",
          "We are taught from childhood that confusion is a sign of weakness. If you do not know the answer, you are unprepared. If you hesitate, you are a coward. If you freeze, you are failing. But that is not true at all. The Bhagavad Gita opens with something radical — it opens with a hero who is completely, openly, unashamedly confused.",
          "Arjuna, one of the greatest warriors the world had ever seen, does not stride into battle with a war cry. He asks his charioteer to stop. He looks at the armies on both sides and says, in essence, 'I cannot do this. I do not know what is right anymore.' This is not a moment of weakness. It is the most important moment of the entire Gita."
        ]
      },
      right: {
        header: "ARJUNA VISHADA YOGA",
        content: [
          "None of the wisdom, none of the life-changing teachings of the Gita would have happened if Arjuna had not first admitted that he was lost. His confusion was the door through which the light entered.",
          "Think about your own life. When did you grow the most? Was it during the times when everything was smooth and comfortable? Or was it during the times when you did not know what to do next — when a relationship ended, a job disappeared, or a plan crumbled? If you are honest, you will notice that your deepest growth always came after your deepest confusion.",
          "Confusion is not the opposite of clarity. It is the beginning of clarity. It is the soil cracking open before the seed can push through. When you feel confused, it means your old way of seeing the world is no longer big enough to hold the life you are living. Something inside you is outgrowing its container. That discomfort you feel is not a sign that something is wrong. It is a sign that something is ready to change."
        ],
        footer: "Page 1 of 4"
      }
    },
    {
      left: {
        header: "THE UNSHAKEN SELF — CHAPTER 1 DRAFT",
        title: "The Anatomy of a Frozen Moment",
        subtitle: "Recognising your personal battlefields: Kitchen, Office, and Mirror",
        content: [
          "There is a particular kind of moment that almost every human being knows. It is the moment when you need to act — you know you need to act — but your body will not move, your mouth will not open, and your thoughts spin so fast that they cancel each other out. You are frozen. Not lazy, not careless — frozen.",
          "What is happening is not a failure. Modern science calls it freezing. When the stakes feel impossibly high, your nervous system shuts down. Your breath becomes shallow. Your thinking brain goes offline, and something older takes over. Arjuna's bow, Gandiva, slipped from his hands. His skin burned, his mouth went dry, his limbs trembled.",
          "The battlefield of Kurukshetra is not somewhere far away. It is wherever you are standing right now. It might be the kitchen at seven in the morning packing lunches under stress, the office at three in the afternoon facing a demanding boss, or the mirror at midnight looking at your own reflection. These are our Kurukshetras. The real war is between the parts of yourself pulling in different directions — duty and desire, courage and fear."
        ]
      },
      right: {
        header: "THE THREE-BREATH PAUSE PRACTICE",
        content: [
          "The first chapter of the Gita gives us no solutions. It gives us something better: permission to be human. Arjuna sits down in his chariot and lets the full weight of what he is feeling wash over him. He does not run to a distraction. In our digital age, we run from discomfort into scrolls, screens, and apps. But sitting with discomfort is the foundation of mending.",
          "To navigate these frozen moments, KETUL SHAH introduces the daily practice: **The Three-Breath Pause**.",
          "• **First Breath (Body):** Inhale slowly, notice where the tension is (jaw, shoulders). As you exhale, let your shoulders drop half an inch. Notice, don't fix.",
          "• **Second Breath (Mind):** Inhale, notice the story your mind is telling you ('This is unfair', 'I can't handle this'). As you exhale, let the story loosen its grip by one degree.",
          "• **Third Breath (Choice):** Inhale, ask yourself: 'What does the wisest part of me want here?' Not what my anger or fear wants. Exhale and let your next action come from that quiet space."
        ],
        footer: "Page 2 of 4"
      }
    }
  ];

  return (
    <div className="flex-1 flex flex-col pt-16 bg-[#faf8f5] dark:bg-[#070b09]">
      <Navbar />

      {/* Page Header */}
      <header className="py-20 px-4 text-center border-b border-border-custom bg-white dark:bg-[#050806] relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,rgba(223,177,91,0.03)_0%,transparent_70%)] pointer-events-none" />
        <div className="max-w-4xl mx-auto space-y-4 relative z-10">
          <span className="text-[10px] tracking-[0.3em] text-[#b5924b] dark:text-[#dfb15b] uppercase font-bold">
            Interactive Experience
          </span>
          <h1 className="text-4xl sm:text-5xl font-serif text-foreground leading-tight">
            Book Preview
          </h1>
          <p className="text-xs sm:text-sm font-light text-stone-500 dark:text-stone-400 max-w-xl mx-auto leading-relaxed">
            Flip through the draft text of Chapter 1 of *The Unshaken Self*.
          </p>
        </div>
      </header>

      {/* Content Columns */}
      <section className="py-16 px-4 max-w-7xl mx-auto w-full space-y-16 flex-1">

        {/* Row 2: Double Page Flipbook Reader */}
        <div className="space-y-8 pt-8">
          <div className="text-center space-y-3">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#dfb15b]/10 border border-[#dfb15b]/20">
              <BookOpen className="w-3.5 h-3.5 text-[#dfb15b]" />
              <span className="text-[9px] tracking-widest uppercase font-bold text-[#b5924b] dark:text-[#dfb15b]">Text Reading Preview</span>
            </div>
            <h2 className="font-serif text-2xl md:text-3xl text-foreground">
              Flip Through Chapter 1
            </h2>
            <p className="text-xs font-light text-stone-500 dark:text-stone-400 max-w-lg mx-auto">
              Read the details of Chapter 1 of *The Unshaken Self* below, presenting the ancient teachings in a contemporary light.
            </p>
          </div>

          {/* Interactive Flipbook Container */}
          <div className="max-w-5xl mx-auto border border-border-custom bg-white dark:bg-[#101614] rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden min-h-[480px] flex flex-col justify-between">
            <div className="absolute inset-0 bg-[#faf8f5]/40 dark:bg-black/10 pointer-events-none" />

            {/* Split Page Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 flex-1 pb-8">
              
              {/* Left Page */}
              <div className="space-y-6 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-border-custom pb-8 lg:pb-0 lg:pr-12">
                <div className="space-y-4">
                  <span className="block font-mono text-[9px] text-[#b5924b] dark:text-[#dfb15b] uppercase tracking-widest font-semibold">
                    {bookPages[page].left.header}
                  </span>
                  
                  {bookPages[page].left.title && (
                    <h3 className="font-serif text-xl text-foreground tracking-wide font-bold">
                      {bookPages[page].left.title}
                    </h3>
                  )}
                  {bookPages[page].left.subtitle && (
                    <p className="font-sans text-xs tracking-wider text-muted-text font-semibold uppercase">
                      {bookPages[page].left.subtitle}
                    </p>
                  )}
                  
                  <div className="space-y-4 text-xs sm:text-[13px] font-light text-stone-600 dark:text-stone-300 leading-relaxed text-justify">
                    {bookPages[page].left.content.map((pText, i) => (
                      <p key={i}>{pText}</p>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Page */}
              <div className="space-y-6 flex flex-col justify-between lg:pl-6">
                <div className="space-y-4">
                  <span className="block font-mono text-[9px] text-[#b5924b] dark:text-[#dfb15b] uppercase tracking-widest font-semibold">
                    {bookPages[page].right.header}
                  </span>
                  
                  <div className="space-y-4 text-xs sm:text-[13px] font-light text-stone-600 dark:text-stone-300 leading-relaxed text-justify">
                    {bookPages[page].right.content.map((pText, i) => {
                      if (pText.startsWith("•")) {
                        return (
                          <div key={i} className="pl-4 border-l border-[#dfb15b]/45 italic text-muted-text">
                            {pText}
                          </div>
                        );
                      }
                      return <p key={i} className={pText.startsWith("**The Exercise") || pText.includes("**The Three-Breath Pause**") ? "font-serif text-[#dfb15b] text-[14px]" : ""}>{pText}</p>;
                    })}
                  </div>
                </div>
                
                {/* Page Number footer */}
                <div className="text-right text-[10px] font-mono text-muted-text tracking-widest uppercase">
                  {bookPages[page].right.footer}
                </div>
              </div>

            </div>

            {/* Page Turn Controls footer */}
            <div className="border-t border-border-custom/50 pt-4 flex items-center justify-between">
              <button
                onClick={() => setPage((prev) => Math.max(0, prev - 1))}
                disabled={page === 0}
                className="flex items-center space-x-2 text-xs uppercase tracking-widest font-semibold text-muted-text hover:text-foreground disabled:opacity-30 cursor-pointer transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Previous Pages</span>
              </button>

              <div className="text-xs font-mono text-[#dfb15b]">
                Page {page * 2 + 1} - {page * 2 + 2} of 4
              </div>

              <button
                onClick={() => setPage((prev) => Math.min(bookPages.length - 1, prev + 1))}
                disabled={page === bookPages.length - 1}
                className="flex items-center space-x-2 text-xs uppercase tracking-widest font-semibold text-muted-text hover:text-foreground disabled:opacity-30 cursor-pointer transition-colors"
              >
                <span>Next Pages</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>

        {/* Row 3: Callout to Download PDF */}
        <div className="glassmorphism border border-border-custom rounded-3xl p-8 md:p-12 text-center space-y-6 shadow-md max-w-4xl mx-auto">
          <div className="w-12 h-12 rounded-full bg-[#dfb15b]/10 flex items-center justify-center text-[#dfb15b] mx-auto">
            <FileText className="w-6 h-6" />
          </div>
          <div className="space-y-2">
            <h3 className="font-serif text-lg sm:text-xl text-foreground font-semibold">
              Want the full Chapter 1 PDF?
            </h3>
            <p className="text-xs font-light text-stone-500 max-w-sm mx-auto leading-relaxed">
              Read comfortably offline. Get the printer-friendly PDF file including full notes, schemas, and morning reflection sheets.
            </p>
          </div>
          <a
            href="/downloads/Chapter1_Sample_The_Unshaken_Self.pdf"
            download
            className="inline-flex items-center space-x-2 px-6 py-3 rounded-full bg-[#0f2b48] hover:opacity-90 dark:bg-[#dfb15b] dark:hover:bg-[#c49945] text-white dark:text-black text-xs uppercase tracking-widest font-bold shadow-md transition-all hover:scale-105 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Download Sample PDF</span>
          </a>
        </div>

      </section>

      <AIChatbot />
      <Footer />
    </div>
  );
}
