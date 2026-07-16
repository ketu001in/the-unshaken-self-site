"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AIChatbot from "@/components/AIChatbot";
import { Download, Lock, Unlock, FileText, CheckCircle, Info } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Resource = {
  id: string;
  name: string;
  desc: string;
  fileType: string;
  fileSize: string;
  isPremium: boolean;
  fileUrl: string;
};

const UNLOCK_STORAGE_KEY = "unshaken_unlocked_email";

export default function ResourcesPage() {
  const [email, setEmail] = useState("");
  const [orderId, setOrderId] = useState("");
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [validationMsg, setValidationMsg] = useState("");
  const [checking, setChecking] = useState(true);

  const resources: Resource[] = [
    {
      id: "res-1",
      name: "The 18 Chapters Study Companion",
      desc: "A workbook summarizing all 18 chapters of the Bhagavad Gita, containing reflections, Sanskrit vocab highlights, and modern mindfulness equivalents.",
      fileType: "PDF Document",
      fileSize: "~165 KB",
      isPremium: false,
      fileUrl: "/downloads/The_18_Chapters_Study_Companion.pdf"
    },
    {
      id: "res-2",
      name: "Karma Yoga Worksheet: Decoupling Actions",
      desc: "A printable 3-column reflection sheet to map your weekly professional tasks, isolate your inputs, and consciously release attachment to outcomes.",
      fileType: "PDF Printable",
      fileSize: "~60 KB",
      isPremium: false,
      fileUrl: "/downloads/Karma_Yoga_Worksheet_Decoupling_Actions.pdf"
    },
    {
      id: "res-3",
      name: "Sthitaprajna Daily Meditation Tracker",
      desc: "A 30-day habits ledger helping you monitor physical stillness, breath ratios, and daily reaction responses in real-time.",
      fileType: "Interactive Spreadsheet",
      fileSize: "~14 KB",
      isPremium: true,
      fileUrl: "/downloads/Sthitaprajna_Daily_Meditation_Tracker.xlsx"
    },
    {
      id: "res-4",
      name: "Book Club Kit & Discussion Questions",
      desc: "A comprehensive guide with 20 discussion prompts, study notes, and scheduling structures tailored for book clubs and reading groups.",
      fileType: "PDF Kit",
      fileSize: "~110 KB",
      isPremium: true,
      fileUrl: "/downloads/Book_Club_Kit_Discussion_Questions.pdf"
    }
  ];

  // Re-check unlock status against the real database (not just local state),
  // using the is_email_unlocked RPC so we never expose the full email list.
  useEffect(() => {
    const savedEmail = localStorage.getItem(UNLOCK_STORAGE_KEY);
    if (!savedEmail) {
      setChecking(false);
      return;
    }
    const supabase = createClient();
    supabase.rpc("is_email_unlocked", { check_email: savedEmail }).then(({ data }) => {
      if (data) {
        setEmail(savedEmail);
        setIsUnlocked(true);
      } else {
        localStorage.removeItem(UNLOCK_STORAGE_KEY);
      }
      setChecking(false);
    });
  }, []);

  const handleUnlockSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setValidationMsg("");

    const supabase = createClient();
    const { error } = await supabase
      .from("premium_unlocks")
      .insert({ email: email.trim() });

    if (error && !error.message.includes("duplicate")) {
      setValidationMsg("Something went wrong — please try again.");
      return;
    }

    // Order ID is optional context, not a real verification — logged for your reference only.
    if (orderId.trim()) {
      await supabase
        .from("resource_downloads")
        .insert({ resource_id: "premium-unlock", resource_name: `Order ref: ${orderId.trim()}`, email: email.trim() });
    }

    localStorage.setItem(UNLOCK_STORAGE_KEY, email.trim());
    setIsUnlocked(true);
    setValidationMsg("You're unlocked! Premium downloads are available below.");
  };

  const handleDownload = async (res: Resource) => {
    if (res.isPremium && !isUnlocked) {
      alert("Enter your email in the sidebar to unlock premium resources first.");
      return;
    }

    const supabase = createClient();
    await supabase.from("resource_downloads").insert({
      resource_id: res.id,
      resource_name: res.name,
      email: email || "anonymous-free-download",
    });

    const link = document.createElement("a");
    link.href = res.fileUrl;
    link.download = res.fileUrl.split("/").pop() || res.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex-1 flex flex-col pt-16 bg-[#faf8f5] dark:bg-[#070b09]">
      <Navbar />

      {/* Page Header */}
      <header className="py-20 px-4 text-center border-b border-border-custom bg-white dark:bg-[#050806] relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,rgba(223,177,91,0.03)_0%,transparent_70%)] pointer-events-none" />
        <div className="max-w-4xl mx-auto space-y-4 relative z-10">
          <span className="text-[10px] tracking-[0.3em] text-[#b5924b] dark:text-[#dfb15b] uppercase font-bold">
            Reader Downloads
          </span>
          <h1 className="text-4xl sm:text-5xl font-serif text-foreground leading-tight">
            Book Resources
          </h1>
          <p className="text-xs sm:text-sm font-light text-stone-500 dark:text-stone-400 max-w-xl mx-auto leading-relaxed">
            Access study companions, printable worksheets, and interactive trackers to apply *The Unshaken Self* in your daily routine.
          </p>
        </div>
      </header>

      {/* Resources Hub */}
      <section className="py-16 px-4 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 flex-1">
        
        {/* Left Column: Resources List */}
        <div className="lg:col-span-8 space-y-8">
          <div className="space-y-4">
            <h2 className="font-serif text-2xl text-foreground">Available Guides</h2>
            <div className="w-12 h-[2px] bg-[#dfb15b]" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {resources.map((res) => {
              const locked = res.isPremium && !isUnlocked;
              return (
                <div
                  key={res.id}
                  className="bg-white dark:bg-[#101614] border border-border-custom p-6 rounded-3xl flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden"
                >
                  {/* Premium Lock Banner */}
                  {res.isPremium && (
                    <div className="absolute top-0 right-0 flex items-center space-x-1 px-3 py-1 text-[9px] font-mono uppercase tracking-widest font-semibold bg-[#dfb15b]/10 text-[#dfb15b] border-l border-b border-[#dfb15b]/20 rounded-bl-xl">
                      {locked ? <Lock className="w-2.5 h-2.5" /> : <Unlock className="w-2.5 h-2.5" />}
                      <span>Premium</span>
                    </div>
                  )}

                  <div className="space-y-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#1e3f20]/5 to-[#b5924b]/5 text-[#dfb15b] flex items-center justify-center">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-serif text-base text-foreground font-semibold leading-snug pr-12">
                        {res.name}
                      </h3>
                      <p className="text-[10px] text-muted-text font-mono uppercase">
                        {res.fileType} • {res.fileSize}
                      </p>
                    </div>
                    <p className="text-xs font-light text-stone-500 dark:text-stone-400 leading-relaxed">
                      {res.desc}
                    </p>
                  </div>

                  <div className="mt-8 pt-4 border-t border-border-custom/50 flex justify-between items-center">
                    <span className="text-[10px] font-mono text-muted-text uppercase tracking-widest">
                      {locked ? "Locked" : "Ready"}
                    </span>
                    <button
                      onClick={() => handleDownload(res)}
                      className={`px-4 py-2 rounded-full text-[10px] uppercase tracking-widest font-bold flex items-center space-x-1.5 cursor-pointer transition-colors ${
                        locked
                          ? "bg-stone-100 text-stone-400 dark:bg-stone-850 dark:text-stone-600 hover:bg-stone-200"
                          : "bg-[#1e3f20] dark:bg-[#dfb15b] text-white dark:text-black hover:opacity-90"
                      }`}
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>{locked ? "Unlock Resource" : "Download File"}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Preorder Bonus Unlocker */}
        <div className="lg:col-span-4">
          <div className="bg-white dark:bg-[#101614] border border-border-custom rounded-3xl p-6 space-y-6 shadow-sm sticky top-24">
            
            <div className="space-y-2">
              <h3 className="font-serif text-base text-foreground font-semibold flex items-center gap-2">
                {isUnlocked ? <Unlock className="w-5 h-5 text-green-500" /> : <Lock className="w-5 h-5 text-[#dfb15b]" />}
                <span>Pre-Order Bonuses</span>
              </h3>
              <p className="text-[11px] font-light text-stone-500 leading-relaxed">
                Enter your email to unlock the premium guides. If you've preordered, add your Order/Receipt ID too — it helps us verify pre-order bonuses later.
              </p>
            </div>

            {checking ? (
              <div className="p-5 text-center text-[10px] text-muted-text font-mono">Checking...</div>
            ) : isUnlocked ? (
              <div className="p-5 border border-green-500/20 bg-green-500/5 rounded-2xl space-y-4 text-center">
                <CheckCircle className="w-8 h-8 text-green-500 mx-auto" />
                <div className="space-y-1">
                  <h4 className="font-serif text-sm font-semibold text-foreground">Unlocked</h4>
                  <p className="text-[10px] text-muted-text">Premium files are now unlocked on this device. You can download them below.</p>
                </div>
                <button
                  onClick={() => {
                    setIsUnlocked(false);
                    setEmail("");
                    localStorage.removeItem(UNLOCK_STORAGE_KEY);
                    setValidationMsg("");
                  }}
                  className="text-[10px] uppercase font-mono text-red-500 hover:underline cursor-pointer"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <form onSubmit={handleUnlockSubmit} className="space-y-4">

                {/* Email */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono uppercase tracking-wider text-stone-400 block font-semibold">Email Address *</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g., rohan@domain.com"
                    className="w-full text-xs bg-stone-50 dark:bg-[#070b09] border border-border-custom rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-[#dfb15b]/40 text-foreground"
                    required
                  />
                </div>

                {/* Order ID (optional) */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono uppercase tracking-wider text-stone-400 block font-semibold">Order / Receipt ID (optional)</label>
                  <input
                    type="text"
                    value={orderId}
                    onChange={(e) => setOrderId(e.target.value)}
                    placeholder="e.g., OD938210382"
                    className="w-full text-xs bg-stone-50 dark:bg-[#070b09] border border-border-custom rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-[#dfb15b]/40 text-foreground font-mono"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-full bg-[#1e3f20] hover:bg-[#142a15] dark:bg-[#dfb15b] dark:hover:bg-[#c49945] text-white dark:text-black text-xs uppercase tracking-widest font-bold shadow-md transition-all cursor-pointer"
                >
                  Unlock Premium Guides
                </button>

                {validationMsg && (
                  <div className="p-3 border rounded-lg flex items-start gap-2 text-[10px] font-mono border-red-500/20 bg-red-500/5 text-red-500">
                    <Info className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                    <span>{validationMsg}</span>
                  </div>
                )}

              </form>
            )}

            <div className="p-4 border border-border-custom rounded-2xl text-[10px] text-muted-text flex items-start gap-2">
              <Info className="w-4 h-4 text-[#dfb15b] flex-shrink-0 mt-0.5" />
              <span>Premium guides unlock with just your email for now — order IDs aren't verified against real purchases yet.</span>
            </div>

          </div>
        </div>

      </section>

      {/* INTERACTIVE WORKSHEETS SECTION */}
      <section className="max-w-7xl mx-auto w-full px-4 pb-24 space-y-12">
        <div className="text-center space-y-4">
          <span className="text-[10px] tracking-[0.3em] text-[#dfb15b] uppercase font-bold">Interactive Tools</span>
          <h2 className="text-2xl sm:text-3xl font-serif text-foreground">The Digital Worksheets Suite</h2>
          <p className="text-xs font-light text-stone-500 dark:text-stone-400 max-w-md mx-auto">
            Apply the exercises from *The Unshaken Self* directly in your browser. Record logs, build intentions, and track your practice.
          </p>
        </div>

        {!isUnlocked ? (
          /* Locked State Teaser */
          <div className="max-w-3xl mx-auto border border-border-custom bg-white dark:bg-[#101614] rounded-3xl p-12 text-center space-y-6 shadow-md relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#dfb15b]/5 rounded-full blur-3xl pointer-events-none" />
            <Lock className="w-10 h-10 text-[#dfb15b] mx-auto animate-pulse" />
            <h3 className="font-serif text-lg text-foreground font-semibold">Worksheets Locked</h3>
            <p className="text-xs font-light text-stone-500 dark:text-stone-400 max-w-sm mx-auto leading-relaxed">
              These digital companion tools are reserved for pre-order supporters. Enter your receipt or order ID in the sidebar form above to instantly unlock the full suite.
            </p>
          </div>
        ) : (
          /* Unlocked Interactive Worksheets */
          <UnlockedWorksheets />
        )}
      </section>

      <AIChatbot />
      <Footer />
    </div>
  );
}

function UnlockedWorksheets() {
  const [activeTab, setActiveTab] = useState<"three-breath" | "decoupling" | "mood">("three-breath");

  // Three-Breath Pause Log States
  const [trigger, setTrigger] = useState("");
  const [outcome, setOutcome] = useState("");
  const [pausesList, setPausesList] = useState<{ trigger: string; date: string; outcome: string }[]>([]);

  // Decoupling States
  const [worry, setWorry] = useState("");
  const [control, setControl] = useState("");
  const [noControl, setNoControl] = useState("");
  const [decoupledCard, setDecoupledCard] = useState<any>(null);

  // Mood weather States
  const [mood, setMood] = useState<"sattva" | "rajas" | "tamas">("sattva");
  const [need, setNeed] = useState("");
  const [weatherList, setWeatherList] = useState<{ mood: string; date: string; need: string }[]>([]);

  useEffect(() => {
    // Load local logs safely in browser context
    const savedPauses = localStorage.getItem("pauses_log");
    if (savedPauses) setPausesList(JSON.parse(savedPauses));

    const savedWeather = localStorage.getItem("weather_log");
    if (savedWeather) setWeatherList(JSON.parse(savedWeather));
  }, []);

  const handleAddPause = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trigger.trim() || !outcome.trim()) return;

    const newLog = {
      trigger,
      outcome,
      date: new Date().toLocaleDateString()
    };
    const updated = [newLog, ...pausesList];
    setPausesList(updated);
    localStorage.setItem("pauses_log", JSON.stringify(updated));
    setTrigger("");
    setOutcome("");
  };

  const handleClearPauses = () => {
    setPausesList([]);
    localStorage.removeItem("pauses_log");
  };

  const handleDecoupleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!worry.trim() || !control.trim() || !noControl.trim()) return;
    setDecoupledCard({
      worry,
      control,
      noControl,
      date: new Date().toLocaleDateString()
    });
    setWorry("");
    setControl("");
    setNoControl("");
  };

  const handleAddWeather = (e: React.FormEvent) => {
    e.preventDefault();
    if (!need.trim()) return;

    const newWeather = {
      mood,
      need,
      date: new Date().toLocaleDateString()
    };
    const updated = [newWeather, ...weatherList];
    setWeatherList(updated);
    localStorage.setItem("weather_log", JSON.stringify(updated));
    setNeed("");
  };

  const handleClearWeather = () => {
    setWeatherList([]);
    localStorage.removeItem("weather_log");
  };

  return (
    <div className="max-w-4xl mx-auto bg-white dark:bg-[#101614] border border-border-custom rounded-3xl overflow-hidden shadow-xl flex flex-col min-h-[500px]">
      {/* Sub tabs */}
      <div className="flex border-b border-border-custom bg-stone-50 dark:bg-black/10 text-xs sm:text-sm font-semibold text-stone-500 overflow-x-auto whitespace-nowrap">
        {[
          { id: "three-breath", label: "Three-Breath Pause Tracker" },
          { id: "decoupling", label: "3-Column Decoupling" },
          { id: "mood", label: "Mood Weather Report" }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-6 py-4 cursor-pointer transition-colors ${
              activeTab === tab.id
                ? "bg-white dark:bg-[#101614] text-[#dfb15b] border-t-2 border-[#dfb15b]"
                : "hover:bg-stone-100 dark:hover:bg-white/5"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Panels */}
      <div className="p-6 md:p-8 flex-1 flex flex-col justify-between">
        
        {activeTab === "three-breath" && (
          <div className="space-y-6">
            <div className="space-y-1">
              <h3 className="font-serif text-lg text-foreground font-bold">The Three-Breath Pause Tracker</h3>
              <p className="text-xs font-light text-stone-500">Record triggers (e.g. arguments or pressure) and pause actions to build mindfulness muscle memory.</p>
            </div>
            
            <form onSubmit={handleAddPause} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase text-stone-400 font-bold block">Occasion / Trigger *</label>
                <input
                  type="text"
                  value={trigger}
                  onChange={(e) => setTrigger(e.target.value)}
                  placeholder="e.g., Received harsh Slack feedback"
                  className="w-full text-xs bg-stone-50 dark:bg-[#070b09] border border-border-custom p-2.5 rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-[#dfb15b]/40"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase text-stone-400 font-bold block">Action / Response *</label>
                <input
                  type="text"
                  value={outcome}
                  onChange={(e) => setOutcome(e.target.value)}
                  placeholder="e.g., Paused 30s. Relaxed jaw. Answered constructively."
                  className="w-full text-xs bg-stone-50 dark:bg-[#070b09] border border-border-custom p-2.5 rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-[#dfb15b]/40"
                  required
                />
              </div>
              <div className="md:col-span-2 flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-full bg-[#0f2b48] dark:bg-[#dfb15b] text-white dark:text-black text-xs uppercase tracking-widest font-bold shadow-md cursor-pointer hover:opacity-90 transition-opacity"
                >
                  Log Pause Instance
                </button>
              </div>
            </form>

            <div className="pt-6 border-t border-border-custom/50 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs uppercase font-mono tracking-wider font-semibold text-foreground">Practice Log ({pausesList.length})</span>
                {pausesList.length > 0 && (
                  <button
                    onClick={handleClearPauses}
                    className="text-[10px] uppercase font-mono text-red-500 hover:underline cursor-pointer"
                  >
                    Clear History
                  </button>
                )}
              </div>

              {pausesList.length === 0 ? (
                <div className="text-center py-8 text-xs text-stone-400 border border-dashed border-border-custom rounded-2xl">
                  No pause instances logged yet. Build your history by log additions above.
                </div>
              ) : (
                <div className="max-h-60 overflow-y-auto space-y-2 pr-2 no-scrollbar">
                  {pausesList.map((log, i) => (
                    <div key={i} className="p-4 border border-border-custom rounded-xl bg-stone-50/50 dark:bg-black/20 text-xs flex justify-between gap-4 items-start">
                      <div className="space-y-1">
                        <p className="font-semibold text-foreground">Trigger: {log.trigger}</p>
                        <p className="font-light text-stone-500">Response: {log.outcome}</p>
                      </div>
                      <span className="text-[9px] font-mono text-stone-400 flex-shrink-0">{log.date}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "decoupling" && (
          <div className="space-y-6">
            <div className="space-y-1">
              <h3 className="font-serif text-lg text-foreground font-bold">The 3-Column Decoupling Worksheet</h3>
              <p className="text-xs font-light text-stone-500">Karma Yoga (Chapter 3) teaches us to put 100% effort into what we control while releasing what is outside our control.</p>
            </div>

            <form onSubmit={handleDecoupleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase text-stone-400 font-bold block">1. Describe Your Current Worry</label>
                <input
                  type="text"
                  value={worry}
                  onChange={(e) => setWorry(e.target.value)}
                  placeholder="e.g., What if the app release fails on production?"
                  className="w-full text-xs bg-stone-50 dark:bg-[#070b09] border border-border-custom p-2.5 rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-[#dfb15b]/40"
                  required
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase text-stone-400 font-bold block">2. What Is 100% In Your Control? *</label>
                  <textarea
                    value={control}
                    onChange={(e) => setControl(e.target.value)}
                    placeholder="e.g., Code tests, lint setups, build checking, backups."
                    rows={3}
                    className="w-full text-xs bg-stone-50 dark:bg-[#070b09] border border-border-custom p-2.5 rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-[#dfb15b]/40 resize-none"
                    required
                  ></textarea>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase text-stone-400 font-bold block">3. What Is Outside Your Control? *</label>
                  <textarea
                    value={noControl}
                    onChange={(e) => setNoControl(e.target.value)}
                    placeholder="e.g., Network outages, client response delays."
                    rows={3}
                    className="w-full text-xs bg-stone-50 dark:bg-[#070b09] border border-border-custom p-2.5 rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-[#dfb15b]/40 resize-none"
                    required
                  ></textarea>
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-full bg-[#0f2b48] dark:bg-[#dfb15b] text-white dark:text-black text-xs uppercase tracking-widest font-bold shadow-md cursor-pointer hover:opacity-90 transition-opacity"
                >
                  Decouple Worry
                </button>
              </div>
            </form>

            {decoupledCard && (
              <div className="p-6 border border-[#dfb15b]/20 bg-[#dfb15b]/5 rounded-2xl space-y-4 animate-[fadeIn_0.3s_ease-out]">
                <div className="flex justify-between items-center border-b border-[#dfb15b]/20 pb-2">
                  <h4 className="font-serif text-sm text-[#dfb15b] font-bold">Zen Decoupled Plan</h4>
                  <span className="text-[9px] font-mono text-stone-400">{decoupledCard.date}</span>
                </div>
                <div className="space-y-3 text-xs leading-relaxed">
                  <p className="text-stone-400 italic">"Worry: {decoupledCard.worry}"</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div className="space-y-1">
                      <span className="block font-mono text-[9px] uppercase tracking-widest text-[#dfb15b] font-bold">Pour 100% Energy Into:</span>
                      <p className="text-foreground">{decoupledCard.control}</p>
                    </div>
                    <div className="space-y-1 opacity-70">
                      <span className="block font-mono text-[9px] uppercase tracking-widest text-stone-400 font-bold">Consciously Surrender:</span>
                      <p className="text-stone-500 dark:text-stone-450 line-through decoration-red-500/30">{decoupledCard.noControl}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "mood" && (
          <div className="space-y-6">
            <div className="space-y-1">
              <h3 className="font-serif text-lg text-foreground font-bold">The Mood Weather Report (Gunas Audit)</h3>
              <p className="text-xs font-light text-stone-500">Log the color of your morning mind (Chapter 14) and apply the correct Gita-suggested response honestly.</p>
            </div>

            <form onSubmit={handleAddWeather} className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5 md:col-span-3">
                <label className="text-[10px] font-mono uppercase text-stone-400 font-bold block">1. Select Current Inner Weather Quality</label>
                <div className="flex gap-4 text-xs">
                  {[
                    { val: "sattva", label: "Sattva (Clarity / Peace)", desc: "Requires protection and quiet space" },
                    { val: "rajas", label: "Rajas (Restless / Active)", desc: "Requires grounding and slowness" },
                    { val: "tamas", label: "Tamas (Heavy / Inertia)", desc: "Requires gentle activation and water" }
                  ].map((item) => (
                    <label key={item.val} className="flex-1 p-3 border border-border-custom rounded-xl flex flex-col justify-between cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          name="mood-quality"
                          checked={mood === item.val}
                          onChange={() => setMood(item.val as any)}
                          className="accent-[#dfb15b]"
                        />
                        <span className="font-semibold text-foreground">{item.val.toUpperCase()}</span>
                      </div>
                      <span className="text-[10px] text-stone-400 font-light mt-1.5">{item.desc}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="md:col-span-3 space-y-1">
                <label className="text-[10px] font-mono uppercase text-stone-400 font-bold block">2. What does today's quality need? *</label>
                <input
                  type="text"
                  value={need}
                  onChange={(e) => setNeed(e.target.value)}
                  placeholder="e.g., A slow breakfast, no morning emails for the first hour"
                  className="w-full text-xs bg-stone-50 dark:bg-[#070b09] border border-border-custom p-2.5 rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-[#dfb15b]/40"
                  required
                />
              </div>

              <div className="md:col-span-3 flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-full bg-[#0f2b48] dark:bg-[#dfb15b] text-white dark:text-black text-xs uppercase tracking-widest font-bold shadow-md cursor-pointer hover:opacity-90 transition-opacity"
                >
                  Save Weather Log
                </button>
              </div>
            </form>

            <div className="pt-6 border-t border-border-custom/50 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs uppercase font-mono tracking-wider font-semibold text-foreground">Weather Logs ({weatherList.length})</span>
                {weatherList.length > 0 && (
                  <button
                    onClick={handleClearWeather}
                    className="text-[10px] uppercase font-mono text-red-500 hover:underline cursor-pointer"
                  >
                    Clear History
                  </button>
                )}
              </div>

              {weatherList.length === 0 ? (
                <div className="text-center py-8 text-xs text-stone-400 border border-dashed border-border-custom rounded-2xl">
                  No weather logs recorded.
                </div>
              ) : (
                <div className="max-h-60 overflow-y-auto space-y-2 pr-2 no-scrollbar">
                  {weatherList.map((item, i) => (
                    <div key={i} className="p-4 border border-border-custom rounded-xl bg-stone-50/50 dark:bg-black/20 text-xs flex justify-between gap-4 items-center">
                      <div className="space-y-1">
                        <p className="font-semibold text-foreground">Weather Quality: <span className="text-[#dfb15b] uppercase font-mono">{item.mood}</span></p>
                        <p className="font-light text-stone-500">Intervention: {item.need}</p>
                      </div>
                      <span className="text-[9px] font-mono text-stone-400 flex-shrink-0">{item.date}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
