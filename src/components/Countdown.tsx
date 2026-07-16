"use client";

import React, { useEffect, useState } from "react";

type TimeLeft = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

export default function Countdown() {
  const targetDate = new Date("2026-09-04T00:00:00").getTime();
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    
    const calculateTimeLeft = () => {
      const difference = targetDate - Date.now();
      
      if (difference <= 0) {
        return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      }

      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    };

    setTimeLeft(calculateTimeLeft());
    
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  if (!isMounted) {
    return (
      <div className="flex justify-center space-x-4 md:space-x-8 opacity-50">
        {["Days", "Hours", "Minutes", "Seconds"].map((label, idx) => (
          <div key={idx} className="flex flex-col items-center">
            <div className="text-3xl md:text-5xl font-serif text-primary">--</div>
            <div className="text-[10px] md:text-xs uppercase tracking-widest text-muted-text mt-1">{label}</div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      {/* Timer Grid */}
      <div className="flex justify-center space-x-4 md:space-x-8 select-none">
        {[
          { label: "Days", value: timeLeft.days },
          { label: "Hours", value: timeLeft.hours },
          { label: "Minutes", value: timeLeft.minutes },
          { label: "Seconds", value: timeLeft.seconds },
        ].map((item, idx) => (
          <div key={idx} className="flex flex-col items-center relative">
            <div className="glassmorphism w-16 h-20 md:w-24 md:h-28 rounded-lg flex items-center justify-center border border-border-custom shadow-lg">
              <span className="text-3xl md:text-5xl font-serif text-[#dfb15b] font-medium tracking-tight">
                {String(item.value).padStart(2, "0")}
              </span>
            </div>
            
            {/* Small Label below Card */}
            <span className="text-[10px] md:text-xs uppercase tracking-[0.2em] text-muted-text mt-2 font-medium">
              {item.label}
            </span>

            {/* Separator dots (except last) */}
            {idx < 3 && (
              <div className="hidden sm:flex absolute -right-3 md:-right-5 top-1/3 text-primary text-xl font-bold opacity-30 select-none animate-pulse">
                :
              </div>
            )}
          </div>
        ))}
      </div>
      
      {/* Subtitle / Focus message */}
      <p className="mt-8 text-center text-xs md:text-sm text-stone-400 font-light max-w-md tracking-wider">
        Launching on the auspicious eve of <span className="text-[#dfb15b] font-medium">Krishna Janmashtami 2026</span>
      </p>
    </div>
  );
}
