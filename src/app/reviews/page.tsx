"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AIChatbot from "@/components/AIChatbot";
import { Star, MessageSquare, PlusCircle, Check } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { fetchPageContent } from "@/lib/content";

type Review = {
  id: string;
  author: string;
  role: string;
  quote: string;
  rating: number;
  type: "professional" | "reader" | "celebrity";
  date: string;
};

type ReviewsPageContent = {
  header_badge: string;
  header_title: string;
  header_subtitle: string;
  sidebar_heading: string;
  sidebar_desc: string;
};

const DEFAULT_REVIEWS_PAGE_CONTENT: ReviewsPageContent = {
  header_badge: "Reader Endorsements",
  header_title: "Reviews & Endorsements",
  header_subtitle: "Read professional assessments, scholar reviews, and feedback from early reader groups. Or share your own preview reflections.",
  sidebar_heading: "Share Your Thoughts",
  sidebar_desc: "If you have read Chapter 1 in the preview, write a short reflection. Submissions are reviewed before they appear publicly.",
};

export default function ReviewsPage() {
  const [filter, setFilter] = useState<"all" | "professional" | "reader" | "celebrity">("all");
  const [sortBy, setSortBy] = useState<"newest" | "highest">("newest");
  const [content, setContent] = useState<ReviewsPageContent>(DEFAULT_REVIEWS_PAGE_CONTENT);

  useEffect(() => {
    fetchPageContent("reviews", DEFAULT_REVIEWS_PAGE_CONTENT).then(setContent);
  }, []);

  // Form State
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [quote, setQuote] = useState("");
  const [rating, setRating] = useState(5);
  const [reviewType, setReviewType] = useState<"reader" | "professional">("reader");
  const [submitted, setSubmitted] = useState(false);

  // Reviews Data State
  const [reviewsList, setReviewsList] = useState<Review[]>([]);

  const defaultReviews: Review[] = [
    {
      id: "rev-1",
      author: "Swami Shivananda Saraswati",
      role: "Vedic Scholar & Ashram Director",
      quote: "Ketul Shah has handled the sacred verses with extreme reverence. This is not a rewrite, but a brilliant translation of the Gita's core psychological wisdom for contemporary times.",
      rating: 5,
      type: "celebrity",
      date: "2026-06-15"
    },
    {
      id: "rev-2",
      author: "Dr. Ananya Rao",
      role: "Mindfulness Researcher & Psychologist",
      quote: "Ketul Shah has achieved something remarkable—taking a 5,000-year-old dialogue and showing exactly how it can save you from burnout at work. Essential reading for the modern professional.",
      rating: 5,
      type: "professional",
      date: "2026-06-20"
    },
    {
      id: "rev-3",
      author: "Vikram Malhotra",
      role: "Founder, Peak Performance Labs",
      quote: "The Unshaken Self is an anchor. In a world full of noise, this book offers the precise psychological framework needed to stay calm, focused, and steady.",
      rating: 5,
      type: "professional",
      date: "2026-07-02"
    },
    {
      id: "rev-4",
      author: "Siddharth Mehta",
      role: "Tech Entrepreneur",
      quote: "Brilliant, practical, and deeply moving. The chapter on Karma Yoga alone completely altered how I approach product launches and failure.",
      rating: 5,
      type: "reader",
      date: "2026-07-05"
    },
    {
      id: "rev-5",
      author: "Meera Sen",
      role: "Graduate Student",
      quote: "As a student constantly worried about exams and job applications, the exercises in Chapter 1 helped me step back and separate my effort from my anxiety.",
      rating: 4,
      type: "reader",
      date: "2026-07-10"
    }
  ];

  // Load hand-picked defaults plus any publicly *approved* reviews from the database.
  // Newly submitted reviews go to a moderation queue in /admin and won't appear here
  // until approved — so this list can no longer be spammed with unmoderated content.
  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("reviews")
      .select("id, author, role, quote, rating, type, created_at")
      .eq("status", "approved")
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (!error && data) {
          const approved: Review[] = data.map((r) => ({
            id: r.id,
            author: r.author,
            role: r.role || "Reader",
            quote: r.quote,
            rating: r.rating,
            type: r.type as Review["type"],
            date: r.created_at.split("T")[0],
          }));
          setReviewsList([...defaultReviews, ...approved]);
        } else {
          setReviewsList(defaultReviews);
        }
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !quote.trim()) return;

    const supabase = createClient();
    const { error } = await supabase.from("reviews").insert({
      author: name,
      role: role || "Reader",
      quote,
      rating,
      type: reviewType,
      status: "pending",
    });

    if (error) {
      alert("Something went wrong submitting your review — please try again.");
      return;
    }

    // Reset Form — the review is now pending moderation, not shown instantly.
    setName("");
    setRole("");
    setQuote("");
    setRating(5);
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 6000);
  };

  // Filter and Sort Logic
  const filteredReviews = reviewsList
    .filter((r) => filter === "all" || r.type === filter)
    .sort((a, b) => {
      if (sortBy === "highest") {
        return b.rating - a.rating;
      }
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });

  return (
    <div className="flex-1 flex flex-col pt-16 bg-[#faf8f5] dark:bg-[#070b09]">
      <Navbar />

      {/* Page Header */}
      <header className="py-20 px-4 text-center border-b border-border-custom bg-white dark:bg-[#050806] relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,rgba(223,177,91,0.03)_0%,transparent_70%)] pointer-events-none" />
        <div className="max-w-4xl mx-auto space-y-4 relative z-10">
          <span className="text-[10px] tracking-[0.3em] text-[#b5924b] dark:text-[#dfb15b] uppercase font-bold">
            {content.header_badge}
          </span>
          <h1 className="text-4xl sm:text-5xl font-serif text-foreground leading-tight">
            {content.header_title}
          </h1>
          <p className="text-xs sm:text-sm font-light text-stone-500 dark:text-stone-400 max-w-xl mx-auto leading-relaxed">
            {content.header_subtitle}
          </p>
        </div>
      </header>

      {/* Main Reviews Hub */}
      <section className="py-16 px-4 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 flex-1">
        
        {/* Left Column: Filter Controls and Reviews Listing */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Controls Panel */}
          <div className="flex flex-col sm:flex-row justify-between items-center bg-white dark:bg-[#101614] border border-border-custom p-4 rounded-2xl gap-4">
            
            {/* Filter Buttons */}
            <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
              {[
                { name: "All Reviews", val: "all" },
                { name: "Scholar / Endorsement", val: "celebrity" },
                { name: "Professional", val: "professional" },
                { name: "Reader", val: "reader" }
              ].map((btn) => (
                <button
                  key={btn.val}
                  onClick={() => setFilter(btn.val as any)}
                  className={`px-3 py-1.5 rounded-full text-[10px] uppercase tracking-wider font-semibold cursor-pointer transition-colors ${
                    filter === btn.val
                      ? "bg-[#1e3f20] dark:bg-[#dfb15b] text-white dark:text-black"
                      : "border border-border-custom text-muted-text hover:bg-black/5 dark:hover:bg-white/5"
                  }`}
                >
                  {btn.name}
                </button>
              ))}
            </div>

            {/* Sorting Select */}
            <div className="flex items-center space-x-2 text-xs font-light text-stone-500">
              <span>Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent text-foreground border border-border-custom rounded-md p-1 focus:outline-none text-xs font-semibold"
              >
                <option value="newest">Newest First</option>
                <option value="highest">Highest Rated</option>
              </select>
            </div>

          </div>

          {/* Reviews List */}
          <div className="space-y-6">
            {filteredReviews.length === 0 ? (
              <div className="text-center py-16 border border-dashed border-border-custom rounded-3xl text-muted-text">
                <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-30" />
                <span className="text-xs tracking-wider">No reviews match the selected filter.</span>
              </div>
            ) : (
              filteredReviews.map((rev) => (
                <div
                  key={rev.id}
                  className="bg-white dark:bg-[#101614] border border-border-custom rounded-2xl p-6 space-y-4 hover:shadow-sm transition-shadow animate-[fadeIn_0.3s_ease-out]"
                >
                  {/* Rating Stars & Type Badge */}
                  <div className="flex justify-between items-center">
                    <div className="flex space-x-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${
                            i < rev.rating 
                              ? "fill-[#dfb15b] text-[#dfb15b]" 
                              : "text-stone-300 dark:text-stone-700"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-[9px] uppercase tracking-widest font-mono text-[#dfb15b] border border-[#dfb15b]/20 px-2 py-0.5 rounded-full bg-[#dfb15b]/5">
                      {rev.type}
                    </span>
                  </div>

                  {/* Review Text */}
                  <p className="text-xs sm:text-sm font-light text-stone-600 dark:text-stone-300 leading-relaxed italic">
                    "{rev.quote}"
                  </p>

                  {/* Metadata */}
                  <div className="flex justify-between items-center pt-2 border-t border-border-custom/50 text-[10px] text-muted-text font-mono">
                    <div>
                      <span className="font-sans font-bold text-foreground block text-xs">{rev.author}</span>
                      <span className="block mt-0.5">{rev.role}</span>
                    </div>
                    <span>{rev.date}</span>
                  </div>
                </div>
              ))
            )}
          </div>

        </div>

        {/* Right Column: Write a Review Form Panel */}
        <div className="lg:col-span-4">
          <div className="bg-white dark:bg-[#101614] border border-border-custom rounded-3xl p-6 space-y-6 shadow-sm sticky top-24">
            
            <div className="space-y-2">
              <h3 className="font-serif text-base text-foreground font-semibold flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-[#dfb15b]" />
                <span>{content.sidebar_heading}</span>
              </h3>
              <p className="text-[11px] font-light text-stone-500 leading-relaxed">
                {content.sidebar_desc}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Name */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono uppercase tracking-wider text-stone-400 block font-semibold">Your Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Rohan Gupta"
                  className="w-full text-xs bg-stone-50 dark:bg-[#070b09] border border-border-custom rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-[#dfb15b]/40 text-foreground"
                  required
                />
              </div>

              {/* Role */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono uppercase tracking-wider text-stone-400 block font-semibold">Role / Title</label>
                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="e.g., Software Architect"
                  className="w-full text-xs bg-stone-50 dark:bg-[#070b09] border border-border-custom rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-[#dfb15b]/40 text-foreground"
                />
              </div>

              {/* Rating Star Selection */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono uppercase tracking-wider text-stone-400 block font-semibold">Rating</label>
                <div className="flex space-x-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer"
                    >
                      <Star
                        className={`w-5 h-5 ${
                          star <= rating 
                            ? "fill-[#dfb15b] text-[#dfb15b]" 
                            : "text-stone-300 dark:text-stone-700"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Review Type */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono uppercase tracking-wider text-stone-400 block font-semibold">Reviewer Type</label>
                <div className="flex space-x-4 text-xs font-light text-stone-500">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="reviewer-type"
                      checked={reviewType === "reader"}
                      onChange={() => setReviewType("reader")}
                      className="accent-[#dfb15b]"
                    />
                    <span>Reader</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="reviewer-type"
                      checked={reviewType === "professional"}
                      onChange={() => setReviewType("professional")}
                      className="accent-[#dfb15b]"
                    />
                    <span>Professional</span>
                  </label>
                </div>
              </div>

              {/* Quote */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono uppercase tracking-wider text-stone-400 block font-semibold">Your Review *</label>
                <textarea
                  value={quote}
                  onChange={(e) => setQuote(e.target.value)}
                  placeholder="Share what resonated with you..."
                  rows={4}
                  className="w-full text-xs bg-stone-50 dark:bg-[#070b09] border border-border-custom rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-[#dfb15b]/40 text-foreground resize-none"
                  required
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-full bg-[#1e3f20] hover:bg-[#142a15] dark:bg-[#dfb15b] dark:hover:bg-[#c49945] text-white dark:text-black text-xs uppercase tracking-widest font-bold shadow-md transition-all cursor-pointer"
              >
                Submit Review
              </button>

              {submitted && (
                <div className="p-3 border border-green-500/20 bg-green-500/5 rounded-lg flex items-center gap-2 text-[10px] text-green-600 dark:text-green-400 font-mono">
                  <Check className="w-4 h-4 flex-shrink-0" />
                  <span>Thank you! Your review is pending moderation and will appear here once approved.</span>
                </div>
              )}

            </form>
          </div>
        </div>

      </section>

      <AIChatbot />
      <Footer />
    </div>
  );
}
