"use client";

import React, { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { fetchPageContent, savePageContent, saveSiteSetting } from "@/lib/content";
import { DEFAULT_SITE_SETTINGS, SiteSettings, ThemeColors, SectionVisibility, useSiteSettings } from "@/context/SiteSettingsContext";
import { Upload, Plus, Trash2, Save, Check } from "lucide-react";

/* ------------------------------------------------------------------ */
/* Content type shapes — mirrored from each page's own default        */
/* content constant so the editor forms match what the site renders.  */
/* ------------------------------------------------------------------ */

type Testimonial = { quote: string; author: string; role: string; rating: number };
type Chapter = { num: number; title: string; theme: string; desc: string; icon: string };
type Faq = { q: string; a: string };

// Must match CHAPTER_ICON_MAP in src/app/page.tsx.
const CHAPTER_ICON_OPTIONS = [
  "Shield", "Compass", "Brain", "Feather", "Sparkles", "BookOpen",
  "Award", "Heart", "Star", "Sun", "Moon", "Flame", "Anchor", "Target"
];

type HomepageContent = {
  hero_badge: string;
  hero_headline_line1: string;
  hero_headline_accent: string;
  hero_headline_line2: string;
  hero_subtext: string;
  why_kicker: string;
  why_heading: string;
  why_paragraphs: string[];
  why_quote: string;
  author_badge_title: string;
  author_badge_tags: string;
  author_brief: string;
  testimonials: Testimonial[];
  chapters: Chapter[];
  faqs: Faq[];
};

const DEFAULT_HOMEPAGE_CONTENT: HomepageContent = {
  hero_badge: "Upcoming Book Launch",
  hero_headline_line1: "The",
  hero_headline_accent: "Unshaken",
  hero_headline_line2: "Self",
  hero_subtext: "Key Lessons from the Gita for a Life Without Doubt, Worry, and Fear. A modern blueprint to conquer anxiety and unlock absolute focus.",
  why_kicker: "The Modern Dilemma",
  why_heading: "Finding Stillness in a Hyper-Active World",
  why_paragraphs: [
    "We live in an age of constant speed. We are bombarded with notifications, overwhelmed by choices, and plagued by the fear of falling behind. Yet, the anxiety we feel today is not new.",
    "Five thousand years ago, on the battlefield of Kurukshetra, the warrior Arjuna suffered a severe panic attack. He was paralyzed by doubt, fear, and grief. In response, Krishna spoke the 700 verses of the Bhagavad Gita—not to teach escape, but to show how to stand firm in the center of life's battle.",
    "The Unshaken Self takes KETUL SHAH's years of scriptural study and converts the Gita's 18 chapters into a mental toolkit. It details how to perform action without burnouts, handle stress with grace, and live a life grounded in presence."
  ],
  why_quote: "An unshaken self is not one that avoids the storm, but one that remains still at the center of it.",
  author_badge_title: "Author - The Unshaken Self",
  author_badge_tags: "Spiritual Curious / Avid Reader / Writer",
  author_brief: "Ketul Shah is a dedicated Vedic philosophy explorer and professional counselor. Driven by a mission to bridge traditional Eastern spirituality with contemporary cognitive therapy, Ketul spent the last seven years studying the Bhagavad Gita's psychological implications. His upcoming book, *The Unshaken Self*, translates Vedic insights into practical mental exercises tailored for people working under extreme pressure.",
  testimonials: [
    { quote: "Ketul Shah has achieved something remarkable—taking a 5,000-year-old dialogue and showing exactly how it can save you from burnout at work. Essential reading for the modern professional.", author: "Dr. Ananya Rao", role: "Mindfulness Researcher & Psychologist", rating: 5 },
    { quote: "The Unshaken Self is an anchor. In a world full of noise, this book offers the precise psychological framework needed to stay calm, focused, and steady.", author: "Vikram Malhotra", role: "Founder, Peak Performance Labs", rating: 5 },
    { quote: "Brilliant, practical, and deeply moving. The chapter on Karma Yoga alone completely altered how I approach product launches and failure.", author: "Siddharth Mehta", role: "Tech Entrepreneur & Book Club Host", rating: 5 }
  ],
  chapters: [
    { num: 1, title: "Mastering Inner Doubt", theme: "Arjuna Vishada Yoga", desc: "How to face anxiety and imposter syndrome when standing before major life transitions.", icon: "Shield" },
    { num: 2, title: "The Unshaken Center", theme: "Sankhya Yoga", desc: "Cultivating intellectual stability and recognizing the permanent self within.", icon: "Compass" },
    { num: 3, title: "Action without Anxiety", theme: "Karma Yoga", desc: "The art of performing work with 100% effort while detaching from expectations and results.", icon: "Brain" },
    { num: 6, title: "Calming the Mental Storm", theme: "Dhyana Yoga", desc: "Practical breathwork and mindfulness guidelines for training a hyper-active mind.", icon: "Feather" },
    { num: 12, title: "Accepting Life's Rhythm", theme: "Bhakti Yoga", desc: "Developing emotional resilience and surrender in the face of uncontrollable events.", icon: "Sparkles" },
    { num: 16, title: "Cultivating Divine Habit", theme: "Daivasura Sampad Yoga", desc: "Establishing integrity, self-discipline, and wisdom in everyday actions.", icon: "BookOpen" }
  ],
  faqs: [
    { q: "What makes this book different from traditional translations of the Bhagavad Gita?", a: "Rather than focusing purely on literal translation or theological debates, *The Unshaken Self* acts as a practical handbook. It takes the philosophical essence of all 18 chapters and translates them into actionable exercises—like morning journaling, breath practices, and detached goal planning—built specifically for 2026's busy, high-stress lifestyle." },
    { q: "When is the launch date and what are the launch phases?", a: "The planned launch is on the eve of Krishna Janmashtami (September 4–5, 2026). Currently, we are in the Pre-Launch phase. Pre-ordering grants you immediate access to Chapter 1, workbook PDFs, and an invite to a private Q&A session with KETUL SHAH. The Launch phase will release the full book/audiobook, followed by Post-Launch workshops." },
    { q: "Where will the book be available to purchase?", a: "The book will be available globally in hardcover, paperback, kindle, and audiobook formats. Direct links will include Amazon, Flipkart, and leading local bookstore platforms. You can check our preorder page for live price comparisons." },
    { q: "How does the AI Gita Companion work?", a: "The floating widget at the bottom right represents the AI Gita Companion. It acts as an interactive assistant trained on the chapters of the book. You can query it on topics like 'handling work stress' or 'finding focus', and it will retrieve practical counsel matching the Gita's teachings." }
  ]
};

type PreorderStore = {
  name: string;
  format: string;
  region: string;
  status: string;
  isPopular: boolean;
  features: string[];
};

type PreorderContent = {
  header_subtitle: string;
  stores: PreorderStore[];
};

const DEFAULT_PREORDER_CONTENT: PreorderContent = {
  header_subtitle: "The book isn't listed for sale yet, and final pricing hasn't been confirmed. Join the notify list below for your preferred store and we'll email you the moment pre-orders open — plus a bundle of digital resources and live workshop credentials.",
  stores: [
    { name: "Amazon Kindle & Hardback", format: "Kindle / Hardcover", region: "Global Store", status: "Coming Soon", isPopular: false, features: ["Chapter 1 digital preview instantly.", "Vedic Reflection Sheets download."] },
    { name: "Flipkart Paperback", format: "Paperback Edition", region: "India Only", status: "Coming Soon", isPopular: false, features: ["Chapter 1 digital preview instantly.", "Vedic Reflection Sheets download."] },
    { name: "Publisher Direct Deluxe Bundle", format: "Hardcover + Audio + PDFs", region: "International Shipping", status: "Coming Soon", isPopular: true, features: ["Chapter 1 digital preview instantly.", "Vedic Reflection Sheets download.", "Simulated Audiobook CD/MP3 access.", "Invite to live launch session."] }
  ]
};

type Spec = { label: string; value: string };

type AboutBookContent = {
  intro_heading: string;
  paragraphs: string[];
  should_read: string[];
  should_not_read: string[];
  specifications: Spec[];
};

const DEFAULT_ABOUT_BOOK_CONTENT: AboutBookContent = {
  intro_heading: "A Modern Guide to an Ancient Battlefield",
  paragraphs: [
    "The Unshaken Self translates the Bhagavad Gita's 700 verses into a practical mental toolkit for the modern professional facing stress, doubt, and burnout.",
    "Subscribe or join the pre-order waitlist to be the first to receive early chapters and launch updates."
  ],
  should_read: [
    "Professionals facing extreme stress and burnout who need a mental anchor.",
    "Students struggling with uncertainty, career anxiety, and self-doubt.",
    "Seekers looking for a non-dogmatic, practical guide to Eastern philosophy.",
    "Leaders wanting to make decisions with absolute clarity and equanimity.",
    "Anyone who has tried meditation but struggles to stay calm in real-world situations."
  ],
  should_not_read: [
    "Those looking for a theological or dogmatic religious treatise.",
    "People seeking 'get rich quick' hacks or simple self-help platitudes.",
    "Anyone unwilling to reflect honestly and implement daily mindfulness practices.",
    "Those who prefer escaping reality over facing actions directly in daily life."
  ],
  specifications: [
    { label: "Book Title", value: "The Unshaken Self: Key Lessons from the Gita for a Life Without Doubt, Worry, and Fear" },
    { label: "Author Name", value: "KETUL SHAH" },
    { label: "Format", value: "Hardcover, Paperback, Kindle, Audiobook" },
    { label: "Page Count", value: "320 pages" },
    { label: "Publisher", value: "Vedic Wisdom Press (International)" },
    { label: "ISBN-13", value: "978-93-6068-721-2" },
    { label: "Dimensions", value: "6.0 x 9.0 inches" },
    { label: "Release Date", value: "September 4, 2026 (Krishna Janmashtami)" }
  ]
};

type TimelineEvent = { year: string; title: string; desc: string };
type SpeakingTopic = { title: string; desc: string };

type AboutAuthorContent = {
  bio_paragraphs: string[];
  mission: string;
  vision: string;
  timeline: TimelineEvent[];
  speaking_topics: SpeakingTopic[];
};

const DEFAULT_ABOUT_AUTHOR_CONTENT: AboutAuthorContent = {
  bio_paragraphs: [
    "KETUL SHAH bridges the high-stakes reality of the modern corporate world with the profound, quiet depths of ancient spiritual wisdom.",
    "Beyond the boardroom, Ketul is a dedicated student of life and a passionate explorer of Sanatan history.",
    "This pursuit of harmony extends far beyond his spiritual studies into a rich, vibrant creative life.",
    "This same creative devotion is mirrored in his culinary arts.",
    "At the very core of Ketul's existence is a philosophy of total surrender and trust."
  ],
  mission: "To democratize ancient Vedic psychology, making it practical and actionable for high-pressure modern careers.",
  vision: "A society where professional excellence and deep internal peace co-exist, built upon stable self-knowledge.",
  timeline: [
    { year: "2017", title: "Vedic Foundations", desc: "Began deep scholarly study of the Prasthanatrayi under traditional Sanskrit tutors in India." },
    { year: "2019", title: "Synthesis of Therapy & Wisdom", desc: "Founded a private counseling practice integrating CBT with Eastern mindfulness." },
    { year: "2021", title: "The Book Concept", desc: "Started structuring drafts for The Unshaken Self." },
    { year: "2024", title: "Researching about the book", desc: "Dedicated the year to deep scriptural research." },
    { year: "2026", title: "Launch of The Unshaken Self", desc: "Finalized publishers and designed global launch operations." }
  ],
  speaking_topics: [
    { title: "Karma Yoga in the Corporate Arena", desc: "How professionals can execute at the highest levels without chronic performance anxiety." },
    { title: "The Sthitaprajna Framework", desc: "Building a mind that is neither overly elated by success nor crushed by failures." },
    { title: "Ancient Mindfulness vs. Modern App-based Meditation", desc: "Moving beyond passive breathing exercises to active, cognitive meditation systems." }
  ]
};

/* ------------------------------------------------------------------ */
/* Small shared UI helpers                                            */
/* ------------------------------------------------------------------ */

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="text-[10px] font-mono uppercase text-stone-400 font-bold block">{label}</label>
      {children}
    </div>
  );
}

const inputClass =
  "w-full text-xs bg-stone-50 dark:bg-[#070b09] border border-border-custom p-2.5 rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-[#dfb15b]/40";

function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={inputClass} />;
}

function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`${inputClass} resize-none font-sans`} />;
}

function StringListEditor({
  label,
  items,
  onChange,
}: {
  label: string;
  items: string[];
  onChange: (items: string[]) => void;
}) {
  return (
    <Field label={`${label} (one per line)`}>
      <TextArea
        rows={Math.max(3, items.length + 1)}
        value={items.join("\n")}
        onChange={(e) => onChange(e.target.value.split("\n"))}
      />
    </Field>
  );
}

function SaveButton({ onClick, saved }: { onClick: () => void; saved: boolean }) {
  return (
    <button
      onClick={onClick}
      className="px-5 py-2.5 rounded-full bg-[#0f2b48] dark:bg-[#dfb15b] text-white dark:text-black text-xs uppercase tracking-widest font-bold shadow-md cursor-pointer hover:opacity-90 transition-opacity flex items-center gap-2"
    >
      {saved ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
      {saved ? "Saved" : "Save Changes"}
    </button>
  );
}

async function uploadMediaFile(file: File, pathPrefix: string): Promise<string | null> {
  const supabase = createClient();
  const ext = file.name.split(".").pop();
  const path = `${pathPrefix}-${Date.now()}.${ext}`;
  const { error } = await supabase.storage.from("media").upload(path, file, { upsert: true });
  if (error) return null;
  const { data } = supabase.storage.from("media").getPublicUrl(path);
  return data.publicUrl;
}

/* ------------------------------------------------------------------ */
/* Main Site Editor                                                   */
/* ------------------------------------------------------------------ */

type SubTab = "general" | "media" | "theme" | "homepage" | "about-book" | "about-author" | "preorder";

type UploadKey =
  | "author_photo_url"
  | "book_cover_front_url"
  | "trailer_video_url"
  | "media_kit_portrait_url"
  | "media_kit_cover_kit_url"
  | "media_kit_press_release_url"
  | "media_kit_bio_url"
  | "sample_pdf_url";

function UploadField({
  label,
  currentUrl,
  accept,
  uploading,
  onFile,
  hint,
}: {
  label: string;
  currentUrl: string | null;
  accept: string;
  uploading: boolean;
  onFile: (file: File) => void;
  hint?: string;
}) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <Field label={label}>
      <div className="space-y-2">
        {currentUrl && (
          <a
            href={currentUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block text-[10px] text-[#dfb15b] underline truncate max-w-xs"
          >
            {currentUrl.split("/").pop()}
          </a>
        )}
        {hint && <p className="text-[9px] text-muted-text">{hint}</p>}
        <input
          ref={ref}
          type="file"
          accept={accept}
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onFile(file);
            e.target.value = "";
          }}
        />
        <button
          onClick={() => ref.current?.click()}
          className="px-3 py-2 rounded-lg border border-border-custom text-xs flex items-center gap-2 cursor-pointer hover:bg-black/5 dark:hover:bg-white/5"
        >
          <Upload className="w-3.5 h-3.5" />
          {uploading ? "Uploading…" : currentUrl ? "Replace File" : "Upload File"}
        </button>
      </div>
    </Field>
  );
}

export default function SiteEditor() {
  const [subTab, setSubTab] = useState<SubTab>("general");

  // Share the same site_settings source of truth the live site reads from,
  // so saves here can push a refresh that every page picks up immediately —
  // no hard reload required to see a new photo, color, or toggle.
  const { settings: liveSettings, refresh: refreshSiteSettings } = useSiteSettings();
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);
  const [homepage, setHomepage] = useState<HomepageContent>(DEFAULT_HOMEPAGE_CONTENT);
  const [aboutBook, setAboutBook] = useState<AboutBookContent>(DEFAULT_ABOUT_BOOK_CONTENT);
  const [aboutAuthor, setAboutAuthor] = useState<AboutAuthorContent>(DEFAULT_ABOUT_AUTHOR_CONTENT);
  const [preorder, setPreorder] = useState<PreorderContent>(DEFAULT_PREORDER_CONTENT);

  const [savedFlag, setSavedFlag] = useState<SubTab | null>(null);
  const [uploading, setUploading] = useState<UploadKey | null>(null);

  // Keep the editable copy in sync with the shared context (on initial load,
  // and again after we trigger a refresh post-save).
  useEffect(() => {
    setSettings(liveSettings);
  }, [liveSettings]);

  useEffect(() => {
    fetchPageContent("homepage", DEFAULT_HOMEPAGE_CONTENT).then(setHomepage);
    fetchPageContent("about-book", DEFAULT_ABOUT_BOOK_CONTENT).then(setAboutBook);
    fetchPageContent("about-author", DEFAULT_ABOUT_AUTHOR_CONTENT).then(setAboutAuthor);
    fetchPageContent("preorder", DEFAULT_PREORDER_CONTENT).then(setPreorder);
  }, []);

  const flashSaved = (tab: SubTab) => {
    setSavedFlag(tab);
    setTimeout(() => setSavedFlag(null), 2000);
  };

  const saveGeneral = async () => {
    await Promise.all([
      saveSiteSetting("contact_email", settings.contact_email),
      saveSiteSetting("social_linkedin", settings.social_linkedin),
      saveSiteSetting("social_instagram", settings.social_instagram),
      saveSiteSetting("footer_tagline", settings.footer_tagline),
    ]);
    await refreshSiteSettings();
    flashSaved("general");
  };

  const saveTheme = async () => {
    await Promise.all([
      saveSiteSetting("theme_colors", settings.theme_colors),
      saveSiteSetting("section_visibility", settings.section_visibility),
    ]);
    await refreshSiteSettings();
    flashSaved("theme");
  };

  const saveHomepage = async () => {
    await savePageContent("homepage", homepage);
    flashSaved("homepage");
  };

  const saveAboutBook = async () => {
    await savePageContent("about-book", aboutBook);
    flashSaved("about-book");
  };

  const saveAboutAuthor = async () => {
    await savePageContent("about-author", aboutAuthor);
    flashSaved("about-author");
  };

  const savePreorder = async () => {
    await savePageContent("preorder", preorder);
    flashSaved("preorder");
  };

  const handleFileUpload = async (key: UploadKey, pathPrefix: string, file: File) => {
    setUploading(key);
    const url = await uploadMediaFile(file, pathPrefix);
    setUploading(null);
    if (!url) {
      alert("Upload failed — please try again. (Videos are capped at 200MB on the free Supabase tier.)");
      return;
    }
    await saveSiteSetting(key, url);
    await refreshSiteSettings();
    flashSaved("media");
  };

  const updateColor = (key: keyof ThemeColors, value: string) => {
    setSettings((prev) => ({ ...prev, theme_colors: { ...prev.theme_colors, [key]: value } }));
  };

  const updateVisibility = (key: keyof SectionVisibility, value: boolean) => {
    setSettings((prev) => ({ ...prev, section_visibility: { ...prev.section_visibility, [key]: value } }));
  };

  const subTabs: { id: SubTab; label: string }[] = [
    { id: "general", label: "General & Contact" },
    { id: "media", label: "Media & Downloads" },
    { id: "theme", label: "Theme & Visibility" },
    { id: "homepage", label: "Homepage" },
    { id: "about-book", label: "About the Book" },
    { id: "about-author", label: "About the Author" },
    { id: "preorder", label: "Pre-order Page" },
  ];

  return (
    <div className="p-6 md:p-8 space-y-8">
      <p className="text-[11px] text-muted-text font-light max-w-2xl">
        Edit live site content, images, colors, and section visibility. Changes save directly to the
        database and appear on the site immediately (a page refresh may be needed for visitors with
        a cached view).
      </p>

      {/* Sub-tab switcher */}
      <div className="flex flex-wrap gap-2 border-b border-border-custom pb-4">
        {subTabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setSubTab(t.id)}
            className={`px-4 py-2 rounded-full text-[10px] uppercase tracking-widest font-bold cursor-pointer transition-colors ${
              subTab === t.id
                ? "bg-[#0f2b48] dark:bg-[#dfb15b] text-white dark:text-black"
                : "border border-border-custom text-muted-text hover:text-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* GENERAL & CONTACT */}
      {subTab === "general" && (
        <div className="space-y-6 max-w-2xl">
          <h3 className="font-serif text-base text-foreground font-bold">Contact & Social Links</h3>
          <Field label="Contact Email">
            <TextInput
              value={settings.contact_email}
              onChange={(e) => setSettings((p) => ({ ...p, contact_email: e.target.value }))}
            />
          </Field>
          <Field label="LinkedIn URL">
            <TextInput
              value={settings.social_linkedin}
              onChange={(e) => setSettings((p) => ({ ...p, social_linkedin: e.target.value }))}
            />
          </Field>
          <Field label="Instagram URL">
            <TextInput
              value={settings.social_instagram}
              onChange={(e) => setSettings((p) => ({ ...p, social_instagram: e.target.value }))}
            />
          </Field>
          <Field label="Footer Tagline">
            <TextArea
              rows={3}
              value={settings.footer_tagline}
              onChange={(e) => setSettings((p) => ({ ...p, footer_tagline: e.target.value }))}
            />
          </Field>

          <SaveButton onClick={saveGeneral} saved={savedFlag === "general"} />
        </div>
      )}

      {/* MEDIA & DOWNLOADS */}
      {subTab === "media" && (
        <div className="space-y-8 max-w-2xl">
          <div className="space-y-4">
            <h3 className="font-serif text-base text-foreground font-bold">Site Images</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <UploadField
                label="Author Photo"
                currentUrl={settings.author_photo_url}
                accept="image/*"
                uploading={uploading === "author_photo_url"}
                onFile={(file) => handleFileUpload("author_photo_url", "author-photo", file)}
              />
              <UploadField
                label="Book Cover (Front)"
                currentUrl={settings.book_cover_front_url}
                accept="image/*"
                uploading={uploading === "book_cover_front_url"}
                onFile={(file) => handleFileUpload("book_cover_front_url", "book-cover-front", file)}
              />
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-border-custom/50">
            <h3 className="font-serif text-base text-foreground font-bold">Homepage Trailer Video</h3>
            <UploadField
              label="Cinematic Trailer"
              currentUrl={settings.trailer_video_url}
              accept="video/*"
              uploading={uploading === "trailer_video_url"}
              onFile={(file) => handleFileUpload("trailer_video_url", "trailer-video", file)}
              hint="MP4/WebM recommended. 200MB max on the free tier — compress the file first if it's larger."
            />
          </div>

          <div className="space-y-4 pt-4 border-t border-border-custom/50">
            <h3 className="font-serif text-base text-foreground font-bold">Chapter 1 Sample PDF</h3>
            <UploadField
              label="Downloadable Sample PDF"
              currentUrl={settings.sample_pdf_url}
              accept="application/pdf"
              uploading={uploading === "sample_pdf_url"}
              onFile={(file) => handleFileUpload("sample_pdf_url", "sample-chapter", file)}
              hint="Served from the Preview page's Download Sample PDF button."
            />
          </div>

          <div className="space-y-4 pt-4 border-t border-border-custom/50">
            <h3 className="font-serif text-base text-foreground font-bold">Press / Media Kit Files</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <UploadField
                label="High-Res Author Portrait (ZIP)"
                currentUrl={settings.media_kit_portrait_url}
                accept=".zip,image/*"
                uploading={uploading === "media_kit_portrait_url"}
                onFile={(file) => handleFileUpload("media_kit_portrait_url", "media-kit-portrait", file)}
              />
              <UploadField
                label="Book Cover Graphic Kit (ZIP)"
                currentUrl={settings.media_kit_cover_kit_url}
                accept=".zip,image/*"
                uploading={uploading === "media_kit_cover_kit_url"}
                onFile={(file) => handleFileUpload("media_kit_cover_kit_url", "media-kit-cover-kit", file)}
              />
              <UploadField
                label="Official Press Release (PDF)"
                currentUrl={settings.media_kit_press_release_url}
                accept="application/pdf"
                uploading={uploading === "media_kit_press_release_url"}
                onFile={(file) => handleFileUpload("media_kit_press_release_url", "media-kit-press-release", file)}
              />
              <UploadField
                label="Author Biographies (PDF)"
                currentUrl={settings.media_kit_bio_url}
                accept="application/pdf"
                uploading={uploading === "media_kit_bio_url"}
                onFile={(file) => handleFileUpload("media_kit_bio_url", "media-kit-bio", file)}
              />
            </div>
          </div>

          {savedFlag === "media" && (
            <p className="text-xs text-green-600 dark:text-green-400 flex items-center gap-2">
              <Check className="w-3.5 h-3.5" /> Saved — live on the site now.
            </p>
          )}
        </div>
      )}

      {/* THEME & VISIBILITY */}
      {subTab === "theme" && (
        <div className="space-y-8 max-w-2xl">
          <div className="space-y-4">
            <h3 className="font-serif text-base text-foreground font-bold">Theme Colors</h3>
            <div className="grid grid-cols-2 gap-6">
              <Field label="Primary (Light Mode)">
                <div className="flex items-center gap-2">
                  <input type="color" value={settings.theme_colors.primary} onChange={(e) => updateColor("primary", e.target.value)} className="w-10 h-10 rounded cursor-pointer border border-border-custom" />
                  <TextInput value={settings.theme_colors.primary} onChange={(e) => updateColor("primary", e.target.value)} />
                </div>
              </Field>
              <Field label="Accent (Light Mode)">
                <div className="flex items-center gap-2">
                  <input type="color" value={settings.theme_colors.accent} onChange={(e) => updateColor("accent", e.target.value)} className="w-10 h-10 rounded cursor-pointer border border-border-custom" />
                  <TextInput value={settings.theme_colors.accent} onChange={(e) => updateColor("accent", e.target.value)} />
                </div>
              </Field>
              <Field label="Primary (Dark Mode)">
                <div className="flex items-center gap-2">
                  <input type="color" value={settings.theme_colors.primary_dark} onChange={(e) => updateColor("primary_dark", e.target.value)} className="w-10 h-10 rounded cursor-pointer border border-border-custom" />
                  <TextInput value={settings.theme_colors.primary_dark} onChange={(e) => updateColor("primary_dark", e.target.value)} />
                </div>
              </Field>
              <Field label="Accent (Dark Mode)">
                <div className="flex items-center gap-2">
                  <input type="color" value={settings.theme_colors.accent_dark} onChange={(e) => updateColor("accent_dark", e.target.value)} className="w-10 h-10 rounded cursor-pointer border border-border-custom" />
                  <TextInput value={settings.theme_colors.accent_dark} onChange={(e) => updateColor("accent_dark", e.target.value)} />
                </div>
              </Field>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-border-custom/50">
            <h3 className="font-serif text-base text-foreground font-bold">Section Visibility</h3>
            <label className="flex items-center gap-3 text-xs cursor-pointer">
              <input type="checkbox" checked={settings.section_visibility.show_countdown} onChange={(e) => updateVisibility("show_countdown", e.target.checked)} className="w-4 h-4 cursor-pointer" />
              Show launch countdown on Homepage
            </label>
            <label className="flex items-center gap-3 text-xs cursor-pointer">
              <input type="checkbox" checked={settings.section_visibility.show_testimonials} onChange={(e) => updateVisibility("show_testimonials", e.target.checked)} className="w-4 h-4 cursor-pointer" />
              Show testimonials section on Homepage
            </label>
          </div>

          <SaveButton onClick={saveTheme} saved={savedFlag === "theme"} />
        </div>
      )}

      {/* HOMEPAGE */}
      {subTab === "homepage" && (
        <div className="space-y-6 max-w-2xl">
          <h3 className="font-serif text-base text-foreground font-bold">Hero Section</h3>
          <Field label="Badge Text"><TextInput value={homepage.hero_badge} onChange={(e) => setHomepage((p) => ({ ...p, hero_badge: e.target.value }))} /></Field>
          <div className="grid grid-cols-3 gap-4">
            <Field label="Headline Line 1"><TextInput value={homepage.hero_headline_line1} onChange={(e) => setHomepage((p) => ({ ...p, hero_headline_line1: e.target.value }))} /></Field>
            <Field label="Headline Accent"><TextInput value={homepage.hero_headline_accent} onChange={(e) => setHomepage((p) => ({ ...p, hero_headline_accent: e.target.value }))} /></Field>
            <Field label="Headline Line 2"><TextInput value={homepage.hero_headline_line2} onChange={(e) => setHomepage((p) => ({ ...p, hero_headline_line2: e.target.value }))} /></Field>
          </div>
          <Field label="Hero Subtext"><TextArea rows={2} value={homepage.hero_subtext} onChange={(e) => setHomepage((p) => ({ ...p, hero_subtext: e.target.value }))} /></Field>

          <h3 className="font-serif text-base text-foreground font-bold pt-4 border-t border-border-custom/50">"Why This Book" Section</h3>
          <Field label="Kicker"><TextInput value={homepage.why_kicker} onChange={(e) => setHomepage((p) => ({ ...p, why_kicker: e.target.value }))} /></Field>
          <Field label="Heading"><TextInput value={homepage.why_heading} onChange={(e) => setHomepage((p) => ({ ...p, why_heading: e.target.value }))} /></Field>
          <StringListEditor label="Paragraphs" items={homepage.why_paragraphs} onChange={(items) => setHomepage((p) => ({ ...p, why_paragraphs: items }))} />
          <Field label="Pull Quote"><TextArea rows={2} value={homepage.why_quote} onChange={(e) => setHomepage((p) => ({ ...p, why_quote: e.target.value }))} /></Field>

          <h3 className="font-serif text-base text-foreground font-bold pt-4 border-t border-border-custom/50">"Meet the Author" Section</h3>
          <Field label="Portrait Badge — Title Line"><TextInput value={homepage.author_badge_title} onChange={(e) => setHomepage((p) => ({ ...p, author_badge_title: e.target.value }))} /></Field>
          <Field label="Portrait Badge — Tags Line"><TextInput value={homepage.author_badge_tags} onChange={(e) => setHomepage((p) => ({ ...p, author_badge_tags: e.target.value }))} /></Field>
          <Field label="Author Brief Paragraph"><TextArea rows={4} value={homepage.author_brief} onChange={(e) => setHomepage((p) => ({ ...p, author_brief: e.target.value }))} /></Field>

          <h3 className="font-serif text-base text-foreground font-bold pt-4 border-t border-border-custom/50">Testimonials</h3>
          <div className="space-y-4">
            {homepage.testimonials.map((t, idx) => (
              <div key={idx} className="p-4 border border-border-custom rounded-xl space-y-2 relative">
                <button
                  onClick={() => setHomepage((p) => ({ ...p, testimonials: p.testimonials.filter((_, i) => i !== idx) }))}
                  className="absolute top-3 right-3 text-red-500 hover:text-red-600 cursor-pointer"
                  aria-label="Remove testimonial"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
                <Field label="Quote">
                  <TextArea
                    rows={2}
                    value={t.quote}
                    onChange={(e) => setHomepage((p) => {
                      const next = [...p.testimonials];
                      next[idx] = { ...next[idx], quote: e.target.value };
                      return { ...p, testimonials: next };
                    })}
                  />
                </Field>
                <div className="grid grid-cols-3 gap-3">
                  <Field label="Author">
                    <TextInput
                      value={t.author}
                      onChange={(e) => setHomepage((p) => {
                        const next = [...p.testimonials];
                        next[idx] = { ...next[idx], author: e.target.value };
                        return { ...p, testimonials: next };
                      })}
                    />
                  </Field>
                  <Field label="Role">
                    <TextInput
                      value={t.role}
                      onChange={(e) => setHomepage((p) => {
                        const next = [...p.testimonials];
                        next[idx] = { ...next[idx], role: e.target.value };
                        return { ...p, testimonials: next };
                      })}
                    />
                  </Field>
                  <Field label="Rating (1-5)">
                    <TextInput
                      type="number"
                      min={1}
                      max={5}
                      value={t.rating}
                      onChange={(e) => setHomepage((p) => {
                        const next = [...p.testimonials];
                        next[idx] = { ...next[idx], rating: Number(e.target.value) };
                        return { ...p, testimonials: next };
                      })}
                    />
                  </Field>
                </div>
              </div>
            ))}
            <button
              onClick={() => setHomepage((p) => ({ ...p, testimonials: [...p.testimonials, { quote: "", author: "", role: "", rating: 5 }] }))}
              className="px-3 py-2 rounded-lg border border-dashed border-border-custom text-xs flex items-center gap-2 cursor-pointer hover:bg-black/5 dark:hover:bg-white/5"
            >
              <Plus className="w-3.5 h-3.5" /> Add Testimonial
            </button>
          </div>

          <h3 className="font-serif text-base text-foreground font-bold pt-4 border-t border-border-custom/50">18-Chapters Preview Grid</h3>
          <div className="space-y-4">
            {homepage.chapters.map((ch, idx) => (
              <div key={idx} className="p-4 border border-border-custom rounded-xl space-y-2 relative">
                <button
                  onClick={() => setHomepage((p) => ({ ...p, chapters: p.chapters.filter((_, i) => i !== idx) }))}
                  className="absolute top-3 right-3 text-red-500 hover:text-red-600 cursor-pointer"
                  aria-label="Remove chapter"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
                <div className="grid grid-cols-3 gap-3">
                  <Field label="Chapter #">
                    <TextInput
                      type="number"
                      value={ch.num}
                      onChange={(e) => setHomepage((p) => {
                        const next = [...p.chapters];
                        next[idx] = { ...next[idx], num: Number(e.target.value) };
                        return { ...p, chapters: next };
                      })}
                    />
                  </Field>
                  <Field label="Title">
                    <TextInput
                      value={ch.title}
                      onChange={(e) => setHomepage((p) => {
                        const next = [...p.chapters];
                        next[idx] = { ...next[idx], title: e.target.value };
                        return { ...p, chapters: next };
                      })}
                    />
                  </Field>
                  <Field label="Sanskrit Theme">
                    <TextInput
                      value={ch.theme}
                      onChange={(e) => setHomepage((p) => {
                        const next = [...p.chapters];
                        next[idx] = { ...next[idx], theme: e.target.value };
                        return { ...p, chapters: next };
                      })}
                    />
                  </Field>
                </div>
                <Field label="Description">
                  <TextArea
                    rows={2}
                    value={ch.desc}
                    onChange={(e) => setHomepage((p) => {
                      const next = [...p.chapters];
                      next[idx] = { ...next[idx], desc: e.target.value };
                      return { ...p, chapters: next };
                    })}
                  />
                </Field>
                <Field label="Icon">
                  <select
                    value={ch.icon}
                    onChange={(e) => setHomepage((p) => {
                      const next = [...p.chapters];
                      next[idx] = { ...next[idx], icon: e.target.value };
                      return { ...p, chapters: next };
                    })}
                    className={inputClass}
                  >
                    {CHAPTER_ICON_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </Field>
              </div>
            ))}
            <button
              onClick={() => setHomepage((p) => ({ ...p, chapters: [...p.chapters, { num: p.chapters.length + 1, title: "", theme: "", desc: "", icon: "BookOpen" }] }))}
              className="px-3 py-2 rounded-lg border border-dashed border-border-custom text-xs flex items-center gap-2 cursor-pointer hover:bg-black/5 dark:hover:bg-white/5"
            >
              <Plus className="w-3.5 h-3.5" /> Add Chapter Card
            </button>
          </div>

          <h3 className="font-serif text-base text-foreground font-bold pt-4 border-t border-border-custom/50">Homepage FAQ</h3>
          <div className="space-y-4">
            {homepage.faqs.map((faq, idx) => (
              <div key={idx} className="p-4 border border-border-custom rounded-xl space-y-2 relative">
                <button
                  onClick={() => setHomepage((p) => ({ ...p, faqs: p.faqs.filter((_, i) => i !== idx) }))}
                  className="absolute top-3 right-3 text-red-500 hover:text-red-600 cursor-pointer"
                  aria-label="Remove FAQ"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
                <Field label="Question">
                  <TextInput
                    value={faq.q}
                    onChange={(e) => setHomepage((p) => {
                      const next = [...p.faqs];
                      next[idx] = { ...next[idx], q: e.target.value };
                      return { ...p, faqs: next };
                    })}
                  />
                </Field>
                <Field label="Answer">
                  <TextArea
                    rows={3}
                    value={faq.a}
                    onChange={(e) => setHomepage((p) => {
                      const next = [...p.faqs];
                      next[idx] = { ...next[idx], a: e.target.value };
                      return { ...p, faqs: next };
                    })}
                  />
                </Field>
              </div>
            ))}
            <button
              onClick={() => setHomepage((p) => ({ ...p, faqs: [...p.faqs, { q: "", a: "" }] }))}
              className="px-3 py-2 rounded-lg border border-dashed border-border-custom text-xs flex items-center gap-2 cursor-pointer hover:bg-black/5 dark:hover:bg-white/5"
            >
              <Plus className="w-3.5 h-3.5" /> Add FAQ
            </button>
          </div>

          <SaveButton onClick={saveHomepage} saved={savedFlag === "homepage"} />
        </div>
      )}

      {/* ABOUT BOOK */}
      {subTab === "about-book" && (
        <div className="space-y-6 max-w-2xl">
          <Field label="Intro Heading"><TextInput value={aboutBook.intro_heading} onChange={(e) => setAboutBook((p) => ({ ...p, intro_heading: e.target.value }))} /></Field>
          <StringListEditor label="Intro Paragraphs" items={aboutBook.paragraphs} onChange={(items) => setAboutBook((p) => ({ ...p, paragraphs: items }))} />
          <StringListEditor label="Who Should Read" items={aboutBook.should_read} onChange={(items) => setAboutBook((p) => ({ ...p, should_read: items }))} />
          <StringListEditor label="Who Should NOT Read" items={aboutBook.should_not_read} onChange={(items) => setAboutBook((p) => ({ ...p, should_not_read: items }))} />

          <h3 className="font-serif text-base text-foreground font-bold pt-4 border-t border-border-custom/50">Specifications</h3>
          <div className="space-y-3">
            {aboutBook.specifications.map((spec, idx) => (
              <div key={idx} className="grid grid-cols-[1fr_2fr_auto] gap-2 items-end">
                <Field label="Label">
                  <TextInput
                    value={spec.label}
                    onChange={(e) => setAboutBook((p) => {
                      const next = [...p.specifications];
                      next[idx] = { ...next[idx], label: e.target.value };
                      return { ...p, specifications: next };
                    })}
                  />
                </Field>
                <Field label="Value">
                  <TextInput
                    value={spec.value}
                    onChange={(e) => setAboutBook((p) => {
                      const next = [...p.specifications];
                      next[idx] = { ...next[idx], value: e.target.value };
                      return { ...p, specifications: next };
                    })}
                  />
                </Field>
                <button
                  onClick={() => setAboutBook((p) => ({ ...p, specifications: p.specifications.filter((_, i) => i !== idx) }))}
                  className="p-2.5 text-red-500 hover:text-red-600 cursor-pointer"
                  aria-label="Remove spec"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
            <button
              onClick={() => setAboutBook((p) => ({ ...p, specifications: [...p.specifications, { label: "", value: "" }] }))}
              className="px-3 py-2 rounded-lg border border-dashed border-border-custom text-xs flex items-center gap-2 cursor-pointer hover:bg-black/5 dark:hover:bg-white/5"
            >
              <Plus className="w-3.5 h-3.5" /> Add Spec Row
            </button>
          </div>

          <SaveButton onClick={saveAboutBook} saved={savedFlag === "about-book"} />
        </div>
      )}

      {/* ABOUT AUTHOR */}
      {subTab === "about-author" && (
        <div className="space-y-6 max-w-2xl">
          <StringListEditor label="Bio Paragraphs" items={aboutAuthor.bio_paragraphs} onChange={(items) => setAboutAuthor((p) => ({ ...p, bio_paragraphs: items }))} />
          <Field label="Mission Statement"><TextArea rows={2} value={aboutAuthor.mission} onChange={(e) => setAboutAuthor((p) => ({ ...p, mission: e.target.value }))} /></Field>
          <Field label="Vision Statement"><TextArea rows={2} value={aboutAuthor.vision} onChange={(e) => setAboutAuthor((p) => ({ ...p, vision: e.target.value }))} /></Field>

          <h3 className="font-serif text-base text-foreground font-bold pt-4 border-t border-border-custom/50">Timeline</h3>
          <div className="space-y-3">
            {aboutAuthor.timeline.map((ev, idx) => (
              <div key={idx} className="p-4 border border-border-custom rounded-xl space-y-2 relative">
                <button
                  onClick={() => setAboutAuthor((p) => ({ ...p, timeline: p.timeline.filter((_, i) => i !== idx) }))}
                  className="absolute top-3 right-3 text-red-500 hover:text-red-600 cursor-pointer"
                  aria-label="Remove timeline event"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
                <div className="grid grid-cols-[100px_1fr] gap-3">
                  <Field label="Year">
                    <TextInput
                      value={ev.year}
                      onChange={(e) => setAboutAuthor((p) => {
                        const next = [...p.timeline];
                        next[idx] = { ...next[idx], year: e.target.value };
                        return { ...p, timeline: next };
                      })}
                    />
                  </Field>
                  <Field label="Title">
                    <TextInput
                      value={ev.title}
                      onChange={(e) => setAboutAuthor((p) => {
                        const next = [...p.timeline];
                        next[idx] = { ...next[idx], title: e.target.value };
                        return { ...p, timeline: next };
                      })}
                    />
                  </Field>
                </div>
                <Field label="Description">
                  <TextArea
                    rows={2}
                    value={ev.desc}
                    onChange={(e) => setAboutAuthor((p) => {
                      const next = [...p.timeline];
                      next[idx] = { ...next[idx], desc: e.target.value };
                      return { ...p, timeline: next };
                    })}
                  />
                </Field>
              </div>
            ))}
            <button
              onClick={() => setAboutAuthor((p) => ({ ...p, timeline: [...p.timeline, { year: "", title: "", desc: "" }] }))}
              className="px-3 py-2 rounded-lg border border-dashed border-border-custom text-xs flex items-center gap-2 cursor-pointer hover:bg-black/5 dark:hover:bg-white/5"
            >
              <Plus className="w-3.5 h-3.5" /> Add Timeline Event
            </button>
          </div>

          <h3 className="font-serif text-base text-foreground font-bold pt-4 border-t border-border-custom/50">Speaking Topics</h3>
          <div className="space-y-3">
            {aboutAuthor.speaking_topics.map((topic, idx) => (
              <div key={idx} className="p-4 border border-border-custom rounded-xl space-y-2 relative">
                <button
                  onClick={() => setAboutAuthor((p) => ({ ...p, speaking_topics: p.speaking_topics.filter((_, i) => i !== idx) }))}
                  className="absolute top-3 right-3 text-red-500 hover:text-red-600 cursor-pointer"
                  aria-label="Remove speaking topic"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
                <Field label="Title">
                  <TextInput
                    value={topic.title}
                    onChange={(e) => setAboutAuthor((p) => {
                      const next = [...p.speaking_topics];
                      next[idx] = { ...next[idx], title: e.target.value };
                      return { ...p, speaking_topics: next };
                    })}
                  />
                </Field>
                <Field label="Description">
                  <TextArea
                    rows={2}
                    value={topic.desc}
                    onChange={(e) => setAboutAuthor((p) => {
                      const next = [...p.speaking_topics];
                      next[idx] = { ...next[idx], desc: e.target.value };
                      return { ...p, speaking_topics: next };
                    })}
                  />
                </Field>
              </div>
            ))}
            <button
              onClick={() => setAboutAuthor((p) => ({ ...p, speaking_topics: [...p.speaking_topics, { title: "", desc: "" }] }))}
              className="px-3 py-2 rounded-lg border border-dashed border-border-custom text-xs flex items-center gap-2 cursor-pointer hover:bg-black/5 dark:hover:bg-white/5"
            >
              <Plus className="w-3.5 h-3.5" /> Add Speaking Topic
            </button>
          </div>

          <SaveButton onClick={saveAboutAuthor} saved={savedFlag === "about-author"} />
        </div>
      )}

      {/* PREORDER PAGE */}
      {subTab === "preorder" && (
        <div className="space-y-6 max-w-2xl">
          <Field label="Header Subtitle">
            <TextArea
              rows={3}
              value={preorder.header_subtitle}
              onChange={(e) => setPreorder((p) => ({ ...p, header_subtitle: e.target.value }))}
            />
          </Field>

          <h3 className="font-serif text-base text-foreground font-bold pt-4 border-t border-border-custom/50">Store / Edition Cards</h3>
          <div className="space-y-4">
            {preorder.stores.map((store, idx) => (
              <div key={idx} className="p-4 border border-border-custom rounded-xl space-y-3 relative">
                <button
                  onClick={() => setPreorder((p) => ({ ...p, stores: p.stores.filter((_, i) => i !== idx) }))}
                  className="absolute top-3 right-3 text-red-500 hover:text-red-600 cursor-pointer"
                  aria-label="Remove store"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Store / Edition Name">
                    <TextInput
                      value={store.name}
                      onChange={(e) => setPreorder((p) => {
                        const next = [...p.stores];
                        next[idx] = { ...next[idx], name: e.target.value };
                        return { ...p, stores: next };
                      })}
                    />
                  </Field>
                  <Field label="Format">
                    <TextInput
                      value={store.format}
                      onChange={(e) => setPreorder((p) => {
                        const next = [...p.stores];
                        next[idx] = { ...next[idx], format: e.target.value };
                        return { ...p, stores: next };
                      })}
                    />
                  </Field>
                  <Field label="Region">
                    <TextInput
                      value={store.region}
                      onChange={(e) => setPreorder((p) => {
                        const next = [...p.stores];
                        next[idx] = { ...next[idx], region: e.target.value };
                        return { ...p, stores: next };
                      })}
                    />
                  </Field>
                  <Field label="Status">
                    <TextInput
                      value={store.status}
                      onChange={(e) => setPreorder((p) => {
                        const next = [...p.stores];
                        next[idx] = { ...next[idx], status: e.target.value };
                        return { ...p, stores: next };
                      })}
                    />
                  </Field>
                </div>
                <label className="flex items-center gap-2 text-xs cursor-pointer">
                  <input
                    type="checkbox"
                    checked={store.isPopular}
                    onChange={(e) => setPreorder((p) => {
                      const next = [...p.stores];
                      next[idx] = { ...next[idx], isPopular: e.target.checked };
                      return { ...p, stores: next };
                    })}
                    className="w-4 h-4 cursor-pointer"
                  />
                  Mark as "Recommended" (highlighted card)
                </label>
                <StringListEditor
                  label="Features"
                  items={store.features}
                  onChange={(items) => setPreorder((p) => {
                    const next = [...p.stores];
                    next[idx] = { ...next[idx], features: items };
                    return { ...p, stores: next };
                  })}
                />
              </div>
            ))}
            <button
              onClick={() => setPreorder((p) => ({ ...p, stores: [...p.stores, { name: "", format: "", region: "", status: "Coming Soon", isPopular: false, features: [] }] }))}
              className="px-3 py-2 rounded-lg border border-dashed border-border-custom text-xs flex items-center gap-2 cursor-pointer hover:bg-black/5 dark:hover:bg-white/5"
            >
              <Plus className="w-3.5 h-3.5" /> Add Store / Edition Card
            </button>
          </div>

          <SaveButton onClick={savePreorder} saved={savedFlag === "preorder"} />
        </div>
      )}
    </div>
  );
}
