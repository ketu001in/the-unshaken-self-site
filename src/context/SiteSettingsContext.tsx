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
  show_countdown: boolean;
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
    show_countdown: true,
    show_testimonials: true,
  },
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
