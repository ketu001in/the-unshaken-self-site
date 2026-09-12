"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { setSoundEnabled, playClick } from "@/lib/sound";

type SoundContextType = {
  soundEnabled: boolean;
  toggleSound: () => void;
};

const SoundContext = createContext<SoundContextType | undefined>(undefined);

const STORAGE_KEY = "unshaken-sound-enabled";

export function SoundProvider({ children }: { children: React.ReactNode }) {
  // Sound defaults ON (unlike Theme, which always resets to Light) — the
  // visitor asked for a mute toggle, which only makes sense if sound is on
  // by default and their choice to mute persists across visits.
  const [soundEnabled, setSoundEnabledState] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Intentional one-time sync from localStorage on mount (same pattern as
    // ThemeToggle's hydration guard) — not a cascading-render risk here.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved !== null) {
        const value = saved === "true";
        setSoundEnabledState(value);
        setSoundEnabled(value);
        return;
      }
    } catch {
      // localStorage unavailable (private mode, etc.) — fall back to the
      // in-memory default of "on" for this page view.
    }
    setSoundEnabled(true);
  }, []);

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabledState(next);
    setSoundEnabled(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, String(next));
    } catch {
      // Ignore write failures — the choice still applies for this page view.
    }
    // Give immediate feedback that sound just turned back on; muting stays
    // silent by definition.
    if (next) playClick();
  };

  // Keep the module-level engine flag correct even if something else in
  // the tree flips soundEnabled before this effect's first run finishes.
  useEffect(() => {
    if (mounted) setSoundEnabled(soundEnabled);
  }, [soundEnabled, mounted]);

  return (
    <SoundContext.Provider value={{ soundEnabled, toggleSound }}>
      {children}
    </SoundContext.Provider>
  );
}

export function useSound() {
  const context = useContext(SoundContext);
  if (!context) {
    throw new Error("useSound must be used within a SoundProvider");
  }
  return context;
}
