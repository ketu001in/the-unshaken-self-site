"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AIChatbot from "@/components/AIChatbot";
import { Search, Calendar, Clock, ArrowLeft, Tag, ArrowRight } from "lucide-react";

type Post = {
  id: string;
  title: string;
  excerpt: string;
  content: string[];
  date: string;
  readTime: string;
  tags: string[];
  imageColor: string;
};

export default function BlogPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTag, setSelectedTag] = useState("all");
  const [activePost, setActivePost] = useState<Post | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);

  const defaultPosts: Post[] = [
    {
      id: "post-1",
      title: "Understanding Sthitaprajna: The Anchor in a Storm",
      excerpt: "Explore the core Bhagavad Gita concept of Sthitaprajna (mental equanimity) and how to apply it during high-stress corporate audits and project delays.",
      content: [
        "In Chapter 2, verse 54 of the Bhagavad Gita, Arjuna asks a very practical question: 'What is the description of one whose mind is steady and fixed in meditation? How does he speak, sit, and walk?' He wanted to know what mental resilience looks like in real, day-to-day action. Krishna responds with the concept of Sthitaprajna.",
        "Sthitaprajna literally translates to 'one whose wisdom is steady'. It describes a mind that remains unchanged by external happenings. It doesn't mean a person who feels no emotions. Rather, it represents a person who witnesses their emotions without being swept away by them.",
        "In modern terms, when a project is delayed or an audit goes wrong, our typical response is panic. We identify with the failure. A steady mind, however, steps back and asks: 'What is in my control right now?'. It treats success and failure as temporary weather patterns, remaining still at the core. That is the essence of *The Unshaken Self*."
      ],
      date: "2026-07-12",
      readTime: "5 min read",
      tags: ["Gita Reflections", "Mindfulness"],
      imageColor: "from-[#1e3f20]/30 to-[#070b09]/20"
    },
    {
      id: "post-2",
      title: "Why Karma Yoga is the Ultimate Burnout Antidote",
      excerpt: "Performance anxiety ruins our craft. Discover how detaching from the final result (Gita 2.47) actually improves output and protects your mental health.",
      content: [
        "In our modern results-driven culture, we are taught to obsess over results. We tie our self-worth to KPIs, revenue charts, and follower counts. While this can drive short-term action, it inevitably leads to burnout and severe performance anxiety.",
        "The Bhagavad Gita offers a radical alternative in verse 2.47: *'Karmanye vadhikaraste ma phaleshu kadachana'*—You have a right to perform your prescribed actions, but you are not entitled to the fruits of those actions.",
        "This teaching, known as Karma Yoga, is the ultimate burnout antidote. When you detach your ego from the final result and place 100% of your energy into the craft itself, your anxiety vanishes. You write better code, make cleaner designs, and lead teams with greater compassion because you are no longer operating out of fear. You focus on execution, letting the universe handle the results."
      ],
      date: "2026-07-05",
      readTime: "6 min read",
      tags: ["Productivity", "Mindfulness"],
      imageColor: "from-[#b5924b]/30 to-[#070b09]/20"
    },
    {
      id: "post-3",
      title: "The Road to Janmashtami: Behind the Scenes of The Unshaken Self",
      excerpt: "Author Ketul Shah shares the writing process, editing milestones, and what to expect during the upcoming August preorder launches.",
      content: [
        "As we approach the planned launch of *The Unshaken Self* on Krishna Janmashtami (September 4–5, 2026), I wanted to take a moment to share the journey of writing this book.",
        "Over the last three years, I have spoken with hundreds of professionals, students, and counselors. The core challenge was always the same: how do we apply timeless philosophy to concrete, modern struggles? Translating the Gita's 700 verses into 18 practical chapters with daily exercises was a massive undertaking.",
        "Currently, our team is finalising hardcovers and preparing exclusive preorder bonuses. In mid-August, we will release sample worksheets, audio read-throughs, and open registrations for our launch events. Thank you for walking this path of stillness with me."
      ],
      date: "2026-06-28",
      readTime: "3 min read",
      tags: ["Launch News"],
      imageColor: "from-[#122815]/30 to-[#dfb15b]/20"
    },
    {
      id: "post-4",
      title: "How to Build an 'Unshaken' Morning Routine",
      excerpt: "A simple 15-minute morning routine inspired by Chapter 6 (Dhyana Yoga) to ground your mind before opening your email inbox.",
      content: [
        "How you start your morning determines the trajectory of your day. If the first thing you do upon waking is check email notifications, you are immediately putting your nervous system in a reactive, anxious state.",
        "Chapter 6 of the Gita (Dhyana Yoga) outlines guidelines for meditation: sitting in a clean, quiet space, keeping the spine aligned, and steadying the gaze. We can adapt this into a simple 15-minute modern morning anchor.",
        "• **Minutes 1-5 (Physical Stillness):** Sit comfortably with your spine tall. Close your eyes and observe your body. Release tension in your shoulders and jaw.",
        "• **Minutes 6-10 (Breath Anchoring):** Inhale slowly for 4 seconds, hold for 4 seconds, and exhale for 6 seconds. Anchor your wandering mind strictly to the flow of air.",
        "• **Minutes 11-15 (Detached Intentions):** Write down three actions you must perform today. Next to each, write: 'I will do my absolute best, and accept whatever result follows.' Then, step into your day unshaken."
      ],
      date: "2026-06-18",
      readTime: "4 min read",
      tags: ["Mindfulness", "Productivity"],
      imageColor: "from-stone-400/30 to-[#070b09]/20"
    }
  ];

  useEffect(() => {
    const savedPosts = localStorage.getItem("blog_posts");
    if (savedPosts) {
      setPosts(JSON.parse(savedPosts));
    } else {
      localStorage.setItem("blog_posts", JSON.stringify(defaultPosts));
      setPosts(defaultPosts);
    }
  }, []);

  // Extraction of unique tags
  const allTags = ["all", "Gita Reflections", "Mindfulness", "Productivity", "Launch News"];

  // Filter logic
  const filteredPosts = posts.filter((post) => {
    const matchesSearch = 
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      post.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTag = selectedTag === "all" || post.tags.includes(selectedTag);

    return matchesSearch && matchesTag;
  });

  return (
    <div className="flex-1 flex flex-col pt-16 bg-[#faf8f5] dark:bg-[#070b09]">
      <Navbar />

      {activePost === null ? (
        /* BLOG HOME VIEW */
        <>
          {/* Page Header */}
          <header className="py-20 px-4 text-center border-b border-border-custom bg-white dark:bg-[#050806] relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,rgba(223,177,91,0.03)_0%,transparent_70%)] pointer-events-none" />
            <div className="max-w-4xl mx-auto space-y-4 relative z-10">
              <span className="text-[10px] tracking-[0.3em] text-[#b5924b] dark:text-[#dfb15b] uppercase font-bold">
                Timeless Reflections
              </span>
              <h1 className="text-4xl sm:text-5xl font-serif text-foreground leading-tight">
                The Inner Anchor Blog
              </h1>
              <p className="text-xs sm:text-sm font-light text-stone-500 dark:text-stone-400 max-w-xl mx-auto leading-relaxed">
                Reflections, exercises, and essays written by KETUL SHAH on translating ancient scripture into modern mental strategies.
              </p>
            </div>
          </header>

          {/* Blog Content Section */}
          <section className="py-16 px-4 max-w-7xl mx-auto w-full flex-1 space-y-12">
            
            {/* Search and Tags Filtering Header */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-6 bg-white dark:bg-[#101614] border border-border-custom p-5 rounded-3xl">
              
              {/* Category Chips */}
              <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                {allTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setSelectedTag(tag)}
                    className={`px-3 py-1.5 rounded-full text-[10px] uppercase tracking-wider font-semibold cursor-pointer transition-colors ${
                      selectedTag === tag
                        ? "bg-[#1e3f20] dark:bg-[#dfb15b] text-white dark:text-black"
                        : "border border-border-custom text-muted-text hover:bg-black/5 dark:hover:bg-white/5"
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>

              {/* Search Bar */}
              <div className="relative w-full md:w-80">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-stone-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search articles..."
                  className="w-full text-xs bg-stone-50 dark:bg-[#070b09] border border-border-custom rounded-full pl-9 pr-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-[#dfb15b]/40 text-foreground"
                />
              </div>

            </div>

            {/* Articles Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {filteredPosts.length === 0 ? (
                <div className="col-span-2 text-center py-20 border border-dashed border-border-custom rounded-3xl text-muted-text">
                  <Search className="w-12 h-12 mx-auto mb-4 opacity-30" />
                  <p className="text-xs tracking-wider">No articles match your query.</p>
                </div>
              ) : (
                filteredPosts.map((post) => (
                  <article
                    key={post.id}
                    className="bg-white dark:bg-[#101614] border border-border-custom rounded-3xl overflow-hidden flex flex-col justify-between hover:shadow-lg transition-all duration-300 group hover:-translate-y-1"
                  >
                    <div>
                      {/* Image color block placeholder */}
                      <div className={`h-40 bg-gradient-to-br ${post.imageColor} border-b border-border-custom relative flex items-center justify-center`}>
                        <Tag className="w-8 h-8 text-[#dfb15b]/40" />
                      </div>
                      
                      {/* Text info */}
                      <div className="p-6 space-y-4">
                        <div className="flex items-center space-x-4 text-[10px] text-muted-text font-mono">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            {post.date}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {post.readTime}
                          </span>
                        </div>

                        <h3 className="font-serif text-lg text-foreground font-bold tracking-wide group-hover:text-[#dfb15b] transition-colors leading-snug">
                          {post.title}
                        </h3>
                        <p className="text-xs sm:text-[13px] font-light text-stone-500 dark:text-stone-400 leading-relaxed">
                          {post.excerpt}
                        </p>
                      </div>
                    </div>

                    <div className="p-6 pt-0 border-t border-border-custom/50 flex justify-between items-center mt-4">
                      <div className="flex space-x-1.5">
                        {post.tags.map((t) => (
                          <span key={t} className="text-[9px] font-mono text-[#b5924b] dark:text-[#dfb15b] uppercase bg-[#dfb15b]/5 border border-[#dfb15b]/10 px-2 py-0.5 rounded">
                            {t}
                          </span>
                        ))}
                      </div>
                      <button
                        onClick={() => setActivePost(post)}
                        className="text-xs font-semibold text-primary dark:text-[#dfb15b] hover:underline flex items-center space-x-1 cursor-pointer"
                      >
                        <span>Read Essay</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </article>
                ))
              )}
            </div>

          </section>
        </>
      ) : (
        /* SINGLE POST DETAIL VIEW */
        <article className="max-w-3xl mx-auto w-full py-16 px-4 flex-1 space-y-8 animate-[fadeIn_0.3s_ease-out]">
          
          {/* Back button */}
          <button
            onClick={() => setActivePost(null)}
            className="inline-flex items-center space-x-2 text-xs uppercase tracking-widest font-semibold text-muted-text hover:text-foreground cursor-pointer transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Articles</span>
          </button>

          {/* Header Metadata */}
          <div className="space-y-4">
            <div className="flex items-center space-x-4 text-xs text-muted-text font-mono">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                {activePost.date}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                {activePost.readTime}
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif text-foreground leading-tight tracking-wide">
              {activePost.title}
            </h1>
            <div className="flex space-x-2 pt-2">
              {activePost.tags.map((t) => (
                <span key={t} className="text-[10px] font-mono text-[#b5924b] dark:text-[#dfb15b] uppercase bg-[#dfb15b]/10 border border-[#dfb15b]/20 px-3 py-1 rounded-full">
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* Banner Placeholder */}
          <div className={`h-64 rounded-3xl bg-gradient-to-tr ${activePost.imageColor} border border-border-custom flex items-center justify-center shadow-inner`}>
            <span className="font-serif italic text-stone-300 dark:text-stone-700 text-lg">The Unshaken Self Reflections</span>
          </div>

          {/* Article Text Content */}
          <div className="space-y-6 text-stone-600 dark:text-stone-300 font-light text-sm sm:text-base leading-relaxed text-justify">
            {activePost.content.map((p, idx) => {
              if (p.startsWith("•")) {
                return (
                  <div key={idx} className="pl-6 border-l-2 border-[#dfb15b] italic my-4 text-stone-500">
                    {p}
                  </div>
                );
              }
              return <p key={idx}>{p}</p>;
            })}
          </div>

          {/* Footer Callout */}
          <div className="pt-8 border-t border-border-custom flex flex-col sm:flex-row sm:justify-between sm:items-center text-xs text-stone-500 gap-4">
            <span>Written by KETUL SHAH • Author, The Unshaken Self</span>
            <button
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                alert("Article link copied to clipboard!");
              }}
              className="text-[#dfb15b] hover:underline font-semibold cursor-pointer"
            >
              Share Article Link
            </button>
          </div>

        </article>
      )}

      <AIChatbot />
      <Footer />
    </div>
  );
}
