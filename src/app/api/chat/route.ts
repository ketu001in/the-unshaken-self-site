// Server-side chat endpoint for "Ask Ket", the site's AI companion.
//
// Runs on the server so the Groq API key never reaches the browser. The
// client sends the conversation plus a snapshot of the same live CMS/
// settings data every page already fetches (book specs, author bio,
// resources, events, pricing/buy links) — the system prompt below is
// built fresh from that on every request, so answers can never drift
// from what's actually live on the site the way a hardcoded prompt
// would. Static, non-CMS content (the 18 real chapter teachings, Gita
// trivia) is imported directly from the same lib files the rest of the
// site uses.
//
// Falls back gracefully: if GROQ_API_KEY isn't set, or the Groq call
// fails for any reason, this returns an error response and the client
// (src/components/AIChatbot.tsx) drops back to its own local,
// rule-based answer engine — the chat widget never fully breaks.

import { NextRequest, NextResponse } from "next/server";
import { WISDOM_LINES } from "@/lib/wisdomLines";
import { GITA_FACTS } from "@/lib/gitaFacts";

export const runtime = "nodejs";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";

// Keeps a single visitor from running up an unbounded bill on one
// request — generous enough for a real conversation, tight enough to
// cap worst-case token usage.
const MAX_HISTORY_MESSAGES = 12;
const MAX_MESSAGE_CHARS = 1200;

type IncomingMessage = { role: string; content: string };

type ChatContext = {
  settings?: Record<string, unknown>;
  bookSpecs?: { label: string; value: string }[];
  bookTeaser?: string;
  authorBio?: string[];
  resources?: { name: string; desc: string; isPremium: boolean }[];
  events?: { title: string; date: string; time: string; type: string }[];
};

function settingValue(settings: Record<string, unknown> | undefined, key: string): string {
  const v = settings?.[key];
  return typeof v === "string" && v.trim() ? v : "";
}

const INTERNAL_LINKS = [
  "Home: /",
  "About the Book: /about-book",
  "About the Author: /about-author",
  "Free Chapter 1 Preview: /preview",
  "Resources (free downloads): /resources",
  "Events & Workshops: /events",
  "Reader Reviews: /reviews",
  "Feedback: /feedback",
  "Buy / Pre-order: /preorder",
  "Blog: /blog",
].join("\n");

function buildSystemPrompt(context: ChatContext): string {
  const settings = context.settings ?? {};

  const chapters = WISDOM_LINES.map((w) => `${w.num}. ${w.theme} — "${w.line}"`).join("\n");
  const facts = GITA_FACTS.map((f) => `- ${f}`).join("\n");
  const specs = (context.bookSpecs ?? []).map((s) => `${s.label}: ${s.value}`).join("\n");
  const bio = (context.authorBio ?? []).join("\n\n");
  const resources = (context.resources ?? [])
    .map((r) => `- ${r.name}${r.isPremium ? " (unlocks with email on /resources)" : " (free)"}: ${r.desc}`)
    .join("\n");
  const events =
    (context.events ?? []).length > 0
      ? context.events!.map((e) => `- ${e.title} — ${e.date} ${e.time} (${e.type})`).join("\n")
      : "No events are on the calendar yet — point people to /events for updates.";

  const priceIN = `Paperback ${settingValue(settings, "price_paperback") || "N/A"}, Hardcover ${settingValue(settings, "price_hardcover") || "N/A"} (India)`;
  const priceUS = settingValue(settings, "price_paperback_us")
    ? `Paperback ${settingValue(settings, "price_paperback_us")}, Hardcover ${settingValue(settings, "price_hardcover_us")} (US)`
    : "";
  const priceCA = settingValue(settings, "price_paperback_ca")
    ? `Paperback ${settingValue(settings, "price_paperback_ca")}, Hardcover ${settingValue(settings, "price_hardcover_ca")} (Canada)`
    : "";
  const priceAU = settingValue(settings, "price_paperback_au")
    ? `Paperback ${settingValue(settings, "price_paperback_au")}, Hardcover ${settingValue(settings, "price_hardcover_au")} (Australia)`
    : "";

  const buyLinks = [
    settingValue(settings, "buy_link_amazon_paperback") && `Amazon.in Paperback: ${settingValue(settings, "buy_link_amazon_paperback")}`,
    settingValue(settings, "buy_link_amazon_hardcover") && `Amazon.in Hardcover: ${settingValue(settings, "buy_link_amazon_hardcover")}`,
    settingValue(settings, "buy_link_flipkart_paperback") && `Flipkart Paperback: ${settingValue(settings, "buy_link_flipkart_paperback")}`,
    settingValue(settings, "buy_link_flipkart_hardcover") && `Flipkart Hardcover: ${settingValue(settings, "buy_link_flipkart_hardcover")}`,
    settingValue(settings, "buy_link_notionpress_paperback") && `Notion Press Paperback: ${settingValue(settings, "buy_link_notionpress_paperback")}`,
    settingValue(settings, "buy_link_notionpress_hardcover") && `Notion Press Hardcover: ${settingValue(settings, "buy_link_notionpress_hardcover")}`,
    settingValue(settings, "buy_link_amazon_us_paperback") && `Amazon US Paperback: ${settingValue(settings, "buy_link_amazon_us_paperback")}`,
    settingValue(settings, "buy_link_amazon_us_hardcover") && `Amazon US Hardcover: ${settingValue(settings, "buy_link_amazon_us_hardcover")}`,
    settingValue(settings, "buy_link_amazon_ca_paperback") && `Amazon CA Paperback: ${settingValue(settings, "buy_link_amazon_ca_paperback")}`,
    settingValue(settings, "buy_link_amazon_ca_hardcover") && `Amazon CA Hardcover: ${settingValue(settings, "buy_link_amazon_ca_hardcover")}`,
    settingValue(settings, "buy_link_amazon_au_paperback") && `Amazon AU Paperback: ${settingValue(settings, "buy_link_amazon_au_paperback")}`,
    settingValue(settings, "buy_link_amazon_au_hardcover") && `Amazon AU Hardcover: ${settingValue(settings, "buy_link_amazon_au_hardcover")}`,
  ]
    .filter(Boolean)
    .join("\n");

  const contactEmail = settingValue(settings, "contact_email") || "info@theunshakenself.com";

  return `You are "Ask Ket" — the official AI companion on the book-launch website for *The Unshaken Self: Key Lessons from the Gita for a Life Without Doubt, Worry, and Fear* by KETUL SHAH. You're warm, direct, and genuinely helpful — a knowledgeable friend, never a corporate FAQ bot.

FORMATTING
- Respond in Markdown. Use **bold** for emphasis, "- " bullet lists when listing more than two things, and [link text](url) for links.
- Only ever link to a URL that appears in the "REAL LINKS" section below — never invent, guess, or hallucinate a URL, internal or external. If you don't have a real URL for something, mention it by name without a link.
- Keep answers conversational and concise — usually 2-5 sentences, or a short bullet list. Don't write long essays unless the visitor clearly wants depth.

REAL, CURRENT FACTS — treat everything below as ground truth; never invent book content, prices, dates, specs, or events beyond what's listed here

Book specs:
${specs || "Title: The Unshaken Self. (Full specs unavailable right now — point to /about-book.)"}

Teaser / what the book is about:
${context.bookTeaser || "A modern guide that turns the Bhagavad Gita's 18 chapters into a practical toolkit for stress, doubt, and burnout."}

Pricing:
${[priceIN, priceUS, priceCA, priceAU].filter(Boolean).join("\n")}

Where to buy (real links):
${buyLinks || "Links are being finalized — point people to /preorder."}

Author bio (real, use these facts — never invent biographical details):
${bio || "KETUL SHAH, author of The Unshaken Self. Full bio at /about-author."}

The 18 real chapter teachings (these are the book's own original teachings — quote them accurately when discussing a specific chapter; don't substitute generic Gita commentary):
${chapters}

Gita trivia (share if asked for a fun fact):
${facts}

Free resources (on /resources):
${resources || "See /resources for the current list."}

Upcoming events:
${events}

Contact: ${contactEmail}

REAL LINKS (use only these — paths starting with "/" are pages on this same site)
${INTERNAL_LINKS}

HOW TO HANDLE QUESTIONS
- Questions about the book, author, chapters, pricing, events, or this site: answer using the real facts above. If something isn't covered above, say so honestly and point to the relevant page or the contact email rather than guessing.
- Questions unrelated to the book (general knowledge, advice, how-to, math, current events, etc.): just answer helpfully and accurately, like a normal AI assistant would. Don't force a book plug into every reply — only bring the book back in if it genuinely fits.
- If you're not confident about something factual (especially anything current/time-sensitive outside the facts above), say so plainly instead of guessing.`;
}

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "AI is not configured." }, { status: 503 });
    }

    const body = await req.json().catch(() => null);
    const incoming: IncomingMessage[] = Array.isArray(body?.messages) ? body.messages : [];
    const context: ChatContext = body?.context && typeof body.context === "object" ? body.context : {};

    if (incoming.length === 0) {
      return NextResponse.json({ error: "No message provided." }, { status: 400 });
    }

    const trimmedHistory = incoming.slice(-MAX_HISTORY_MESSAGES).map((m) => ({
      role: m.role === "assistant" ? "assistant" : "user",
      content: String(m.content ?? "").slice(0, MAX_MESSAGE_CHARS),
    }));

    const groqRes = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [{ role: "system", content: buildSystemPrompt(context) }, ...trimmedHistory],
        temperature: 0.5,
        max_tokens: 600,
      }),
    });

    if (!groqRes.ok) {
      const errText = await groqRes.text().catch(() => "");
      console.error("Groq API error:", groqRes.status, errText.slice(0, 500));
      return NextResponse.json({ error: "AI request failed." }, { status: 502 });
    }

    const data = await groqRes.json();
    const reply = data?.choices?.[0]?.message?.content?.trim?.();

    if (!reply) {
      return NextResponse.json({ error: "Empty AI response." }, { status: 502 });
    }

    return NextResponse.json({ reply });
  } catch (err) {
    console.error("Chat API error:", err);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
