"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { fetchSiteSettings } from "@/lib/content";

export type ThemeColors = {
  primary: string;
  accent: string;
  primary_dark: string;
  accent_dark: string;
};

export type SectionVisibility = {
  show_launch_banner: boolean;
  show_testimonials: boolean;
};

export type SiteSettings = {
  contact_email: string;
  social_linkedin: string;
  social_instagram: string;
  footer_tagline: string;
  author_photo_url: string | null;
  book_cover_front_url: string | null;
  book_cover_wrap_url: string | null;
  book_cover_spine_pct: number;
  book_cover_back_pct: number;
  book_cover_layout: "back-spine-front" | "front-spine-back";
  trailer_video_url: string | null;
  trailer_thumbnail_url: string | null;
  media_kit_portrait_url: string | null;
  media_kit_cover_kit_url: string | null;
  media_kit_press_release_url: string | null;
  media_kit_bio_url: string | null;
  sample_pdf_url: string | null;
  theme_colors: ThemeColors;
  section_visibility: SectionVisibility;
  // Book is live — three platforms (Amazon, Flipkart, and Notion Press,
  // the author's own recommended store), each in Paperback and Hardcover.
  // Price is the same across platforms for a given format, so it's
  // tracked once per format rather than once per link.
  buy_link_amazon_paperback: string | null;
  buy_link_amazon_hardcover: string | null;
  buy_link_flipkart_paperback: string | null;
  buy_link_flipkart_hardcover: string | null;
  buy_link_notionpress_paperback: string | null;
  buy_link_notionpress_hardcover: string | null;
  price_paperback: string;
  price_hardcover: string;
  publisher_name: string;
  // "Ask Ketul" live session — blank datetime means "coming soon" in the
  // banner rather than exposing an empty/broken join link.
  live_session_title: string;
  live_session_datetime: string;
  live_session_link: string;
};

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  contact_email: "ketu001in@gmail.com",
  social_linkedin: "https://www.linkedin.com/in/ketu001in",
  social_instagram: "https://instagram.com/TheUnshakenselfbyketulshah",
  footer_tagline:
    "An upcoming literary launch translating the timeless 18 chapters of the Bhagavad Gita into practical mental models for navigating modern anxiety, pressure, and uncertainty.",
  author_photo_url: null,
  book_cover_front_url: null,
  book_cover_wrap_url: null,
  book_cover_spine_pct: 8,
  book_cover_back_pct: 46,
  book_cover_layout: "back-spine-front",
  trailer_video_url: null,
  trailer_thumbnail_url: null,
  media_kit_portrait_url: null,
  media_kit_cover_kit_url: null,
  media_kit_press_release_url: null,
  media_kit_bio_url: null,
  sample_pdf_url: null,
  theme_colors: {
    primary: "#0f2b48",
    accent: "#e5b453",
    primary_dark: "#e5b453",
    accent_dark: "#3182ce",
  },
  section_visibility: {
    show_launch_banner: true,
    show_testimonials: true,
  },
  buy_link_amazon_paperback: "https://www.amazon.in/dp/B0HHNKF7FQ",
  buy_link_amazon_hardcover: "https://www.amazon.in/dp/B0HHNW1DJH",
  buy_link_flipkart_paperback: "https://www.flipkart.com/the-unshaken-self/p/itm1004d27433425?pid=9798906961297&affid=editornoti",
  buy_link_flipkart_hardcover: "https://www.flipkart.com/unshaken-self-wisdom-gita-life-without-doubt-worry-fear/p/itm1004d27433425?pid=9798906961303&affid=editornoti",
  buy_link_notionpress_paperback: "https://direct.notionpress.com/in/read/the-unshaken-self/paperback",
  buy_link_notionpress_hardcover: "https://direct.notionpress.com/in/read/the-unshaken-self-hardcover/hardcover",
  price_paperback: "₹499",
  price_hardcover: "₹575",
  publisher_name: "Clever Fox Publishers, India",
  live_session_title: "Ask Ketul — Live Q&A",
  live_session_datetime: "",
  live_session_link: "",
};

type SiteSettingsContextType = {
  settings: SiteSettings;
  loading: boolean;
  refresh: () => Promise<void>;
};

const SiteSettingsContext = createContext<SiteSettingsContextType | undefined>(undefined);

function applyThemeColors(colors: ThemeColors) {
  if (typeof document === "undefined") return;
  let styleTag = document.getElementById("theme-overrides") as HTMLStyleElement | null;
  if (!styleTag) {
    styleTag = document.createElement("style");
    styleTag.id = "theme-overrides";
    document.head.appendChild(styleTag);
  }
  styleTag.textContent = `
    :root { --primary: ${colors.primary}; --accent: ${colors.accent}; }
    .dark { --primary: ${colors.primary_dark}; --accent: ${colors.accent_dark}; }
  `;
}

export function SiteSettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    const data = await fetchSiteSettings(DEFAULT_SITE_SETTINGS);
    setSettings(data);
    applyThemeColors(data.theme_colors);
    setLoading(false);
  };

  useEffect(() => {
    refresh();
  }, []);

  return (
    <SiteSettingsContext.Provider value={{ settings, loading, refresh }}>
      {children}
    </SiteSettingsContext.Provider>
  );
}

export function useSiteSettings() {
  const ctx = useContext(SiteSettingsContext);
  if (!ctx) throw new Error("useSiteSettings must be used within a SiteSettingsProvider");
  return ctx;
}
