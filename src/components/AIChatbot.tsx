"use client";

import React, { useState, useEffect, useRef } from "react";
import { X, Send, Sparkles, Compass, HelpCircle, MessageCircle, ChevronDown, ChevronLeft, ChevronRight, Mail } from "lucide-react";
import { useSiteSettings, type SiteSettings } from "@/context/SiteSettingsContext";
import { fetchPageContent } from "@/lib/content";
import { createClient } from "@/lib/supabase/client";
import { WISDOM_LINES } from "@/lib/wisdomLines";
import { GITA_FACTS } from "@/lib/gitaFacts";

type Message = {
  id: string;
  sender: "user" | "bot";
  text: string;
  timestamp: Date;
  // Which renderer a bot message needs: "ai" replies use real Markdown
  // (links, **bold**, bullet lists) straight from the live model; "local"
  // is the site's own hand-written copy (offline fallback + welcome
  // message), which only ever uses the legacy single-asterisk-bold
  // convention. User messages are always rendered as plain escaped text.
  kind?: "ai" | "local";
};

// A bot turn can also steer the conversation forward: which quick-reply
// chips to show next, and whether the next user message should be read
// as "which chapter?" rather than a fresh question.
type BotReply = {
  text: string;
  suggestions?: string[];
  awaitChapterPick?: boolean;
};

const CONTACT_EMAIL_PLACEHOLDER = "{{CONTACT_EMAIL}}";
const LAUNCH_EVENT_LINE = "The official live launch celebration follows shortly after — see the Events page for details.";
const NOT_YET_LISTED_MESSAGE = "Store links are being finalized — check back shortly, or visit the Pre-order page.";

// ---------------------------------------------------------------------
// Real book facts, mirrored from the same CMS defaults About Book fetches
// (src/app/about-book/page.tsx) and kept live-synced the same way, so the
// bot's answers about the book's contents can never drift from — or
// invent beyond — what's actually published on the site.
// ---------------------------------------------------------------------
type BookSpec = { label: string; value: string };
type ChatBookContent = { paragraphs: string[]; specifications: BookSpec[] };

const DEFAULT_CHAT_BOOK_CONTENT: ChatBookContent = {
  paragraphs: [
    "We live in an age of constant speed — bombarded by notifications, overwhelmed by choices, and quietly afraid of falling behind. Five thousand years ago, on the battlefield of Kurukshetra, the warrior Arjuna froze in that exact same way: paralyzed by doubt, grief, and the noise of conflicting duties. In response, Krishna delivered 700 verses of the Bhagavad Gita — not as an escape from life, but as a way to stand steady in the center of it. The Unshaken Self takes KETUL SHAH's years of scriptural research and turns those ancient verses into a modern mental toolkit: how to act without burning out, how to carry stress without being crushed by it, and how to meet each day from a place of quiet strength rather than reactive panic.",
  ],
  specifications: [
    { label: "Book Title", value: "The Unshaken Self: Key Lessons from the Gita for a Life Without Doubt, Worry, and Fear" },
    { label: "Author Name", value: "KETUL SHAH" },
    { label: "Format", value: "Hardcover, Paperback, Kindle, Audiobook" },
    { label: "Page Count", value: "320 pages" },
    { label: "Publisher", value: "Notion Press Publication, India" },
    { label: "ISBN-13 (Hardcover)", value: "979-8906961303" },
    { label: "ISBN-13 (Paperback)", value: "979-8906961297" },
    { label: "Dimensions", value: "6.0 x 9.0 inches" },
    { label: "Release Date", value: "September 3, 2026 (Krishna Janmashtami)" },
  ],
};

function specValue(specs: BookSpec[], label: string): string {
  return specs.find((s) => s.label === label)?.value ?? "";
}

// Real author bio and resources list, mirrored the same way as the book
// content above — live-fetched from the same CMS slugs the About Author
// and Resources pages use, with these as the fallback defaults. This is
// what gets handed to the real AI backend (src/app/api/chat/route.ts) so
// it can answer open-ended questions about the author or the free
// downloads with real facts instead of guessing.
type ChatAuthorContent = { bio_paragraphs: string[] };

const DEFAULT_CHAT_AUTHOR_CONTENT: ChatAuthorContent = {
  bio_paragraphs: [
    "KETUL SHAH bridges the high-stakes reality of the modern corporate world with the profound, quiet depths of ancient spiritual wisdom. For the past twenty years, he has built a highly successful career in the fast-paced, demanding Information Technology (IT) industry. Those who cross his path quickly recognise that his most defining achievement is not his extensive professional resume, but the unshakeable inner peace he maintains amidst the constant pressures of corporate life. He is the living embodiment of the principles shared in The Unshaken Self—a modern professional navigating the complexities of the world with a calm, worry-free mind.",
    "Beyond the boardroom, Ketul was born and raised in a Pushtimargiya Vaishnav family, and remains a devoted follower of Krishna (Thakorji) to this day. He has spent years diving deeply into the timeless teachings of the Bhagavad Gita, seeking to decode its ancient verses into practical, everyday keys for human happiness. For Ketul, the Gita is not merely a philosophical or historical text; it is a vital, living manual for understanding the immense power of the human mind. By actively applying these foundational principles to his own life, he has mastered the art of fine-tuning his consciousness to live free of tension—a state of being he passionately believes is accessible to everyone.",
    "This pursuit of harmony extends far beyond his spiritual studies into a rich, vibrant creative life. Ketul is an accomplished polymath with a profound love for the arts. He is a dedicated musician who explores a multitude of genres and plays more than twelve different instruments, finding deep joy and presence in creating and regenerating music.",
    "This same creative devotion is mirrored in his culinary arts. In the kitchen, Ketul is an award-winning innovator, celebrated for his unique fusion cuisines and his ability to balance complex flavours. His culinary artistry has earned him prestigious accolades, including the \"Hyper Budding Chef\" and \"Creative Chef\" awards. Whether he is tuning an instrument or crafting a new dish, he approaches his passions with the same total presence and devotion that he applies to his spiritual life.",
    "At the very core of Ketul's existence is a philosophy of total surrender and trust. He navigates his journey by simply moving with the flow of life, accepting whatever the universe presents without doubt, question, or anxiety. He holds a quiet, unbreakable belief that the universe is inherently benevolent—always working in his favour and constantly guiding him closer to the manifestation of his deepest desires and dreams.",
  ],
};

type ChatResource = { name: string; desc: string; isPremium: boolean };
type ChatResourcesContent = { resources: ChatResource[] };

const DEFAULT_CHAT_RESOURCES_CONTENT: ChatResourcesContent = {
  resources: [
    { name: "The 18 Chapters Study Companion", desc: "A workbook summarizing all 18 chapters of the Bhagavad Gita, containing reflections, Sanskrit vocab highlights, and modern mindfulness equivalents.", isPremium: false },
    { name: "Karma Yoga Worksheet: Decoupling Actions", desc: "A printable 3-column reflection sheet to map your weekly professional tasks, isolate your inputs, and consciously release attachment to outcomes.", isPremium: false },
    { name: "Sthitaprajna Daily Meditation Tracker", desc: "A 30-day habits ledger helping you monitor physical stillness, breath ratios, and daily reaction responses in real-time.", isPremium: true },
    { name: "Book Club Kit & Discussion Questions", desc: "A comprehensive guide with 20 discussion prompts, study notes, and scheduling structures tailored for book clubs and reading groups.", isPremium: true },
  ],
};

type ChatEvent = { title: string; date: string; time: string; type: string };

// ---------------------------------------------------------------------
// Safe, dependency-free rendering helpers. Output is always built from
// escaped text first, so even AI-generated content (or a crafted prompt
// trying to inject markup) can never become live HTML/script — at worst
// it renders as inert text.
// ---------------------------------------------------------------------
function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// Only a plain http(s) URL or a relative in-site path is ever allowed as
// a link target — blocks javascript: URIs and similar, whether from the
// AI or anything else.
function isSafeUrl(url: string): boolean {
  return /^https?:\/\//i.test(url) || url.startsWith("/");
}

// Plain user-typed text: escaped, with line breaks preserved, no
// markdown interpretation at all (so a user typing literal asterisks
// doesn't get unexpectedly bolded).
function renderUserText(raw: string): string {
  return escapeHtml(raw).replace(/\n/g, "<br/>");
}

// The site's own hand-written bot copy (offline fallback replies, the
// welcome message, FAQ answers) — legacy single-asterisk bold, the
// convention already used throughout this file's authored strings.
function renderLocalBotText(raw: string): string {
  return escapeHtml(raw)
    .replace(/\*(.+?)\*/g, "<strong>$1</strong>")
    .replace(/\n/g, "<br/>");
}

// Real AI replies: standard Markdown — [label](url) links (URL-checked),
// **bold**, and "- " bullet lists. Deliberately does NOT also support
// single-asterisk bold like renderLocalBotText, since the AI can
// legitimately emit a bare "*" in math or other general-knowledge
// answers and a loose single-asterisk pairing would mis-render those.
function renderAiText(raw: string): string {
  let text = escapeHtml(raw);

  text = text.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_m, label: string, url: string) => {
    const decodedUrl = url.replace(/&amp;/g, "&");
    if (!isSafeUrl(decodedUrl)) return label;
    const external = /^https?:\/\//i.test(decodedUrl);
    return `<a href="${decodedUrl}" class="underline text-[#D6A63C] hover:opacity-80"${external ? ' target="_blank" rel="noopener noreferrer"' : ""}>${label}</a>`;
  });

  text = text.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");

  const lines = text.split("\n");
  const parts: string[] = [];
  let listBuffer: string[] = [];
  const flushList = () => {
    if (listBuffer.length) {
      parts.push(`<ul class="list-disc pl-4 space-y-0.5 my-1">${listBuffer.map((i) => `<li>${i}</li>`).join("")}</ul>`);
      listBuffer = [];
    }
  };
  for (const line of lines) {
    const bulletMatch = line.match(/^\s*[-*]\s+(.*)/);
    if (bulletMatch) {
      listBuffer.push(bulletMatch[1]);
    } else {
      flushList();
      parts.push(line);
    }
  }
  flushList();
  return parts.join("<br/>");
}

// A short, faithful paraphrase of the real About Author bio — same facts
// (and near-identical wording) used in the Media Kit's Short Biography —
// kept hand-written rather than fetched so it stays chat-bubble-sized.
const SHORT_AUTHOR_BIO =
  "KETUL SHAH is the author of *The Unshaken Self*. Over a twenty-year career in the IT industry, he's become known less for his resume than for the unshakeable calm he keeps under constant pressure — rooted in a lifetime of studying the Bhagavad Gita, having been raised in a Pushtimargiya Vaishnav family devoted to Krishna. Off the page, he's a multi-instrumentalist (12+ instruments) and an award-winning fusion-cuisine chef (\"Hyper Budding Chef,\" \"Creative Chef\"). Curious for more? The About the Author page has his full story and timeline.";

const RESOURCES_REPLY =
  "The Resources page has real downloads: *The 18 Chapters Study Companion* (reflections and modern equivalents for every chapter) and the *Karma Yoga Worksheet* are free right now. Enter your email there and you'll also unlock the *Sthitaprajna Daily Meditation Tracker* and the *Book Club Kit & Discussion Questions*. There's also a live Three-Breath Pause tracker and breathing widget you can use right in your browser — no download needed.";

const FEEDBACK_REPLY =
  "Already read it — or just want to say hi? The Feedback page has a quick star rating plus a category picker (general, a suggestion, something broken, or just saying thanks), and it goes straight to Ketul. You can also browse what other readers have said on the Reviews page.";

const PREVIEW_REPLY =
  "You can read Chapter 1 free right now on the Preview page — *When Life Freezes You* — plus a printable PDF sample with the Three-Breath Pause practice and a reflection worksheet. It's the same daily practice the book keeps coming back to.";

const RELIGIOUS_REPLY =
  "Not in a dogmatic sense. *The Unshaken Self* isn't a theological treatise or religious doctrine — it's a practical, non-dogmatic guide for anyone facing stress, burnout, or uncertainty, whether or not you know the Gita at all. The one real prerequisite is a willingness to actually reflect and practice, not just read. See the About the Book page for exactly who it's for — and who it isn't.";

const DAILY_PRACTICE_REPLY =
  "Yes — the homepage has a Daily Teaching ritual: draw a real chapter teaching each day and build a streak, the same way you can right here in chat by saying \"explore a chapter.\" There's also the Three-Breath Pause practice (Preview page) and a breathing widget on the Resources page.";

const QUIZ_REPLY =
  "Yes — the Unshaken Quiz on the homepage takes about two minutes and matches you to one of four archetypes (like the Karma Yogi or the Steady Witness), each tied to a real chapter, so you know exactly where to start reading.";

const BOOKCLUB_REPLY =
  "Definitely — the Resources page has a Book Club Kit & Discussion Questions download (20 discussion prompts plus study notes and scheduling structures) built specifically for reading groups.";

function buildSpecsReply(content: ChatBookContent): string {
  const pages = specValue(content.specifications, "Page Count") || "320 pages";
  const dims = specValue(content.specifications, "Dimensions") || "6.0 x 9.0 inches";
  const publisher = specValue(content.specifications, "Publisher") || "Notion Press Publication, India";
  const isbnHardcover = specValue(content.specifications, "ISBN-13 (Hardcover)") || "979-8906961303";
  const isbnPaperback = specValue(content.specifications, "ISBN-13 (Paperback)") || "979-8906961297";
  return `Quick specs: ${pages}, ${dims}, published by ${publisher}.\n\nISBN-13 (Hardcover): ${isbnHardcover}\nISBN-13 (Paperback): ${isbnPaperback}`;
}

function buildInternationalReply(settings: SiteSettings): string {
  const hasUS = Boolean(settings.buy_link_amazon_us_paperback || settings.buy_link_amazon_us_hardcover);
  const hasCA = Boolean(settings.buy_link_amazon_ca_paperback || settings.buy_link_amazon_ca_hardcover);
  const hasAU = Boolean(settings.buy_link_amazon_au_paperback || settings.buy_link_amazon_au_hardcover);

  if (!hasUS && !hasCA && !hasAU) {
    return "Right now it's confirmed in India — check the Pre-order page for the latest on other regions.";
  }
  const regions: string[] = [];
  if (hasUS) regions.push(`the US (Paperback ${settings.price_paperback_us}, Hardcover ${settings.price_hardcover_us})`);
  if (hasCA) regions.push(`Canada (Paperback ${settings.price_paperback_ca}, Hardcover ${settings.price_hardcover_ca})`);
  if (hasAU) regions.push(`Australia (Paperback ${settings.price_paperback_au}, Hardcover ${settings.price_hardcover_au})`);
  return `Yes — beyond India, it's also on Amazon in ${regions.join(", ")}. Visit the Pre-order page and switch the region tab for direct links.`;
}

function buildAboutBookReply(content: ChatBookContent): string {
  const pages = specValue(content.specifications, "Page Count") || "320 pages";
  const publisher = specValue(content.specifications, "Publisher") || "Notion Press Publication, India";
  const release = specValue(content.specifications, "Release Date") || "September 3, 2026 (Krishna Janmashtami)";
  const teaser = content.paragraphs[0] ?? "";
  const sentences = teaser.split(". ");
  const shortTeaser = sentences.slice(0, 2).join(". ") + (sentences.length > 2 ? "." : "");
  return `${shortTeaser}\n\nIt's ${pages}, published by ${publisher}, and it launched ${release}. Want the full specs and ISBNs? See the About the Book page — or ask me to "explore a chapter" for a taste of what's inside.`;
}

function buildEventsReply(settings: SiteSettings): string {
  const hasSession = Boolean(settings.live_session_datetime?.trim());
  if (hasSession) {
    return `There's a live session on the calendar — *${settings.live_session_title}*. Head to the Events page for the exact date and time, or leave a question in advance via the "Ask Ketul" box there.`;
  }
  return `No live session is on the calendar yet, but the Events page is where virtual launches, Q&A workshops, and bookstore signings get posted as they're scheduled. You can also drop a question into the "Ask Ketul" box there right now — Ketul reads every one.`;
}

function gitaFactReply(): string {
  const fact = GITA_FACTS[Math.floor(Math.random() * GITA_FACTS.length)];
  return `Here's a quick fact: ${fact}`;
}

// ---------------------------------------------------------------------
// Chapter explorer — grounded in the same 18 real, original teachings
// used on the homepage's Daily Teaching ritual and the Resources page's
// printable affirmation cards (src/lib/wisdomLines.ts), so a chapter
// "reveal" in chat always matches what's actually on the site.
// ---------------------------------------------------------------------
const CHAPTER_WORDS: Record<string, number> = {
  one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8,
  nine: 9, ten: 10, eleven: 11, twelve: 12, thirteen: 13, fourteen: 14,
  fifteen: 15, sixteen: 16, seventeen: 17, eighteen: 18,
};

function parseChapterNumber(q: string): number | null {
  const digitMatch = q.match(/\b(1[0-8]|[1-9])\b/);
  if (digitMatch) {
    const n = parseInt(digitMatch[1], 10);
    if (n >= 1 && n <= 18) return n;
  }
  for (const [word, num] of Object.entries(CHAPTER_WORDS)) {
    if (new RegExp(`\\b${word}\\b`).test(q)) return num;
  }
  return null;
}

const CHAPTER_FOLLOWUP_SUGGESTIONS = ["Surprise me with a teaching", "I'm feeling anxious", "How do I buy the book?", "Any free resources?"];
const EXPLORE_CHAPTER_SUGGESTIONS = ["Chapter 1", "Chapter 5", "Chapter 9", "Chapter 12", "Chapter 18", "Surprise me"];
const EXPLORE_CHAPTER_PROMPT_TEXT =
  "*The Unshaken Self* maps all 18 chapters of the Gita — from Arjuna's doubt in Chapter 1 to freedom in Chapter 18. Pick a number from 1–18 and I'll share that chapter's real teaching, or just say \"surprise me.\"";

function chapterReply(num: number): string {
  const entry = WISDOM_LINES.find((w) => w.num === num);
  if (!entry) return 'I only know chapters 1 through 18 — pick a number in that range, or say "surprise me."';
  return `*Chapter ${entry.num} — ${entry.theme}*\n\n"${entry.line}"\n\nWant another? Type a number from 1–18, say "surprise me," or try the full Daily Teaching ritual (with a streak counter) on the homepage.`;
}

function randomChapterReply(): string {
  const entry = WISDOM_LINES[Math.floor(Math.random() * WISDOM_LINES.length)];
  return `Here's a teaching for you: *Chapter ${entry.num} — ${entry.theme}*\n\n"${entry.line}"\n\nThat's the same ritual as the homepage's Daily Teaching draw — visit daily to build your streak. Want another? Just type a number from 1–18.`;
}

const CHAPTER_OVERVIEW =
  "The Bhagavad Gita has 18 chapters, and *The Unshaken Self* turns each into a modern teaching — for example, Chapter 2 (*Sankhya Yoga*) builds mental stillness, Chapter 3 (*Karma Yoga*) is about acting without being gripped by the outcome, and Chapter 6 (*Dhyana Yoga*) is about meditation and self-mastery.";

// ---------------------------------------------------------------------
// Mood map — real keywords from visitors mapped to a specific, real
// chapter + its actual one-liner (not an invented technique), so an
// emotional question gets a grounded, specific answer instead of filler.
// ---------------------------------------------------------------------
type MoodRule = { keywords: string[]; chapter: number; lead: string };

const MOOD_RULES: MoodRule[] = [
  { keywords: ["stress", "work", "burnout", "pressure", "overwhelm", "deadline", "boss"], chapter: 3, lead: "That sounds like Karma Yoga territory —" },
  { keywords: ["doubt", "confus", "frozen", "paraly", "indecis", "stuck", "lost"], chapter: 1, lead: "That's exactly where the Gita itself begins —" },
  { keywords: ["anxi", "worry", "worried", "fear", "afraid", "scared", "panic", "nervous"], chapter: 2, lead: "For that, the book turns to —" },
  { keywords: ["anger", "angry", "pride", "ego", "jealous", "greedy"], chapter: 16, lead: "The Gita has a direct answer for that —" },
  { keywords: ["devotion", "consisten", "habit", "discipline", "routine"], chapter: 12, lead: "That's the heart of —" },
  { keywords: ["meditat", "distract", "concentrat"], chapter: 6, lead: "That's exactly what this chapter is for —" },
  { keywords: ["who am i", "identity", "self-worth", "self worth", "purpose"], chapter: 13, lead: "A good place to sit with that question —" },
  { keywords: ["faith", "believe", "belief"], chapter: 17, lead: "The Gita speaks to that directly —" },
  { keywords: ["trapped", "freedom", "stuck in a rut"], chapter: 18, lead: "Fittingly, that's the final teaching —" },
  { keywords: ["knowledge", "learning", "understand"], chapter: 7, lead: "That's covered in —" },
  { keywords: ["guilt", "mistake", "regret", "shame"], chapter: 4, lead: "This chapter speaks directly to that —" },
  { keywords: ["grief", "loss", "mourning", "heartbreak"], chapter: 1, lead: "The Gita opens in grief too —" },
];

function moodReply(rule: MoodRule): string {
  const entry = WISDOM_LINES.find((w) => w.num === rule.chapter)!;
  return `${rule.lead} *Chapter ${entry.num}, ${entry.theme}*.\n\n"${entry.line}"\n\nThat's one real teaching from the book. Want the practice that goes with it? Visit the Resources page, or ask me to "explore a chapter" for more.`;
}

// Reads the same live settings the Buy Now modal uses, so this chatbot's
// answers about buying/pricing/formats can never drift out of sync with
// the rest of the site the way hardcoded copy would.
function hasAnyStore(settings: SiteSettings): boolean {
  return Boolean(
    settings.buy_link_notionpress_paperback ||
    settings.buy_link_notionpress_hardcover ||
    settings.buy_link_amazon_paperback ||
    settings.buy_link_amazon_hardcover ||
    settings.buy_link_flipkart_paperback ||
    settings.buy_link_flipkart_hardcover
  );
}

function describeStores(settings: SiteSettings): string {
  const hasNotionPress = Boolean(settings.buy_link_notionpress_paperback || settings.buy_link_notionpress_hardcover);
  const hasAmazon = Boolean(settings.buy_link_amazon_paperback || settings.buy_link_amazon_hardcover);
  const hasFlipkart = Boolean(settings.buy_link_flipkart_paperback || settings.buy_link_flipkart_hardcover);

  const other: string[] = [];
  if (hasAmazon) other.push("Amazon.in (now with Prime)");
  if (hasFlipkart) other.push("Flipkart");

  if (hasNotionPress && other.length) {
    return `on ${other.join(" and ")}, and directly from Notion Press (the author's own recommended store)`;
  }
  if (hasNotionPress) return "directly from Notion Press (the author's own recommended store)";
  if (other.length) return `on ${other.join(" and ")}`;
  return "";
}

function buildFaqs(settings: SiteSettings, bookContent: ChatBookContent): { q: string; a: string }[] {
  const available = hasAnyStore(settings);
  const storeDescription = describeStores(settings);

  return [
    {
      q: "When will the book launch?",
      a: available
        ? `The Unshaken Self is available now — you can buy it right now ${storeDescription}. ${LAUNCH_EVENT_LINE}`
        : `${NOT_YET_LISTED_MESSAGE} ${LAUNCH_EVENT_LINE}`
    },
    {
      q: "What's the book actually about?",
      a: buildAboutBookReply(bookContent)
    },
    {
      q: "How much will the book cost?",
      a: available
        ? `Paperback is ${settings.price_paperback} and Hardcover is ${settings.price_hardcover}, ${storeDescription}.`
        : NOT_YET_LISTED_MESSAGE
    },
    {
      q: "What formats will be available?",
      a: available
        ? `Paperback and Hardcover are both available now, ${storeDescription}. Kindle and audiobook editions are planned for a later release.`
        : `Paperback and Hardcover will be available on Amazon and Notion Press. Kindle and audiobook editions are planned for a later release. ${NOT_YET_LISTED_MESSAGE}`
    },
    {
      q: "Can I read a free sample?",
      a: "Yes — read *When Life Freezes You* (Chapter 1) free on the Preview page, plus a printable sample PDF with the Three-Breath Pause practice and a reflection worksheet."
    },
    {
      q: "Who is this book for?",
      a: "It's written for anyone facing stress, burnout, or uncertainty who wants a practical, non-dogmatic guide rooted in the Bhagavad Gita. See the About the Book page for who should — and shouldn't — read it."
    },
    {
      q: "Where can I get free resources?",
      a: RESOURCES_REPLY
    },
    {
      q: "Are there live events or Q&A sessions?",
      a: buildEventsReply(settings)
    },
    {
      q: "Can I leave feedback after reading?",
      a: FEEDBACK_REPLY
    },
    {
      q: "What are the ISBN numbers and other specs?",
      a: buildSpecsReply(bookContent)
    },
    {
      q: "Is the book available outside India?",
      a: buildInternationalReply(settings)
    },
    {
      q: "Is this a religious book, or do I need to know the Gita already?",
      a: RELIGIOUS_REPLY
    },
    {
      q: "How many chapters does the book have?",
      a: `${CHAPTER_OVERVIEW} Ask me to "explore a chapter" right here in chat and I'll share any one's real teaching.`
    },
    {
      q: "Is there a daily practice I can follow?",
      a: DAILY_PRACTICE_REPLY
    },
    {
      q: "Is there a quiz to find where I should start?",
      a: QUIZ_REPLY
    },
    {
      q: "Is this book good for book clubs?",
      a: BOOKCLUB_REPLY
    },
    {
      q: "How do I contact KETUL SHAH directly?",
      a: `You can reach out anytime at ${CONTACT_EMAIL_PLACEHOLDER} — Ketul personally reads every message.`
    },
  ];
}

// A short, factual anchor — used both for direct "how do I buy" questions
// and folded into the catch-all fallback, so even an unmatched question
// still surfaces real, current information instead of pure filler.
function buildQuickFacts(settings: SiteSettings): string {
  if (!hasAnyStore(settings)) {
    return `${NOT_YET_LISTED_MESSAGE} ${LAUNCH_EVENT_LINE}`;
  }
  return `It's available now — Paperback ${settings.price_paperback}, Hardcover ${settings.price_hardcover} — ${describeStores(settings)}. ${LAUNCH_EVENT_LINE}`;
}

function buildBuyResponse(settings: SiteSettings): string {
  if (!hasAnyStore(settings)) {
    return `${NOT_YET_LISTED_MESSAGE}`;
  }
  return `Great news — *The Unshaken Self* is available right now! Paperback is ${settings.price_paperback} and Hardcover is ${settings.price_hardcover}, ${describeStores(settings)}. Tap the "Buy Now" button at the top of the page, or visit the Pre-order page for direct links. ${LAUNCH_EVENT_LINE}`;
}

// A safe, deterministic external link — never AI-generated, so there's
// no risk of a hallucinated URL. Opens a Google search for whatever the
// visitor last asked, for anything Ask Ket can't answer from the site.
const SEARCH_WEB_LABEL = "🔍 Search the web";

const DEFAULT_SUGGESTIONS = [
  "Explore a chapter",
  "I'm feeling stressed about work",
  "Give me a wisdom quote",
  "How do I buy the book?",
  SEARCH_WEB_LABEL,
];

const GREETINGS = [
  "Pranam! 🙏 Good to see you. What's on your mind — stress, a specific chapter, or just curious about the book?",
  "Hello! Happy to have you here. Want a quick teaching, or are you looking for something specific about *The Unshaken Self*?",
  "Hey there! Ask me about a chapter, tell me how you're feeling, or ask how to get the book — I'll point you the right way.",
];

const THANKS = [
  "You're welcome 🙏 — glad that helped. Anything else on your mind?",
  "Anytime. That's what I'm here for. Want another teaching, or anything else about the book?",
  "Glad to help. Come back whenever you need steadying.",
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export default function AIChatbot() {
  const { settings } = useSiteSettings();
  const contactEmail = settings.contact_email;
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [viewMode, setViewMode] = useState<"chat" | "faq">("chat");
  const [openFaqIdx, setOpenFaqIdx] = useState<number | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>(DEFAULT_SUGGESTIONS);
  const [awaitingChapterPick, setAwaitingChapterPick] = useState(false);
  const [bookContent, setBookContent] = useState<ChatBookContent>(DEFAULT_CHAT_BOOK_CONTENT);
  const [authorContent, setAuthorContent] = useState<ChatAuthorContent>(DEFAULT_CHAT_AUTHOR_CONTENT);
  const [resourcesContent, setResourcesContent] = useState<ChatResourcesContent>(DEFAULT_CHAT_RESOURCES_CONTENT);
  const [upcomingEvents, setUpcomingEvents] = useState<ChatEvent[]>([]);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const faqs = buildFaqs(settings, bookContent);

  // Keeps the left/right scroll arrows in sync with how far the
  // suggestion strip can actually scroll in each direction.
  const updateScrollArrows = () => {
    const el = suggestionsRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  };

  const scrollSuggestions = (direction: -1 | 1) => {
    suggestionsRef.current?.scrollBy({ left: direction * 140, behavior: "smooth" });
  };

  // Lets the strip scroll with the keyboard (Left/Right arrow keys) once
  // it's focused, not just by dragging — re-checked whenever the chip
  // set changes, since a new/shorter suggestion list can change whether
  // there's anything left to scroll to.
  useEffect(() => {
    updateScrollArrows();
  }, [suggestions]);

  // Same live CMS fetches the real pages use, so the AI's answers about
  // the book, author, resources, and events stay in sync with admin
  // edits instead of going stale or being hardcoded into a prompt.
  useEffect(() => {
    fetchPageContent("about-book", DEFAULT_CHAT_BOOK_CONTENT).then(setBookContent);
    fetchPageContent("about-author", DEFAULT_CHAT_AUTHOR_CONTENT).then(setAuthorContent);
    fetchPageContent("resources", DEFAULT_CHAT_RESOURCES_CONTENT).then(setResourcesContent);

    const supabase = createClient();
    supabase
      .from("events")
      .select("title, event_date, event_time, event_type")
      .order("created_at", { ascending: true })
      .then(({ data, error }) => {
        if (!error && data) {
          setUpcomingEvents(
            data.slice(0, 5).map((ev) => ({
              title: ev.title,
              date: ev.event_date,
              time: ev.event_time || "TBD",
              type: ev.event_type,
            }))
          );
        }
      });
  }, []);

  // Initialize with a welcome message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: "welcome",
          sender: "bot",
          text: 'Pranam! 🙏 I am Ask Ket, your AI companion — here to guide you through KETUL SHAH\'s *The Unshaken Self*. Tell me how you\'re feeling (stressed, anxious, stuck), ask me to "explore a chapter," or ask me anything at all — how can I help you find focus, clarity, or peace today?',
          timestamp: new Date(),
          kind: "local",
        },
      ]);
    }
  }, [messages.length]);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSend = async (text: string) => {
    if (!text.trim()) return;

    setViewMode("chat");

    // Add user message
    const userMsg: Message = {
      id: Math.random().toString(),
      sender: "user",
      text,
      timestamp: new Date(),
    };
    const historyWithNewMsg = [...messages, userMsg];
    setMessages(historyWithNewMsg);
    setInputValue("");
    setIsTyping(true);

    const wasAwaitingPick = awaitingChapterPick;
    setAwaitingChapterPick(false);

    // Primary path: the real AI backend, grounded with the same live
    // CMS/settings data the rest of the site already fetches. Falls
    // back to the local rule-based engine below if the AI call fails
    // for any reason (no API key configured yet, network issue, rate
    // limit) so the widget always gives a real answer either way.
    try {
      const payloadMessages = historyWithNewMsg.slice(-12).map((m) => ({
        role: m.sender === "user" ? "user" : "assistant",
        content: m.text,
      }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: payloadMessages,
          context: {
            settings,
            bookSpecs: bookContent.specifications,
            bookTeaser: bookContent.paragraphs[0],
            authorBio: authorContent.bio_paragraphs,
            resources: resourcesContent.resources,
            events: upcomingEvents,
          },
        }),
      });

      if (!res.ok) throw new Error("ai-unavailable");
      const data = await res.json();
      if (!data?.reply) throw new Error("ai-empty");

      setMessages((prev) => [
        ...prev,
        { id: Math.random().toString(), sender: "bot", text: data.reply, timestamp: new Date(), kind: "ai" },
      ]);
      setSuggestions(DEFAULT_SUGGESTIONS);
    } catch {
      const reply = getLocalFallbackResponse(text, wasAwaitingPick);
      setMessages((prev) => [
        ...prev,
        { id: Math.random().toString(), sender: "bot", text: reply.text, timestamp: new Date(), kind: "local" },
      ]);
      setAwaitingChapterPick(Boolean(reply.awaitChapterPick));
      setSuggestions(reply.suggestions ?? DEFAULT_SUGGESTIONS);
    } finally {
      setIsTyping(false);
    }
  };

  // Offline/no-AI fallback engine — the original rule-based matcher.
  // Used only when the real AI backend (POST /api/chat) is unavailable
  // (no GROQ_API_KEY configured yet, a network hiccup, rate limiting),
  // so the widget still gives a real, grounded answer instead of
  // breaking outright.
  const getLocalFallbackResponse = (query: string, awaitingPick: boolean): BotReply => {
    const q = query.toLowerCase().trim();

    // If the last bot turn asked "which chapter?", read this message as
    // the answer to that question first, before anything else.
    if (awaitingPick) {
      if (/surprise|random|any(one)?|pick for me|you choose|you pick/.test(q)) {
        return { text: randomChapterReply(), suggestions: CHAPTER_FOLLOWUP_SUGGESTIONS };
      }
      const num = parseChapterNumber(q);
      if (num) {
        return { text: chapterReply(num), suggestions: CHAPTER_FOLLOWUP_SUGGESTIONS };
      }
      // Didn't understand the pick — stay in picking mode and ask again.
      return {
        text: 'That\'s not a chapter I recognize — pick any number from 1 to 18, or say "surprise me" and I\'ll choose for you.',
        suggestions: EXPLORE_CHAPTER_SUGGESTIONS,
        awaitChapterPick: true,
      };
    }

    // Greetings
    if (/^(hi|hey|hello|yo|namaste|pranam)\b/.test(q)) {
      return { text: pick(GREETINGS) };
    }

    // Thanks
    if (/\b(thanks|thank you|thx|appreciate)\b/.test(q)) {
      return { text: pick(THANKS) };
    }

    // Explicitly asking to explore/pick a chapter
    if (/(explore|pick|choose|another)\s+(a\s+)?chapter/.test(q) || q === "explore a chapter") {
      return { text: EXPLORE_CHAPTER_PROMPT_TEXT, suggestions: EXPLORE_CHAPTER_SUGGESTIONS, awaitChapterPick: true };
    }

    // A specific chapter mentioned by number, e.g. "tell me about chapter 5"
    if (q.includes("chapter")) {
      const num = parseChapterNumber(q);
      if (num) {
        return { text: chapterReply(num), suggestions: CHAPTER_FOLLOWUP_SUGGESTIONS };
      }
    }

    // "Surprise me" / random-teaching requests outside the picker flow
    if (/surprise me|random (teaching|chapter|wisdom)|draw (a )?(teaching|card)/.test(q)) {
      return { text: randomChapterReply(), suggestions: CHAPTER_FOLLOWUP_SUGGESTIONS };
    }

    // General "tell me about the chapters/Gita" — give a real overview,
    // then hand off into the interactive picker.
    if (q.includes("chapter") || q.includes("gita") || q.includes("18") || q.includes("lessons")) {
      return {
        text: `${CHAPTER_OVERVIEW}\n\nWant a specific one? Pick a number from 1–18, or say "surprise me."`,
        suggestions: EXPLORE_CHAPTER_SUGGESTIONS,
        awaitChapterPick: true,
      };
    }

    // Mood / feeling keywords, mapped to a real, specific chapter
    for (const rule of MOOD_RULES) {
      if (rule.keywords.some((k) => q.includes(k))) {
        return { text: moodReply(rule), suggestions: CHAPTER_FOLLOWUP_SUGGESTIONS };
      }
    }

    // Contact (checked before the author bucket, since "contact Ketul"
    // mentions the author's name too)
    if (q.includes("contact") || q.includes("email") || q.includes("reach out") || q.includes("get in touch")) {
      return { text: `You can reach out anytime at ${contactEmail} — Ketul personally reads every message.` };
    }

    // About the author
    if (q.includes("ketul") || q.includes("shah") || q.includes("who is") || q.includes("author")) {
      return { text: SHORT_AUTHOR_BIO, suggestions: ["What's the book about?", "Give me a wisdom quote", "How do I buy the book?", "Any live events?"] };
    }

    // Buying / pricing / formats
    if (q.includes("preorder") || q.includes("pre-order") || q.includes("buy") || q.includes("price") || q.includes("purchase") || q.includes("how do i get") || q.includes("where can i get") || q.includes("where to get") || q.includes("get a copy") || q.includes("get the book") || q.includes("format") || q.includes("kindle") || q.includes("audiobook") || q.includes("paperback") || q.includes("hardcover") || q.includes("cost")) {
      return { text: buildBuyResponse(settings), suggestions: ["Any free resources?", "Explore a chapter", "What's the book about?", "Any live events?"] };
    }

    // Free resources / downloads
    if (q.includes("resource") || q.includes("download") || q.includes("worksheet") || q.includes("free guide") || q.includes("workbook") || q.includes("tracker")) {
      return { text: RESOURCES_REPLY, suggestions: ["Explore a chapter", "How do I buy the book?", "What's the book about?"] };
    }

    // Events / live sessions
    if (q.includes("event") || q.includes("live session") || q.includes("workshop") || q.includes("signing") || q.includes("webinar") || q.includes("ask ketul") || q.includes("q&a") || q.includes("qa session")) {
      return { text: buildEventsReply(settings), suggestions: ["Who is KETUL SHAH?", "How do I buy the book?", "Give me a wisdom quote"] };
    }

    // Feedback / reviews
    if (q.includes("feedback") || q.includes("review") || q.includes("rate the book") || q.includes("rating")) {
      return { text: FEEDBACK_REPLY, suggestions: ["Explore a chapter", "How do I buy the book?", "Any free resources?"] };
    }

    // Fun facts / trivia
    if (q.includes("fact") || q.includes("trivia") || q.includes("did you know") || q.includes("interesting")) {
      return { text: gitaFactReply(), suggestions: ["Tell me another fact", "Explore a chapter", "Give me a wisdom quote"] };
    }

    // Wisdom quotes
    if (q.includes("quote") || q.includes("wisdom") || q.includes("inspiration")) {
      const quotes = [
        "\"You have a right to perform your prescribed duty, but you are not entitled to the fruits of action.\" (Bhagavad Gita 2.47) - Focus on the effort, release the reward.",
        "\"For the wise, the mind is the greatest friend; but for the undisciplined, the mind is the greatest enemy.\" (Bhagavad Gita 6.6) - Train the mind to be your anchor.",
        "\"An unshaken self is not one that avoids the storm, but one that remains still at the center of it.\" - KETUL SHAH",
        "\"Perform your duties with dedication, but remain balanced in both success and failure. This equanimity is yoga.\" (Bhagavad Gita 2.48)"
      ];
      return { text: pick(quotes), suggestions: ["Give me another quote", "Explore a chapter", "I'm feeling stressed about work"] };
    }

    // What's the book about / synopsis
    if (q.includes("about the book") || q.includes("what is this book") || q.includes("what's this book") || q.includes("synopsis") || q.includes("summary") || q.includes("what is the book about") || q.includes("what's the book about")) {
      return { text: buildAboutBookReply(bookContent), suggestions: ["Explore a chapter", "How do I buy the book?", "Who is KETUL SHAH?"] };
    }

    // Sample / preview
    if (q.includes("sample") || q.includes("preview") || q.includes("excerpt") || q.includes("free chapter") || q.includes("read online")) {
      return { text: PREVIEW_REPLY, suggestions: ["Explore a chapter", "How do I buy the book?", "Any free resources?"] };
    }

    // Specs / ISBN
    if (q.includes("isbn") || q.includes("page count") || q.includes("how many pages") || q.includes("dimensions") || q.includes("specs")) {
      return { text: buildSpecsReply(bookContent), suggestions: ["What's the book about?", "How do I buy the book?", "Is it available outside India?"] };
    }

    // International availability
    if (q.includes("outside india") || q.includes("international") || q.includes("worldwide") || q.includes("canada") || q.includes("australia") || q.includes("united states")) {
      return { text: buildInternationalReply(settings), suggestions: ["How do I buy the book?", "What are the ISBN numbers?", "Explore a chapter"] };
    }

    // Religious / prerequisite knowledge
    if (q.includes("religious") || q.includes("dogma") || q.includes("do i need to know the gita") || q.includes("prerequisite")) {
      return { text: RELIGIOUS_REPLY, suggestions: ["Who is this book for?", "What's the book about?", "Explore a chapter"] };
    }

    // Daily practice / ritual / streak
    if (q.includes("daily practice") || q.includes("daily ritual") || q.includes("daily teaching") || q.includes("build a streak") || q.includes("streak")) {
      return { text: DAILY_PRACTICE_REPLY, suggestions: ["Explore a chapter", "Surprise me with a teaching", "Any free resources?"] };
    }

    // Quiz / where to start
    if (q.includes("quiz") || q.includes("archetype") || q.includes("where should i start") || q.includes("where do i start")) {
      return { text: QUIZ_REPLY, suggestions: ["Explore a chapter", "What's the book about?", "How do I buy the book?"] };
    }

    // Book clubs / discussion groups
    if (q.includes("book club") || q.includes("discussion questions") || q.includes("reading group")) {
      return { text: BOOKCLUB_REPLY, suggestions: ["Any free resources?", "Explore a chapter", "How do I buy the book?"] };
    }

    // Catch-all — still grounded in real, current facts (not just
    // philosophical filler) so an unmatched question doesn't leave the
    // reader without anything concrete and accurate to act on.
    return {
      text: `That's worth sitting with. A quick, real answer in the meantime: ${buildQuickFacts(settings)}\n\nYou can also ask me to "explore a chapter," tell me how you're feeling (stress, doubt, fear), or ask about the author, free resources, or events.`,
      suggestions: DEFAULT_SUGGESTIONS,
    };
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 select-none">
      {/* Floating Trigger Button — a labeled pill (icon + "Ask Ket") rather
          than a bare icon, so the bot's name is visible before anyone
          even opens it. */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="relative flex items-center gap-2 h-14 pl-2 pr-4 rounded-full bg-gradient-to-tr from-[#0B2942] to-[#AD8631] text-white shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer"
          aria-label="Open Ask Ket — Your AI Companion"
        >
          <span className="w-10 h-10 rounded-full bg-white/15 flex items-center justify-center flex-shrink-0">
            <Compass className="w-5 h-5 animate-[spin_60s_linear_infinite]" />
          </span>
          <span className="font-serif text-sm tracking-wide whitespace-nowrap">Ask Ket</span>
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white dark:border-black animate-ping" />
        </button>
      )}

      {/* Expanded Chat Box */}
      {isOpen && (
        <div className="w-[320px] sm:w-[380px] h-[500px] rounded-2xl glassmorphism border border-border-custom shadow-2xl flex flex-col overflow-hidden animate-[slideUp_0.3s_ease-out]">

          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-[#0B2942]/95 to-[#071D30]/95 text-stone-100 flex items-center justify-between border-b border-border-custom">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-[#D6A63C]/20 flex items-center justify-center text-[#D6A63C]">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-serif text-sm tracking-wide text-stone-200">Ask Ket</h3>
                <span className="text-[10px] text-stone-400 font-light">Your AI Companion</span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-full text-stone-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Tab Switcher: Chat / FAQs */}
          <div className="flex border-b border-border-custom bg-stone-50 dark:bg-[#2A3642]">
            <button
              onClick={() => setViewMode("chat")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-[10px] uppercase tracking-widest font-bold cursor-pointer transition-colors ${
                viewMode === "chat"
                  ? "text-[#D6A63C] border-b-2 border-[#D6A63C]"
                  : "text-muted-text hover:text-foreground"
              }`}
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>Chat</span>
            </button>
            <button
              onClick={() => setViewMode("faq")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-[10px] uppercase tracking-widest font-bold cursor-pointer transition-colors ${
                viewMode === "faq"
                  ? "text-[#D6A63C] border-b-2 border-[#D6A63C]"
                  : "text-muted-text hover:text-foreground"
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>FAQs</span>
            </button>
          </div>

          {/* Messages area */}
          {viewMode === "chat" ? (
            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#FAF7EF]/65 dark:bg-[#202A33]/80 no-scrollbar">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl p-3 text-xs md:text-[13px] leading-relaxed shadow-sm ${
                      msg.sender === "user"
                        ? "bg-[#0B2942] text-stone-100 rounded-tr-none"
                        : "bg-white dark:bg-[#2A3642] text-foreground border border-border-custom rounded-tl-none"
                    }`}
                  >
                    <p
                      dangerouslySetInnerHTML={{
                        __html:
                          msg.sender === "user"
                            ? renderUserText(msg.text)
                            : msg.kind === "ai"
                            ? renderAiText(msg.text)
                            : renderLocalBotText(msg.text),
                      }}
                    />
                    <span className="block text-[8px] text-right mt-1 opacity-60">
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white dark:bg-[#2A3642] text-foreground border border-border-custom rounded-2xl rounded-tl-none p-3 text-xs flex items-center space-x-1">
                    <span className="w-1.5 h-1.5 bg-muted-text rounded-full animate-bounce" />
                    <span className="w-1.5 h-1.5 bg-muted-text rounded-full animate-bounce [animation-delay:0.2s]" />
                    <span className="w-1.5 h-1.5 bg-muted-text rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              )}

              <div ref={chatEndRef} />
            </div>
          ) : (
            <div className="flex-1 p-4 overflow-y-auto space-y-2.5 bg-[#FAF7EF]/65 dark:bg-[#202A33]/80 no-scrollbar">
              {faqs.map((item, idx) => {
                const isOpenItem = openFaqIdx === idx;
                return (
                  <div
                    key={idx}
                    className="bg-white dark:bg-[#2A3642] border border-border-custom rounded-xl overflow-hidden"
                  >
                    <button
                      onClick={() => setOpenFaqIdx(isOpenItem ? null : idx)}
                      className="w-full flex items-center justify-between gap-2 p-3 text-left text-xs font-semibold text-foreground cursor-pointer"
                    >
                      <span>{item.q}</span>
                      <ChevronDown className={`w-3.5 h-3.5 flex-shrink-0 text-[#D6A63C] transition-transform duration-300 ${isOpenItem ? "rotate-180" : ""}`} />
                    </button>
                    {isOpenItem && (
                      <div className="px-3 pb-3 space-y-2.5">
                        <p
                          className="text-[11px] md:text-xs text-stone-600 dark:text-stone-300 leading-relaxed"
                          dangerouslySetInnerHTML={{
                            __html: renderLocalBotText(item.a.replace(CONTACT_EMAIL_PLACEHOLDER, contactEmail)),
                          }}
                        />
                        <a
                          href={`mailto:${contactEmail}`}
                          className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-[#D6A63C] hover:underline"
                        >
                          <Mail className="w-3 h-3" />
                          <span>Still have questions? Email {contactEmail}</span>
                        </a>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Quick Suggestions (rendered when input is empty, chat mode only) —
              horizontally scrollable, with visible arrow buttons and
              Left/Right-arrow keyboard support so every chip is reachable
              even when they overflow the chat window's width. */}
          {viewMode === "chat" && inputValue.length === 0 && (
            <div className="relative bg-stone-50 dark:bg-[#2A3642] border-t border-border-custom">
              {canScrollLeft && (
                <button
                  type="button"
                  onClick={() => scrollSuggestions(-1)}
                  aria-label="Scroll suggestions left"
                  className="absolute left-0.5 top-1/2 -translate-y-1/2 z-10 w-5 h-5 rounded-full bg-white dark:bg-[#2A3642] border border-border-custom shadow-sm flex items-center justify-center text-[#0B2942] dark:text-[#D6A63C] cursor-pointer"
                >
                  <ChevronLeft className="w-3 h-3" />
                </button>
              )}
              <div
                ref={suggestionsRef}
                onScroll={updateScrollArrows}
                tabIndex={0}
                role="list"
                aria-label="Quick suggestions, use arrow keys to scroll"
                onKeyDown={(e) => {
                  if (e.key === "ArrowRight") {
                    e.preventDefault();
                    scrollSuggestions(1);
                  } else if (e.key === "ArrowLeft") {
                    e.preventDefault();
                    scrollSuggestions(-1);
                  }
                }}
                className="px-6 py-2 overflow-x-auto whitespace-nowrap flex space-x-2 no-scrollbar scroll-smooth focus:outline-none focus-visible:ring-1 focus-visible:ring-[#D6A63C]/40 rounded"
              >
                {suggestions.map((s, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      if (s === SEARCH_WEB_LABEL) {
                        const lastUserMsg = [...messages].reverse().find((m) => m.sender === "user");
                        const query = lastUserMsg?.text || "The Unshaken Self Ketul Shah";
                        window.open(`https://www.google.com/search?q=${encodeURIComponent(query)}`, "_blank", "noopener,noreferrer");
                        return;
                      }
                      handleSend(s);
                    }}
                    className="px-2.5 py-1 rounded-full bg-white dark:bg-[#2A3642] text-foreground hover:bg-[#0B2942]/5 dark:hover:bg-[#D6A63C]/5 border border-border-custom text-[10px] cursor-pointer transition-colors flex-shrink-0"
                  >
                    {s}
                  </button>
                ))}
              </div>
              {canScrollRight && (
                <button
                  type="button"
                  onClick={() => scrollSuggestions(1)}
                  aria-label="Scroll suggestions right"
                  className="absolute right-0.5 top-1/2 -translate-y-1/2 z-10 w-5 h-5 rounded-full bg-white dark:bg-[#2A3642] border border-border-custom shadow-sm flex items-center justify-center text-[#0B2942] dark:text-[#D6A63C] cursor-pointer"
                >
                  <ChevronRight className="w-3 h-3" />
                </button>
              )}
            </div>
          )}

          {/* Input Panel */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend(inputValue);
            }}
            className="p-3 bg-white dark:bg-[#2A3642] border-t border-border-custom flex items-center space-x-2"
          >
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask me anything — the book, a chapter, or beyond..."
              className="flex-1 bg-stone-50 dark:bg-[#2A3642] text-foreground border border-border-custom rounded-full px-4 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#D6A63C]/40"
            />
            <button
              type="submit"
              disabled={!inputValue.trim()}
              className="w-8 h-8 rounded-full bg-[#0B2942] hover:bg-[#071D30] dark:bg-[#D6A63C] dark:hover:bg-[#BC9235] text-white dark:text-black flex items-center justify-center transition-colors disabled:opacity-40 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
