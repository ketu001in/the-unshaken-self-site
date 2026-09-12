"use client";

import { useSound } from "@/context/SoundContext";
import { Volume2, VolumeX } from "lucide-react";
import { useEffect, useState } from "react";

export default function SoundToggle() {
  const { soundEnabled, toggleSound } = useSound();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch by waiting until mounted (same pattern as
  // ThemeToggle) — the real value only exists client-side (localStorage).
  useEffect(() => {
    // Same hydration-guard pattern as ThemeToggle — real value only exists
    // client-side, so this one-time mount flag is intentional.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="w-9 h-9 rounded-full bg-transparent" />;
  }

  return (
    <button
      onClick={toggleSound}
      className="p-2 rounded-full cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-colors focus:outline-none focus:ring-2 focus:ring-accent/40"
      aria-label={soundEnabled ? "Mute Site Sound" : "Unmute Site Sound"}
      aria-pressed={soundEnabled}
      title={soundEnabled ? "Sound on" : "Sound off"}
    >
      {soundEnabled ? (
        <Volume2 className="w-5 h-5 text-primary transition-transform duration-300" />
      ) : (
        <VolumeX className="w-5 h-5 text-muted-text transition-transform duration-300" />
      )}
    </button>
  );
}
