"use client";

import React, { createContext, useContext, useState } from "react";

type Theme = "light" | "dark";

type ThemeContextType = {
  theme: Theme;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Always starts Light — every fresh visit (a new link click, a reload, a
  // new tab) opens in Light regardless of what a browser previously had
  // saved or what the OS's system theme is set to. Dark is still available
  // via the toggle, but that choice is intentionally in-memory only for
  // the current page view and is never persisted or read back on load —
  // otherwise a visitor who once switched to dark (or whose OS is dark)
  // would keep landing on a dark page on every future visit.
  const [theme, setTheme] = useState<Theme>("light");

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
