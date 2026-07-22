"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AIChatbot from "@/components/AIChatbot";
import { Users, Calendar, Bell, MessageSquare, Trash2, Award, ArrowUpRight, LogOut, Check, X as XIcon } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import SiteEditor from "@/components/admin/SiteEditor";

type LoggedSubscriber = { id: string; email: string; date: string; source: string };
type LoggedRSVP = { id: string; eventId: string; eventTitle: string; name: string; email: string; date: string };
type LoggedWaitlist = { id: string; email: string; preferredStore: string; date: string };
type LoggedReview = { id: string; author: string; role: string; quote: string; rating: number; type: string; status: "pending" | "approved" | "rejected"; date: string };

export default function AdminDashboard() {
  const router = useRouter();
  const [adminEmail, setAdminEmail] = useState("");
  const [activeTab, setActiveTab] = useState<"subscribers" | "rsvps" | "waitlist" | "reviews" | "content" | "site">("subscribers");
  const [subscribers, setSubscribers] = useState<LoggedSubscriber[]>([]);
  const [rsvps, setRsvps] = useState<LoggedRSVP[]>([]);
  const [waitlist, setWaitlist] = useState<LoggedWaitlist[]>([]);
  const [reviews, setReviews] = useState<LoggedReview[]>([]);

  // Content Manager Input States
  const [blogTitle, setBlogTitle] = useState("");
  const [blogExcerpt, setBlogExcerpt] = useState("");
  const [blogContent, setBlogContent] = useState("");
  const [blogTags, setBlogTags] = useState("");
  const [blogReadTime, setBlogReadTime] = useState("");

  const [eventTitle, setEventTitle] = useState("");
  const [eventDesc, setEventDesc] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventTime, setEventTime] = useState("");
  const [eventLocation, setEventLocation] = useState("");
  const [eventType, setEventType] = useState<"virtual" | "in-person">("virtual");
  const [editingEventId, setEditingEventId] = useState<string | null>(null);

  const [cmsBlogPosts, setCmsBlogPosts] = useState<any[]>([]);
  const [cmsEvents, setCmsEvents] = useState<any[]>([]);

  // Pull every tab's data from the real database. Called on mount and after
  // any create/delete/approve action so the dashboard reflects real state.
  const refreshData = async () => {
    const supabase = createClient();

    const [subsRes, rsvpsRes, waitlistRes, reviewsRes, postsRes, eventsRes] = await Promise.all([
      supabase.from("subscribers").select("id, email, source, created_at").order("created_at", { ascending: false }),
      supabase.from("rsvps").select("id, event_id, event_title, name, email, created_at").order("created_at", { ascending: false }),
      supabase.from("preorder_waitlist").select("id, email, preferred_store, created_at").order("created_at", { ascending: false }),
      supabase.from("reviews").select("id, author, role, quote, rating, type, status, created_at").order("created_at", { ascending: false }),
      supabase.from("blog_posts").select("id, title, excerpt, content, tags, read_time, published_date, created_at").order("created_at", { ascending: false }),
      supabase.from("events").select("id, title, description, event_date, event_time, location, event_type, capacity, created_at").order("created_at", { ascending: false }),
    ]);

    if (subsRes.data) setSubscribers(subsRes.data.map((s) => ({ id: s.id, email: s.email, source: s.source, date: s.created_at })));
    if (rsvpsRes.data) setRsvps(rsvpsRes.data.map((r) => ({ id: r.id, eventId: r.event_id, eventTitle: r.event_title, name: r.name, email: r.email, date: r.created_at })));
    if (waitlistRes.data) setWaitlist(waitlistRes.data.map((w) => ({ id: w.id, email: w.email, preferredStore: w.preferred_store || "Any", date: w.created_at })));
    if (reviewsRes.data) setReviews(reviewsRes.data.map((r) => ({ id: r.id, author: r.author, role: r.role || "Reader", quote: r.quote, rating: r.rating, type: r.type, status: r.status, date: r.created_at })));
    if (postsRes.data) setCmsBlogPosts(postsRes.data.map((p) => ({ id: p.id, title: p.title, excerpt: p.excerpt, date: p.published_date, readTime: p.read_time })));
    if (eventsRes.data) setCmsEvents(eventsRes.data.map((ev) => ({
      id: ev.id,
      title: ev.title,
      desc: ev.description,
      date: ev.event_date,
      time: ev.event_time,
      location: ev.location,
      type: ev.event_type,
      capacity: ev.capacity,
    })));
  };

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (data.user?.email) setAdminEmail(data.user.email);
    });
    refreshData();
  }, []);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
  };

  const handleApproveReview = async (id: string) => {
    const supabase = createClient();
    await supabase.from("reviews").update({ status: "approved" }).eq("id", id);
    refreshData();
  };

  const handleRejectReview = async (id: string) => {
    const supabase = createClient();
    await supabase.from("reviews").update({ status: "rejected" }).eq("id", id);
    refreshData();
  };

  const handleDeleteReview = async (id: string) => {
    const supabase = createClient();
    await supabase.from("reviews").delete().eq("id", id);
    refreshData();
  };

  const handleCreateBlogPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!blogTitle.trim() || !blogExcerpt.trim() || !blogContent.trim()) return;

    const supabase = createClient();
    const { error } = await supabase.from("blog_posts").insert({
      title: blogTitle,
      excerpt: blogExcerpt,
      content: blogContent.split("\n").filter((p) => p.trim() !== ""),
      read_time: blogReadTime || "5 min read",
      tags: blogTags.split(",").map((t) => t.trim()).filter(Boolean),
    });

    if (error) {
      alert("Something went wrong publishing this post — please try again.");
      return;
    }

    setBlogTitle("");
    setBlogExcerpt("");
    setBlogContent("");
    setBlogTags("");
    setBlogReadTime("");
    await refreshData();
    alert("Blog post successfully published to live site!");
  };

  const handleDeleteBlogPost = async (id: string) => {
    if (confirm("Are you sure you want to delete this blog post?")) {
      const supabase = createClient();
      await supabase.from("blog_posts").delete().eq("id", id);
      refreshData();
    }
  };

  const resetEventForm = () => {
    setEditingEventId(null);
    setEventTitle("");
    setEventDesc("");
    setEventDate("");
    setEventTime("");
    setEventLocation("");
    setEventType("virtual");
  };

  const handleEditEventClick = (ev: any) => {
    setEditingEventId(ev.id);
    setEventTitle(ev.title || "");
    setEventDesc(ev.desc || "");
    setEventDate(ev.date || "");
    setEventTime(ev.time || "");
    setEventLocation(ev.location || "");
    setEventType(ev.type === "in-person" ? "in-person" : "virtual");
    // Scroll the form into view so the edit is obvious, especially on mobile
    // where the form and the list aren't side by side.
    document.getElementById("event-form")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleSubmitEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventTitle.trim() || !eventDesc.trim() || !eventDate.trim() || !eventLocation.trim()) return;

    const supabase = createClient();

    if (editingEventId) {
      // Editing an existing event — update in place rather than the old
      // delete-and-recreate workaround, so the date/time can be changed
      // directly without losing the event's RSVPs (they're linked by
      // event_id, which stays the same on an update).
      const { error } = await supabase
        .from("events")
        .update({
          title: eventTitle,
          description: eventDesc,
          event_date: eventDate,
          event_time: eventTime || "TBD",
          location: eventLocation,
          event_type: eventType,
        })
        .eq("id", editingEventId);

      if (error) {
        alert("Something went wrong saving these changes — please try again.");
        return;
      }

      resetEventForm();
      await refreshData();
      alert("Event updated — the new date/time is live on the Events page.");
      return;
    }

    const { error } = await supabase.from("events").insert({
      title: eventTitle,
      description: eventDesc,
      event_date: eventDate,
      event_time: eventTime || "TBD",
      location: eventLocation,
      event_type: eventType,
      capacity: eventType === "virtual" ? "Unlimited" : "100 seats max",
    });

    if (error) {
      alert("Something went wrong scheduling this event — please try again.");
      return;
    }

    resetEventForm();
    await refreshData();
    alert("Event successfully scheduled and live!");
  };

  const handleDeleteEvent = async (id: string) => {
    if (confirm("Are you sure you want to delete this event?")) {
      const supabase = createClient();
      await supabase.from("events").delete().eq("id", id);
      if (editingEventId === id) resetEventForm();
      refreshData();
    }
  };


  return (
    <div className="flex-1 flex flex-col pt-16 bg-[#faf8f5] dark:bg-[#070b09]">
      <Navbar />

      {/* Header */}
      <header className="py-12 px-4 border-b border-border-custom bg-white dark:bg-[#050806] relative">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-6">
          <div className="space-y-2 text-center sm:text-left">
            <span className="text-[9px] tracking-widest font-mono text-[#dfb15b] uppercase font-bold">Admin Console</span>
            <h1 className="text-3xl font-serif text-foreground">Launch Analytics Dashboard</h1>
            <p className="text-xs text-muted-text font-light">
              {adminEmail ? `Signed in as ${adminEmail}` : "Loading session…"} — real sign-ups, RSVPs, and reviews from Supabase.
            </p>
          </div>
          <button
            onClick={handleSignOut}
            className="px-4 py-2 text-[10px] font-mono border border-border-custom text-foreground rounded-lg hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer transition-colors flex items-center gap-2"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto w-full px-4 py-12 flex-1 space-y-10">
        
        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Card 1: Subscribers */}
          <div className="bg-white dark:bg-[#101614] border border-border-custom p-6 rounded-2xl flex items-center space-x-4 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-[#1e3f20]/5 dark:bg-[#dfb15b]/10 text-primary dark:text-[#dfb15b] flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-mono tracking-wider text-stone-400 font-semibold">Subscribers</span>
              <h3 className="text-2xl font-serif text-foreground font-bold mt-1">{subscribers.length}</h3>
            </div>
          </div>

          {/* Card 2: RSVPs */}
          <div className="bg-white dark:bg-[#101614] border border-border-custom p-6 rounded-2xl flex items-center space-x-4 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-[#1e3f20]/5 dark:bg-[#dfb15b]/10 text-primary dark:text-[#dfb15b] flex items-center justify-center">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-mono tracking-wider text-stone-400 font-semibold">Event RSVPs</span>
              <h3 className="text-2xl font-serif text-foreground font-bold mt-1">{rsvps.length}</h3>
            </div>
          </div>

          {/* Card 3: Notify-Me Waitlist */}
          <div className="bg-white dark:bg-[#101614] border border-border-custom p-6 rounded-2xl flex items-center space-x-4 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-[#1e3f20]/5 dark:bg-[#dfb15b]/10 text-primary dark:text-[#dfb15b] flex items-center justify-center">
              <Bell className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-mono tracking-wider text-stone-400 font-semibold">Notify-Me Waitlist</span>
              <h3 className="text-2xl font-serif text-foreground font-bold mt-1">{waitlist.length}</h3>
            </div>
          </div>

          {/* Card 4: Moderated Reviews */}
          <div className="bg-white dark:bg-[#101614] border border-border-custom p-6 rounded-2xl flex items-center space-x-4 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-[#1e3f20]/5 dark:bg-[#dfb15b]/10 text-primary dark:text-[#dfb15b] flex items-center justify-center">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-mono tracking-wider text-stone-400 font-semibold">
                Reviews ({reviews.filter((r) => r.status === "pending").length} pending)
              </span>
              <h3 className="text-2xl font-serif text-foreground font-bold mt-1">{reviews.length}</h3>
            </div>
          </div>

        </div>

        {/* Charts Mockup Section */}
        <div className="bg-white dark:bg-[#101614] border border-border-custom rounded-3xl p-6 md:p-8 space-y-6">
          <div className="flex justify-between items-center pb-4 border-b border-border-custom/50">
            <div>
              <h3 className="font-serif text-base text-foreground font-semibold">Conversion Tracking</h3>
              <p className="text-[10px] text-muted-text">Illustrative sample chart — not wired to real daily counts yet.</p>
            </div>
            <span className="text-[9px] font-mono text-stone-400 bg-stone-500/10 px-2 py-0.5 rounded-full font-bold uppercase tracking-widest flex items-center gap-1">
              Sample Data
              <ArrowUpRight className="w-3 h-3" />
            </span>
          </div>

          {/* CSS-based Bar Chart */}
          <div className="flex items-end justify-between h-40 pt-4 max-w-lg mx-auto md:mx-0 font-mono text-[9px] text-stone-400">
            {[
              { day: "July 12", val: 12, height: "h-[30%]" },
              { day: "July 13", val: 18, height: "h-[45%]" },
              { day: "July 14", val: 25, height: "h-[60%]" },
              { day: "July 15", val: 42, height: "h-[90%]" },
              { day: "July 16", val: 30, height: "h-[70%]" }
            ].map((bar, i) => (
              <div key={i} className="flex flex-col items-center space-y-2 flex-1">
                <span className="text-foreground font-semibold">{bar.val}</span>
                <div className={`w-8 bg-gradient-to-t from-[#1e3f20] to-[#dfb15b] rounded-t-sm shadow-sm transition-all duration-500 ${bar.height}`} />
                <span className="tracking-tighter">{bar.day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Tab Controls and Tables */}
        <div className="space-y-6">
          
          {/* Tab buttons */}
          <div className="flex border-b border-border-custom pb-3 space-x-6">
            {[
              { id: "subscribers", label: "Newsletter List" },
              { id: "rsvps", label: "RSVPs Calendar" },
              { id: "waitlist", label: "Notify-Me Waitlist" },
              { id: "reviews", label: "Moderate Reviews" },
              { id: "content", label: "Manage Content" },
              { id: "site", label: "Site Editor" }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`text-xs uppercase tracking-widest pb-1 font-semibold cursor-pointer transition-colors ${
                  activeTab === tab.id
                    ? "text-[#dfb15b] border-b-2 border-[#dfb15b]"
                    : "text-muted-text hover:text-foreground"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content Tables */}
          <div className="border border-border-custom rounded-2xl overflow-hidden bg-white dark:bg-[#101614] shadow-sm">
            
            {activeTab === "subscribers" && (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-stone-50 dark:bg-black/20 text-muted-text font-mono uppercase tracking-wider border-b border-border-custom">
                      <th className="p-4 font-semibold">Subscriber Email</th>
                      <th className="p-4 font-semibold">Signed Date</th>
                      <th className="p-4 font-semibold">Capture Point</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-custom font-light">
                    {subscribers.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="p-4 text-center text-muted-text font-mono">No subscribers logged.</td>
                      </tr>
                    ) : (
                      subscribers.map((sub, i) => (
                        <tr key={i} className="hover:bg-stone-50/50 dark:hover:bg-white/5 transition-colors">
                          <td className="p-4 font-sans font-medium text-foreground">{sub.email}</td>
                          <td className="p-4 font-mono text-muted-text">{new Date(sub.date).toLocaleString()}</td>
                          <td className="p-4 font-mono text-stone-500">{sub.source}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === "rsvps" && (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-stone-50 dark:bg-black/20 text-muted-text font-mono uppercase tracking-wider border-b border-border-custom">
                      <th className="p-4 font-semibold">Attendee</th>
                      <th className="p-4 font-semibold">Email</th>
                      <th className="p-4 font-semibold">Event Target</th>
                      <th className="p-4 font-semibold">Registered Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-custom font-light">
                    {rsvps.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="p-4 text-center text-muted-text font-mono">No attendees registered.</td>
                      </tr>
                    ) : (
                      rsvps.map((rsvp, i) => (
                        <tr key={i} className="hover:bg-stone-50/50 dark:hover:bg-white/5 transition-colors">
                          <td className="p-4 font-sans font-medium text-foreground">{rsvp.name}</td>
                          <td className="p-4 font-sans text-stone-500">{rsvp.email}</td>
                          <td className="p-4 font-serif text-[#dfb15b] font-semibold">{rsvp.eventTitle}</td>
                          <td className="p-4 font-mono text-muted-text">{new Date(rsvp.date).toLocaleString()}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === "waitlist" && (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-stone-50 dark:bg-black/20 text-muted-text font-mono uppercase tracking-wider border-b border-border-custom">
                      <th className="p-4 font-semibold">Email</th>
                      <th className="p-4 font-semibold">Preferred Store</th>
                      <th className="p-4 font-semibold">Joined Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-custom font-light">
                    {waitlist.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="p-4 text-center text-muted-text font-mono">No one on the waitlist yet.</td>
                      </tr>
                    ) : (
                      waitlist.map((w, i) => (
                        <tr key={i} className="hover:bg-stone-50/50 dark:hover:bg-white/5 transition-colors">
                          <td className="p-4 font-sans font-medium text-foreground">{w.email}</td>
                          <td className="p-4 font-sans text-[#dfb15b]">{w.preferredStore}</td>
                          <td className="p-4 font-mono text-muted-text">{new Date(w.date).toLocaleString()}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === "reviews" && (
              <div className="divide-y divide-border-custom">
                {reviews.length === 0 ? (
                  <div className="p-8 text-center text-muted-text font-mono">No reader reviews submitted from reviews page.</div>
                ) : (
                  reviews.map((rev) => (
                    <div
                      key={rev.id}
                      className="p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-stone-50/50 dark:hover:bg-white/5 transition-colors"
                    >
                      <div className="space-y-2 max-w-xl">
                        <div className="flex items-center space-x-2 text-[10px] text-muted-text font-mono">
                          <span className="text-foreground font-bold font-sans text-xs">{rev.author}</span>
                          <span>•</span>
                          <span>{rev.role}</span>
                          <span>•</span>
                          <span className="text-[#dfb15b] font-bold">★ {rev.rating}/5</span>
                          <span>•</span>
                          <span className={`font-bold uppercase ${
                            rev.status === "approved" ? "text-green-600 dark:text-green-400"
                              : rev.status === "rejected" ? "text-red-500"
                              : "text-amber-500"
                          }`}>{rev.status}</span>
                        </div>
                        <p className="text-xs font-light text-stone-500 dark:text-stone-400 italic">
                          "{rev.quote}"
                        </p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {rev.status !== "approved" && (
                          <button
                            onClick={() => handleApproveReview(rev.id)}
                            className="px-3 py-1.5 rounded-lg border border-green-500/20 text-green-600 dark:text-green-400 hover:bg-green-500/10 flex items-center gap-1 text-[10px] font-mono cursor-pointer"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Approve</span>
                          </button>
                        )}
                        {rev.status !== "rejected" && (
                          <button
                            onClick={() => handleRejectReview(rev.id)}
                            className="px-3 py-1.5 rounded-lg border border-border-custom text-muted-text hover:bg-black/5 dark:hover:bg-white/5 flex items-center gap-1 text-[10px] font-mono cursor-pointer"
                          >
                            <XIcon className="w-3.5 h-3.5" />
                            <span>Reject</span>
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteReview(rev.id)}
                          className="px-3 py-1.5 rounded-lg border border-red-500/20 text-red-500 hover:bg-red-500/10 flex items-center gap-1 text-[10px] font-mono cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === "content" && (
              <div className="p-6 md:p-8 space-y-12">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                  {/* LEFT: ADD CONTENT FORMS */}
                  <div className="lg:col-span-6 space-y-10">
                    
                    {/* Add Blog Post */}
                    <div className="space-y-4">
                      <h3 className="font-serif text-base text-foreground font-bold border-b border-border-custom/50 pb-2">Publish New Blog Post</h3>
                      <form onSubmit={handleCreateBlogPost} className="space-y-3">
                        <div className="space-y-1">
                          <label className="text-[10px] font-mono uppercase text-stone-400 font-bold block">Post Title *</label>
                          <input
                            type="text"
                            value={blogTitle}
                            onChange={(e) => setBlogTitle(e.target.value)}
                            placeholder="e.g., The Secret to Decoupling Action"
                            className="w-full text-xs bg-stone-50 dark:bg-[#070b09] border border-border-custom p-2.5 rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-[#dfb15b]/40"
                            required
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-mono uppercase text-stone-400 font-bold block">Excerpt / Summary *</label>
                          <input
                            type="text"
                            value={blogExcerpt}
                            onChange={(e) => setBlogExcerpt(e.target.value)}
                            placeholder="e.g., Learn to release outcome attachment..."
                            className="w-full text-xs bg-stone-50 dark:bg-[#070b09] border border-border-custom p-2.5 rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-[#dfb15b]/40"
                            required
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-mono uppercase text-stone-400 font-bold block">Content (separate paragraphs by new line) *</label>
                          <textarea
                            value={blogContent}
                            onChange={(e) => setBlogContent(e.target.value)}
                            placeholder="Type paragraph one here...&#10;Type paragraph two here..."
                            rows={5}
                            className="w-full text-xs bg-stone-50 dark:bg-[#070b09] border border-border-custom p-2.5 rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-[#dfb15b]/40 resize-none font-sans"
                            required
                          ></textarea>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-[10px] font-mono uppercase text-stone-400 font-bold block">Tags (comma-separated)</label>
                            <input
                              type="text"
                              value={blogTags}
                              onChange={(e) => setBlogTags(e.target.value)}
                              placeholder="e.g., Productivity, Gita"
                              className="w-full text-xs bg-stone-50 dark:bg-[#070b09] border border-border-custom p-2.5 rounded-lg text-foreground focus:outline-none"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-mono uppercase text-stone-400 font-bold block">Read Time</label>
                            <input
                              type="text"
                              value={blogReadTime}
                              onChange={(e) => setBlogReadTime(e.target.value)}
                              placeholder="e.g., 5 min read"
                              className="w-full text-xs bg-stone-50 dark:bg-[#070b09] border border-border-custom p-2.5 rounded-lg text-foreground focus:outline-none"
                            />
                          </div>
                        </div>
                        <button
                          type="submit"
                          className="w-full py-2.5 rounded-full bg-[#0f2b48] dark:bg-[#dfb15b] text-white dark:text-black text-xs uppercase tracking-widest font-bold shadow-md cursor-pointer hover:opacity-90 transition-opacity"
                        >
                          Publish Blog Post
                        </button>
                      </form>
                    </div>

                    {/* Add / Edit Event */}
                    <div id="event-form" className="space-y-4 pt-6 border-t border-border-custom/50">
                      <div className="flex items-center justify-between border-b border-border-custom/50 pb-2">
                        <h3 className="font-serif text-base text-foreground font-bold">
                          {editingEventId ? "Edit Launch Event" : "Schedule New Launch Event"}
                        </h3>
                        {editingEventId && (
                          <button
                            type="button"
                            onClick={resetEventForm}
                            className="text-[10px] font-mono uppercase text-muted-text hover:text-foreground cursor-pointer"
                          >
                            Cancel Edit
                          </button>
                        )}
                      </div>
                      {editingEventId && (
                        <p className="text-[10px] text-[#dfb15b] font-mono -mt-2">
                          Editing "{eventTitle}" — change the date/time below and save. RSVPs for this event stay linked.
                        </p>
                      )}
                      <form onSubmit={handleSubmitEvent} className="space-y-3">
                        <div className="space-y-1">
                          <label className="text-[10px] font-mono uppercase text-stone-400 font-bold block">Event Title *</label>
                          <input
                            type="text"
                            value={eventTitle}
                            onChange={(e) => setEventTitle(e.target.value)}
                            placeholder="e.g., Book Reading in Mumbai"
                            className="w-full text-xs bg-stone-50 dark:bg-[#070b09] border border-border-custom p-2.5 rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-[#dfb15b]/40"
                            required
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-mono uppercase text-stone-400 font-bold block">Description *</label>
                          <input
                            type="text"
                            value={eventDesc}
                            onChange={(e) => setEventDesc(e.target.value)}
                            placeholder="e.g., Join us for a book signing session..."
                            className="w-full text-xs bg-stone-50 dark:bg-[#070b09] border border-border-custom p-2.5 rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-[#dfb15b]/40"
                            required
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-[10px] font-mono uppercase text-stone-400 font-bold block">Date *</label>
                            <input
                              type="text"
                              value={eventDate}
                              onChange={(e) => setEventDate(e.target.value)}
                              placeholder="e.g., September 12, 2026"
                              className="w-full text-xs bg-stone-50 dark:bg-[#070b09] border border-border-custom p-2.5 rounded-lg text-foreground focus:outline-none"
                              required
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-mono uppercase text-stone-400 font-bold block">Time</label>
                            <input
                              type="text"
                              value={eventTime}
                              onChange={(e) => setEventTime(e.target.value)}
                              placeholder="e.g., 5:00 PM IST"
                              className="w-full text-xs bg-stone-50 dark:bg-[#070b09] border border-border-custom p-2.5 rounded-lg text-foreground focus:outline-none"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-[10px] font-mono uppercase text-stone-400 font-bold block">Location / Link *</label>
                            <input
                              type="text"
                              value={eventLocation}
                              onChange={(e) => setEventLocation(e.target.value)}
                              placeholder="e.g., Indiranagar, Bangalore"
                              className="w-full text-xs bg-stone-50 dark:bg-[#070b09] border border-border-custom p-2.5 rounded-lg text-foreground focus:outline-none"
                              required
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-mono uppercase text-stone-400 font-bold block">Event Type</label>
                            <select
                              value={eventType}
                              onChange={(e) => setEventType(e.target.value as any)}
                              className="w-full text-xs bg-stone-50 dark:bg-[#070b09] border border-border-custom p-2.5 rounded-lg text-foreground focus:outline-none"
                            >
                              <option value="virtual">Virtual Event</option>
                              <option value="in-person">In-Person Event</option>
                            </select>
                          </div>
                        </div>
                        <button
                          type="submit"
                          className="w-full py-2.5 rounded-full bg-[#0f2b48] dark:bg-[#dfb15b] text-white dark:text-black text-xs uppercase tracking-widest font-bold shadow-md cursor-pointer hover:opacity-90 transition-opacity"
                        >
                          {editingEventId ? "Save Changes" : "Schedule Event"}
                        </button>
                      </form>
                    </div>
                  </div>

                  {/* RIGHT: CURRENT LISTINGS LIST */}
                  <div className="lg:col-span-6 space-y-10 border-t lg:border-t-0 lg:border-l border-border-custom/50 pt-10 lg:pt-0 lg:pl-10">
                    
                    {/* Blog Posts list */}
                    <div className="space-y-4">
                      <h3 className="font-serif text-base text-foreground font-bold border-b border-border-custom/50 pb-2">Active Blog Posts ({cmsBlogPosts.length})</h3>
                      {cmsBlogPosts.length === 0 ? (
                        <p className="text-xs text-muted-text font-mono">No blog posts found in database.</p>
                      ) : (
                        <div className="space-y-2 max-h-60 overflow-y-auto no-scrollbar pr-2">
                          {cmsBlogPosts.map((post: any) => (
                            <div key={post.id} className="p-3 border border-border-custom bg-stone-50/50 dark:bg-black/20 rounded-xl text-xs flex justify-between items-center gap-4">
                              <div className="space-y-1 min-w-0 flex-1">
                                <p className="font-semibold text-foreground truncate">{post.title}</p>
                                <p className="text-[10px] text-muted-text font-mono uppercase">{post.date} • {post.readTime}</p>
                              </div>
                              <button
                                onClick={() => handleDeleteBlogPost(post.id)}
                                className="px-2.5 py-1 text-[9px] font-mono border border-red-500/20 text-red-500 rounded hover:bg-red-500/10 cursor-pointer flex-shrink-0"
                              >
                                Delete
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Events list */}
                    <div className="space-y-4 pt-6 border-t border-border-custom/50">
                      <h3 className="font-serif text-base text-foreground font-bold border-b border-border-custom/50 pb-2">Active Scheduled Events ({cmsEvents.length})</h3>
                      {cmsEvents.length === 0 ? (
                        <p className="text-xs text-muted-text font-mono">No events scheduled.</p>
                      ) : (
                        <div className="space-y-2 max-h-60 overflow-y-auto no-scrollbar pr-2">
                          {cmsEvents.map((ev: any) => (
                            <div
                              key={ev.id}
                              className={`p-3 border rounded-xl text-xs flex justify-between items-center gap-4 ${
                                editingEventId === ev.id
                                  ? "border-[#dfb15b] bg-[#dfb15b]/5"
                                  : "border-border-custom bg-stone-50/50 dark:bg-black/20"
                              }`}
                            >
                              <div className="space-y-1 min-w-0 flex-1">
                                <p className="font-semibold text-foreground truncate">{ev.title}</p>
                                <p className="text-[10px] text-[#dfb15b] font-mono uppercase">{ev.date} • {ev.time || "TBD"} • {ev.type}</p>
                              </div>
                              <div className="flex items-center gap-2 flex-shrink-0">
                                <button
                                  onClick={() => handleEditEventClick(ev)}
                                  className="px-2.5 py-1 text-[9px] font-mono border border-border-custom text-foreground rounded hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDeleteEvent(ev.id)}
                                  className="px-2.5 py-1 text-[9px] font-mono border border-red-500/20 text-red-500 rounded hover:bg-red-500/10 cursor-pointer"
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "site" && <SiteEditor />}

          </div>
        </div>

      </main>

      <AIChatbot />
      <Footer />
    </div>
  );
}
