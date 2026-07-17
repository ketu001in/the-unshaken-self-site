"use client";

import React, { useState } from "react";

export default function Book3D({ coverImageUrl }: { coverImageUrl?: string | null }) {
  const [hovered, setHovered] = useState(false);
  const cover = coverImageUrl || "/book-cover-front.jpg";

  return (
    <div className="flex flex-col items-center justify-center select-none">
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="relative w-[240px] h-[360px] md:w-[280px] md:h-[420px] cursor-default"
        style={{ perspective: "1200px" }}
      >
        <div
          className="relative w-full h-full rounded-md overflow-hidden border border-white/10"
          style={{
            transformStyle: "preserve-3d",
            transition: "transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.5s ease",
            transform: hovered
              ? "rotateY(-14deg) rotateX(3deg) translateY(-8px) scale(1.02)"
              : "rotateY(-8deg) rotateX(2deg)",
            boxShadow: hovered
              ? "30px 30px 55px rgba(0,0,0,0.35)"
              : "18px 18px 35px rgba(0,0,0,0.22)",
          }}
        >
          {/* Front Cover */}
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url('${cover}')` }}
          />

          {/* Spine shadow for a touch of depth (static, no animation) */}
          <div className="absolute inset-y-0 left-0 w-3 bg-gradient-to-r from-black/35 via-black/10 to-transparent pointer-events-none" />

          {/* Sheen sweep — only moves on hover */}
          <div
            className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/15 to-transparent pointer-events-none transition-transform duration-700 ease-out"
            style={{
              transform: hovered
                ? "translateX(120%) skewX(-20deg)"
                : "translateX(-120%) skewX(-20deg)",
            }}
          />
        </div>
      </div>
    </div>
  );
}
