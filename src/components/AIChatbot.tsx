"use client";

import React, { useState, useEffect, useRef } from "react";
import { X, Send, Sparkles, Compass, HelpCircle, MessageCircle, ChevronDown, Mail } from "lucide-react";

type Message = {
  id: string;
  sender: "user" | "bot";
  text: string;
  timestamp: Date;
};

const CONTACT_EMAIL = "ketu001in@gmail.com";

const faqs: { q: string; a: string }[] = [
  {
    q: "When will the book launch?",
    a: "The Unshaken Self is planned to launch on the eve of Krishna Janmashtami, September 4, 2026. Join the pre-order waitlist to get notified the moment it goes live."
  },
  {
    q: "How much will the book cost?",
    a: "Final pricing hasn't been confirmed yet. The Pre-Order page shows indicative prices in INR (with an option to view other currencies) — we'll update it the moment official pricing is set."
  },
  {
    q: "What formats will be available?",
    a: "Hardcover, paperback, Kindle, and audiobook editions are planned, available through Amazon, Flipkart, and directly through the publisher."
  },
  {
    q: "Can I read a free sample?",
    a: "Yes — the Chapter 1 preview and a printable sample PDF (including the Three-Breath Pause practice and a reflection worksheet) are available on the Preview page."
  },
  {
    q: "Who is this book for?",
    a: "It's written for anyone facing stress, burnout, or uncertainty who wants a practical, non-dogmatic guide rooted in the Bhagavad Gita. See the About the Book page for who should — and shouldn't — read it."
  },
  {
    q: "How do I contact KETUL SHAH directly?",
    a: `You can reach out anytime at ${CONTACT_EMAIL} — Ketul personally reads every message.`
  },
];

export default function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [viewMode, setViewMode] = useState<"chat" | "faq">("chat");
  const [openFaqIdx, setOpenFaqIdx] = useState<number | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Initialize with a welcome message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: "welcome",
          sender: "bot",
          text: "Pranam! I am your Gita Companion, here to guide you through KETUL SHAH's upcoming book, *The Unshaken Self*. How can I help you find focus, clarity, or peace today?",
          timestamp: new Date(),
        },
      ]);
    }
  }, [messages.length]);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSend = (text: string) => {
    if (!text.trim()) return;

    setViewMode("chat");

    // Add user message
    const userMsg: Message = {
      id: Math.random().toString(),
      sender: "user",
      text,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");
    setIsTyping(true);

    // Simulate bot response
    setTimeout(() => {
      const response = getBotResponse(text);
      const botMsg: Message = {
        id: Math.random().toString(),
        sender: "bot",
        text: response,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);
    }, 1200);
  };

  const getBotResponse = (query: string): string => {
    const q = query.toLowerCase();
    
    // Keyword Matching Rules
    if (q.includes("stress") || q.includes("work") || q.includes("burnout") || q.includes("pressure")) {
      return "In *The Unshaken Self*, KETUL SHAH discusses Chapter 3 of the Gita (*Karma Yoga*: The Path of Action). True freedom from work stress comes when we perform our actions with complete sincerity and focus, but release our obsession with the final outcome. In daily terms: do the work for the sake of the craft itself, and your anxiety will dissolve.";
    }
    
    if (q.includes("anxiety") || q.includes("worry") || q.includes("fear") || q.includes("afraid") || q.includes("doubt")) {
      return "Chapter 2 of *The Unshaken Self* explains how doubt and fear destabilize the mind. KETUL SHAH teaches that your true, core self is eternal and untouched by external storms. To cultivate an unshaken mind, start with the '5-Minute Anchor'—each morning, close your eyes, witness your thoughts without judgment, and remind yourself: 'I am the observer, not the storm.'";
    }
    
    if (q.includes("chapter") || q.includes("gita") || q.includes("18") || q.includes("lessons")) {
      return "The Bhagavad Gita consists of 18 chapters, and *The Unshaken Self* translates each into a practical modern blueprint. For example: Chapter 2 teaches mental stability (Sthitaprajna), Chapter 6 teaches self-mastery through meditation, and Chapter 12 explores devotion and acceptance. Each section in the book concludes with modern exercises like 'Detached Goal Setting' or 'Breath Anchors'.";
    }
    
    if (q.includes("ketul") || q.includes("shah") || q.includes("author") || q.includes("who is")) {
      return "KETUL SHAH is a contemporary spiritual researcher and author dedicated to making ancient wisdom practical for modern professionals. Having spent years studying Vedic scriptures and modern psychology, Ketul wrote *The Unshaken Self* to help people navigate the chaos of the 21st century with the calm, focused mind of a yogi.";
    }

    if (q.includes("preorder") || q.includes("buy") || q.includes("price") || q.includes("purchase") || q.includes("get")) {
      return "You can preorder *The Unshaken Self* on our preorder page! Pre-orders will launch soon on Amazon, Flipkart, and directly through our publisher, offering exclusive access to worksheets, audiobook pre-reads, and a live Q&A session with KETUL SHAH.";
    }

    if (q.includes("quote") || q.includes("wisdom") || q.includes("inspiration")) {
      const quotes = [
        "\"You have a right to perform your prescribed duty, but you are not entitled to the fruits of action.\" (Bhagavad Gita 2.47) - Focus on the effort, release the reward.",
        "\"For the wise, the mind is the greatest friend; but for the undisciplined, the mind is the greatest enemy.\" (Bhagavad Gita 6.6) - Train the mind to be your anchor.",
        "\"An unshaken self is not one that avoids the storm, but one that remains still at the center of it.\" - KETUL SHAH",
        "\"Perform your duties with dedication, but remain balanced in both success and failure. This equanimity is yoga.\" (Bhagavad Gita 2.48)"
      ];
      return quotes[Math.floor(Math.random() * quotes.length)];
    }

    return "That is a profound question. *The Unshaken Self* emphasizes that clarity resides within. When you face doubt, stop, take a slow breath, and perform your next action with absolute presence. Is there a specific challenge (like stress, decision-making, or focus) you'd like to reflect on using the Gita's wisdom?";
  };

  const suggestions = [
    "How do I manage work stress?",
    "Tell me about the 18 Chapters",
    "Give me a wisdom quote",
    "Who is KETUL SHAH?",
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50 select-none">
      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 rounded-full bg-gradient-to-tr from-[#1e3f20] to-[#b5924b] text-white flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all duration-300 cursor-pointer"
          aria-label="Open Gita Companion Bot"
        >
          <Compass className="w-6 h-6 animate-[spin_60s_linear_infinite]" />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white dark:border-black animate-ping" />
        </button>
      )}

      {/* Expanded Chat Box */}
      {isOpen && (
        <div className="w-[320px] sm:w-[380px] h-[500px] rounded-2xl glassmorphism border border-border-custom shadow-2xl flex flex-col overflow-hidden animate-[slideUp_0.3s_ease-out]">
          
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-[#1e3f20]/95 to-[#122815]/95 text-stone-100 flex items-center justify-between border-b border-border-custom">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-[#dfb15b]/20 flex items-center justify-center text-[#dfb15b]">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-serif text-sm tracking-wide text-stone-200">Gita Companion</h3>
                <span className="text-[10px] text-stone-400 font-light">The Unshaken Self Assistant</span>
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
          <div className="flex border-b border-border-custom bg-stone-50 dark:bg-[#080d0b]">
            <button
              onClick={() => setViewMode("chat")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-[10px] uppercase tracking-widest font-bold cursor-pointer transition-colors ${
                viewMode === "chat"
                  ? "text-[#dfb15b] border-b-2 border-[#dfb15b]"
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
                  ? "text-[#dfb15b] border-b-2 border-[#dfb15b]"
                  : "text-muted-text hover:text-foreground"
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>FAQs</span>
            </button>
          </div>

          {/* Messages area */}
          {viewMode === "chat" ? (
            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#faf8f5]/65 dark:bg-[#070b09]/80 no-scrollbar">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl p-3 text-xs md:text-[13px] leading-relaxed shadow-sm ${
                      msg.sender === "user"
                        ? "bg-[#1e3f20] text-stone-100 rounded-tr-none"
                        : "bg-white dark:bg-[#121c19] text-foreground border border-border-custom rounded-tl-none"
                    }`}
                  >
                    <p dangerouslySetInnerHTML={{ __html: msg.text.replace(/\*(.*?)\*/g, "<strong>$1</strong>") }} />
                    <span className="block text-[8px] text-right mt-1 opacity-60">
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white dark:bg-[#121c19] text-foreground border border-border-custom rounded-2xl rounded-tl-none p-3 text-xs flex items-center space-x-1">
                    <span className="w-1.5 h-1.5 bg-muted-text rounded-full animate-bounce" />
                    <span className="w-1.5 h-1.5 bg-muted-text rounded-full animate-bounce [animation-delay:0.2s]" />
                    <span className="w-1.5 h-1.5 bg-muted-text rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              )}

              <div ref={chatEndRef} />
            </div>
          ) : (
            <div className="flex-1 p-4 overflow-y-auto space-y-2.5 bg-[#faf8f5]/65 dark:bg-[#070b09]/80 no-scrollbar">
              {faqs.map((item, idx) => {
                const isOpenItem = openFaqIdx === idx;
                return (
                  <div
                    key={idx}
                    className="bg-white dark:bg-[#121c19] border border-border-custom rounded-xl overflow-hidden"
                  >
                    <button
                      onClick={() => setOpenFaqIdx(isOpenItem ? null : idx)}
                      className="w-full flex items-center justify-between gap-2 p-3 text-left text-xs font-semibold text-foreground cursor-pointer"
                    >
                      <span>{item.q}</span>
                      <ChevronDown className={`w-3.5 h-3.5 flex-shrink-0 text-[#dfb15b] transition-transform duration-300 ${isOpenItem ? "rotate-180" : ""}`} />
                    </button>
                    {isOpenItem && (
                      <div className="px-3 pb-3 space-y-2.5">
                        <p className="text-[11px] md:text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                          {item.a}
                        </p>
                        <a
                          href={`mailto:${CONTACT_EMAIL}`}
                          className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-[#dfb15b] hover:underline"
                        >
                          <Mail className="w-3 h-3" />
                          <span>Still have questions? Email {CONTACT_EMAIL}</span>
                        </a>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Quick Suggestions (rendered when input is empty, chat mode only) */}
          {viewMode === "chat" && inputValue.length === 0 && (
            <div className="px-4 py-2 bg-stone-50 dark:bg-[#080d0b] border-t border-border-custom overflow-x-auto whitespace-nowrap flex space-x-2 no-scrollbar">
              {suggestions.map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(s)}
                  className="px-2.5 py-1 rounded-full bg-white dark:bg-[#121c19] text-foreground hover:bg-[#1e3f20]/5 dark:hover:bg-[#dfb15b]/5 border border-border-custom text-[10px] cursor-pointer transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Input Panel */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend(inputValue);
            }}
            className="p-3 bg-white dark:bg-[#101614] border-t border-border-custom flex items-center space-x-2"
          >
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask about stress, chapters, or pre-orders..."
              className="flex-1 bg-stone-50 dark:bg-[#080d0b] text-foreground border border-border-custom rounded-full px-4 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#dfb15b]/40"
            />
            <button
              type="submit"
              disabled={!inputValue.trim()}
              className="w-8 h-8 rounded-full bg-[#1e3f20] hover:bg-[#142a15] dark:bg-[#dfb15b] dark:hover:bg-[#c49945] text-white dark:text-black flex items-center justify-center transition-colors disabled:opacity-40 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
