"use client";

import React, { useState } from "react";
import Link from "next/link";
import { BookOpen, Send } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useSiteSettings } from "@/context/SiteSettingsContext";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [error, setError] = useState("");
  const { settings } = useSiteSettings();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setError("");

    const supabase = createClient();
    const { error: dbError } = await supabase
      .from("subscribers")
      .insert({ email: email.trim(), source: "Footer Newsletter" });

    if (dbError && !dbError.message.includes("duplicate")) {
      setError("Something went wrong. Please try again.");
      return;
    }

    setEmail("");
    setSubscribed(true);
    setTimeout(() => setSubscribed(false), 5000);
  };

  const footerLinks = {
    book: [
      { name: "About the Book", href: "/about-book" },
      { name: "First Chapter Preview", href: "/preview" },
      { name: "Reader & Press Reviews", href: "/reviews" },
      { name: "Bonus Resources", href: "/resources" },
    ],
    author: [
      { name: "About KETUL SHAH", href: "/about-author" },
      { name: "Media Kit Assets", href: "/about-author#media-kit" },
      { name: "Events & Workshops", href: "/events" },
      { name: "Read the Blog", href: "/blog" },
    ],
    legal: [
      { name: "Admin Dashboard", href: "/admin" },
      { name: "Privacy Policy", href: "/privacy" },
      { name: "Terms of Service", href: "/terms" },
    ]
  };

  return (
    <footer className="bg-white dark:bg-[#050806] border-t border-border-custom pt-16 pb-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-8 pb-12 border-b border-border-custom">
          
          {/* Logo & Description */}
          <div className="lg:col-span-2 space-y-6">
            <Link href="/" className="flex items-center space-x-2 text-primary uppercase font-serif tracking-widest text-lg">
              <BookOpen className="w-5 h-5 text-[#dfb15b]" />
              <span className="font-semibold text-foreground">The Unshaken Self</span>
            </Link>
            <p className="text-stone-500 dark:text-stone-400 text-xs md:text-sm font-light leading-relaxed max-w-sm">
              {settings.footer_tagline}
            </p>
            {/* Social Media Links */}
            <div className="flex space-x-4">
              {[
                {
                  icon: (
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                  ),
                  href: settings.social_linkedin,
                  label: "LinkedIn"
                },
                {
                  icon: (
                    <svg className="w-4 h-4 fill-none stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                      <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
                    </svg>
                  ),
                  href: settings.social_instagram,
                  label: "Instagram: @TheUnshakenselfbyketulshah"
                }
              ].map((social, idx) => (
                <a
                  key={idx}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full border border-border-custom flex items-center justify-center text-muted-text hover:text-[#dfb15b] hover:border-[#dfb15b] transition-all cursor-pointer"
                  aria-label={social.label}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links Sections */}
          <div>
            <h4 className="font-serif text-xs tracking-[0.2em] uppercase text-foreground mb-6 font-semibold">
              The Book
            </h4>
            <ul className="space-y-4">
              {footerLinks.book.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-stone-500 dark:text-stone-400 hover:text-primary transition-colors text-xs tracking-wider">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-serif text-xs tracking-[0.2em] uppercase text-foreground mb-6 font-semibold">
              The Author
            </h4>
            <ul className="space-y-4">
              {footerLinks.author.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-stone-500 dark:text-stone-400 hover:text-primary transition-colors text-xs tracking-wider">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter Panel */}
          <div>
            <h4 className="font-serif text-xs tracking-[0.2em] uppercase text-foreground mb-6 font-semibold">
              Newsletter
            </h4>
            <p className="text-stone-500 dark:text-stone-400 text-[11px] font-light mb-4 leading-relaxed">
              Subscribe for early chapters, release reminders, and Gita reflections directly from Ketul Shah.
            </p>
            <form onSubmit={handleSubmit} className="flex flex-col space-y-2">
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your Email"
                  className="w-full text-xs bg-stone-50 dark:bg-[#070b09] border border-border-custom rounded-full px-4 py-2.5 pr-10 focus:outline-none focus:ring-1 focus:ring-[#dfb15b]/40"
                  required
                />
                <button
                  type="submit"
                  className="absolute right-1 top-1 w-8 h-8 rounded-full bg-[#1e3f20] dark:bg-[#dfb15b] text-white dark:text-black flex items-center justify-center cursor-pointer hover:opacity-90 transition-opacity"
                  aria-label="Submit Email Subscription"
                >
                  <Send className="w-3 h-3" />
                </button>
              </div>
              {subscribed && (
                <p className="text-[10px] text-green-600 dark:text-green-400 italic">
                  Thank you! You are now subscribed.
                </p>
              )}
              {error && (
                <p className="text-[10px] text-red-500 italic">{error}</p>
              )}
            </form>
            
            {/* Admin & Legal links list */}
            <div className="mt-8 pt-4 border-t border-border-custom/50">
              <ul className="space-y-3">
                {footerLinks.legal.map((link) => (
                  <li key={link.name}>
                    <Link href={link.href} className="text-stone-500 dark:text-stone-400 hover:text-primary transition-colors text-[10px] tracking-wider uppercase font-mono">
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

        </div>

        {/* Lower Footer */}
        <div className="flex flex-col sm:flex-row justify-between items-center pt-8 text-stone-500 dark:text-stone-400 text-[10px] font-mono tracking-widest gap-4">
          <p>© 2026 KETUL SHAH. ALL RIGHTS RESERVED.</p>
          <div className="flex space-x-6">
            <Link href="/privacy" className="hover:text-primary transition-colors">PRIVACY POLICY</Link>
            <Link href="/terms" className="hover:text-primary transition-colors">TERMS OF SERVICE</Link>
          </div>
        </div>

      </div>
    </footer>
  );
}
