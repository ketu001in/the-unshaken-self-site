"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AIChatbot from "@/components/AIChatbot";
import { Calendar, Clock, Users, Check, ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type EventItem = {
  id: string;
  title: string;
  desc: string;
  date: string;
  time: string;
  location: string;
  type: "virtual" | "in-person";
  capacity: string;
};

export default function EventsPage() {
  const [selectedEvent, setSelectedEvent] = useState<string>("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [registered, setRegistered] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("events")
      .select("id, title, description, event_date, event_time, location, event_type, capacity")
      .order("created_at", { ascending: true })
      .then(({ data, error }) => {
        if (!error && data) {
          const mapped: EventItem[] = data.map((ev) => ({
            id: ev.id,
            title: ev.title,
            desc: ev.description,
            date: ev.event_date,
            time: ev.event_time || "TBD",
            location: ev.location,
            type: ev.event_type as "virtual" | "in-person",
            capacity: ev.capacity || "",
          }));
          setEvents(mapped);
          if (mapped.length > 0) setSelectedEvent(mapped[0].id);
        }
        setLoading(false);
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !selectedEvent) return;
    setSubmitError("");

    const supabase = createClient();
    const eventTitle = events.find((ev) => ev.id === selectedEvent)?.title || selectedEvent;
    const { error } = await supabase.from("rsvps").insert({
      event_id: selectedEvent,
      event_title: eventTitle,
      name,
      email,
    });

    if (error) {
      setSubmitError("Something went wrong — please try again.");
      return;
    }

    setName("");
    setEmail("");
    setRegistered(true);
    setTimeout(() => setRegistered(false), 5000);
  };

  const handleAddToCalendar = () => {
    const event = events.find((ev) => ev.id === selectedEvent);
    if (!event) return;

    // Best-effort parse of the event's free-text date/time (e.g. "September 4, 2026"
    // + "6:00 PM - 7:30 PM IST") into real DTSTART/DTEND values. Falls back to an
    // all-day marker on the date alone if the time range can't be parsed, since
    // most calendar apps require at least DTSTART to accept an .ics import.
    const toICSDate = (d: Date) => d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    const startTimeStr = event.time.split("-")[0]?.trim().replace(/IST|PST|EST|GMT|UTC/gi, "").trim();
    const parsedStart = startTimeStr ? new Date(`${event.date} ${startTimeStr}`) : new Date(event.date);
    const validStart = !isNaN(parsedStart.getTime()) ? parsedStart : null;
    const endTimeStr = event.time.split("-")[1]?.trim().replace(/IST|PST|EST|GMT|UTC/gi, "").trim();
    const parsedEnd = endTimeStr ? new Date(`${event.date} ${endTimeStr}`) : null;
    const validEnd = parsedEnd && !isNaN(parsedEnd.getTime()) ? parsedEnd : null;

    const lines = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//The Unshaken Self//Events//EN",
      "BEGIN:VEVENT",
      `UID:${event.id}-unshaken-self`,
      `SUMMARY:${event.title}`,
      `DESCRIPTION:${event.desc.replace(/\n/g, "\\n")} (${event.date}, ${event.time})`,
      `LOCATION:${event.location}`,
    ];
    if (validStart) lines.push(`DTSTART:${toICSDate(validStart)}`);
    if (validEnd) lines.push(`DTEND:${toICSDate(validEnd)}`);
    lines.push(`DTSTAMP:${toICSDate(new Date())}`, "END:VEVENT", "END:VCALENDAR");
    const icsContent = lines.join("\r\n");

    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${event.title.replace(/[^a-z0-9]/gi, "_")}.ics`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex-1 flex flex-col pt-16 bg-[#faf8f5] dark:bg-[#070b09]">
      <Navbar />

      {/* Page Header */}
      <header className="py-20 px-4 text-center border-b border-border-custom bg-white dark:bg-[#050806] relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,rgba(223,177,91,0.03)_0%,transparent_70%)] pointer-events-none" />
        <div className="max-w-4xl mx-auto space-y-4 relative z-10">
          <span className="text-[10px] tracking-[0.3em] text-[#b5924b] dark:text-[#dfb15b] uppercase font-bold">
            Community & Tour
          </span>
          <h1 className="text-4xl sm:text-5xl font-serif text-foreground leading-tight">
            Events & Workshops
          </h1>
          <p className="text-xs sm:text-sm font-light text-stone-500 dark:text-stone-400 max-w-xl mx-auto leading-relaxed">
            Register for virtual launches, Q&A workshops, and local bookstore signings with KETUL SHAH.
          </p>
        </div>
      </header>

      {/* Events Hub */}
      <section className="py-16 px-4 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 flex-1">
        
        {/* Left Column: Event Schedules */}
        <div className="lg:col-span-8 space-y-8">
          <div className="space-y-4">
            <h2 className="font-serif text-2xl text-foreground">Upcoming Schedule</h2>
            <div className="w-12 h-[2px] bg-[#dfb15b]" />
          </div>

          <div className="space-y-6">
            {loading ? (
              <div className="text-center py-16 text-xs text-muted-text font-mono">Loading events…</div>
            ) : events.length === 0 ? (
              <div className="text-center py-16 border border-dashed border-border-custom rounded-3xl text-muted-text text-xs">
                No events scheduled yet. Check back soon.
              </div>
            ) : events.map((event) => (
              <div
                key={event.id}
                className="bg-white dark:bg-[#101614] border border-border-custom p-6 sm:p-8 rounded-3xl space-y-6 hover:shadow-md transition-shadow relative overflow-hidden group"
              >
                {/* Event Type Ribbon Accent */}
                <div className={`absolute top-0 right-0 px-4 py-1 text-[9px] uppercase tracking-widest font-mono font-bold rounded-bl-xl ${
                  event.type === "virtual"
                    ? "bg-green-500/10 text-green-600 dark:text-green-400 border-l border-b border-green-500/20"
                    : "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-l border-b border-blue-500/20"
                }`}>
                  {event.type}
                </div>

                <div className="space-y-3 pr-12">
                  <h3 className="font-serif text-lg text-foreground font-semibold leading-snug">
                    {event.title}
                  </h3>
                  <p className="text-xs sm:text-[13px] font-light text-stone-500 dark:text-stone-400 leading-relaxed">
                    {event.desc}
                  </p>
                </div>

                {/* Metadata Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-border-custom/50 text-[11px] text-muted-text font-mono">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-[#dfb15b]" />
                    <span>{event.date}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-[#dfb15b]" />
                    <span>{event.time}</span>
                  </div>
                </div>

                <div className="pt-4 flex justify-between items-center">
                  <div className="flex items-center space-x-2 text-[10px] text-stone-400 font-mono">
                    <Users className="w-4 h-4" />
                    <span>{event.capacity}</span>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedEvent(event.id);
                      document.getElementById("rsvp-form")?.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="text-xs font-semibold text-primary dark:text-[#dfb15b] hover:underline flex items-center space-x-1 cursor-pointer"
                  >
                    <span>RSVP for this Event</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: RSVP Registration Panel */}
        <div className="lg:col-span-4" id="rsvp-form">
          <div className="bg-white dark:bg-[#101614] border border-border-custom rounded-3xl p-6 space-y-6 shadow-sm sticky top-24">
            
            <div className="space-y-2">
              <h3 className="font-serif text-base text-foreground font-semibold flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#dfb15b]" />
                <span>Reserve Your Spot</span>
              </h3>
              <p className="text-[11px] font-light text-stone-500 leading-relaxed">
                Choose an event below and submit your email. We will send you calendar credentials and connection details.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Select Event */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono uppercase tracking-wider text-stone-400 block font-semibold">Select Event</label>
                <select
                  value={selectedEvent}
                  onChange={(e) => setSelectedEvent(e.target.value)}
                  className="w-full text-xs bg-stone-50 dark:bg-[#070b09] border border-border-custom rounded-lg p-2.5 focus:outline-none text-foreground font-medium"
                >
                  {events.map((ev) => (
                    <option key={ev.id} value={ev.id}>
                      {ev.title.split(":")[0]}
                    </option>
                  ))}
                </select>
              </div>

              {/* Name */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono uppercase tracking-wider text-stone-400 block font-semibold">Your Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Kedar Shah"
                  className="w-full text-xs bg-stone-50 dark:bg-[#070b09] border border-border-custom rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-[#dfb15b]/40 text-foreground"
                  required
                />
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono uppercase tracking-wider text-stone-400 block font-semibold">Email Address *</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g., example@domain.com"
                  className="w-full text-xs bg-stone-50 dark:bg-[#070b09] border border-border-custom rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-[#dfb15b]/40 text-foreground"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-full bg-[#1e3f20] hover:bg-[#142a15] dark:bg-[#dfb15b] dark:hover:bg-[#c49945] text-white dark:text-black text-xs uppercase tracking-widest font-bold shadow-md transition-all cursor-pointer"
              >
                Confirm Attendance
              </button>

              <button
                type="button"
                onClick={handleAddToCalendar}
                disabled={!selectedEvent}
                className="w-full py-2.5 rounded-full border border-border-custom hover:bg-black/5 dark:hover:bg-white/5 text-foreground text-xs uppercase tracking-widest font-semibold transition-colors cursor-pointer disabled:opacity-40"
              >
                Download Calendar Invite (.ics)
              </button>

              {registered && (
                <div className="p-3 border border-green-500/20 bg-green-500/5 rounded-lg flex items-center gap-2 text-[10px] text-green-600 dark:text-green-400 font-mono">
                  <Check className="w-4 h-4 flex-shrink-0" />
                  <span>RSVP saved! View registrations in /admin.</span>
                </div>
              )}
              {submitError && (
                <div className="p-3 border border-red-500/20 bg-red-500/5 rounded-lg text-[10px] text-red-500 font-mono">
                  {submitError}
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
