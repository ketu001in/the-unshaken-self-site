"use client";

import { useTheme } from "@/context/ThemeContext";
import { Sun, Moon } from "lucide-react";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch by waiting until mounted
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="w-9 h-9 rounded-full bg-transparent" />;
  }

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-full cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-colors focus:outline-none focus:ring-2 focus:ring-accent/40"
      aria-label="Toggle Theme Mode"
    >
      {theme === "dark" ? (
        <Sun className="w-5 h-5 text-primary hover:rotate-45 transition-transform duration-300" />
      ) : (
        <Moon className="w-5 h-5 text-primary hover:-rotate-12 transition-transform duration-300" />
      )}
    </button>
  );
}
