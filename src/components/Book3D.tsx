"use client";

import React, { useEffect, useRef, useState } from "react";
import { Plus, X } from "lucide-react";

const THICKNESS = 22; // px — spine/page-edge depth, independent of the front-face size

export default function Book3D({ coverImageUrl }: { coverImageUrl?: string | null }) {
  const [hovered, setHovered] = useState(false);
  const [tilt, setTilt] = useState({ x: 2, y: -8 });
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const cover = coverImageUrl || "/book-cover-front.jpg";

  const BASE_TILT = { x: 2, y: -8 };
  const MAX_TILT = 22;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const relX = (e.clientX - rect.left) / rect.width; // 0..1
    const relY = (e.clientY - rect.top) / rect.height; // 0..1
    const rotateY = BASE_TILT.y + (relX - 0.5) * MAX_TILT * 2;
    const rotateX = BASE_TILT.x - (relY - 0.5) * MAX_TILT;
    setTilt({ x: rotateX, y: rotateY });
  };

  const handleMouseEnter = () => setHovered(true);
  const handleMouseLeave = () => {
    setHovered(false);
    setTilt(BASE_TILT);
  };

  // Close lightbox on Escape
  useEffect(() => {
    if (!lightboxOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightboxOpen]);

  return (
    <>
      <div className="flex flex-col items-center justify-center select-none">
        <div
          ref={containerRef}
          onMouseEnter={handleMouseEnter}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="relative w-[240px] h-[360px] md:w-[280px] md:h-[420px] cursor-pointer group"
          style={{ perspective: "1400px" }}
        >
          {/* The 3D book box: front cover, spine, page-edge, back cover */}
          <div
            className="relative w-full h-full"
            style={{
              transformStyle: "preserve-3d",
              transition: hovered
                ? "transform 0.08s linear"
                : "transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
              transform: `rotateY(${tilt.y}deg) rotateX(${tilt.x}deg)`,
              filter: hovered
                ? "drop-shadow(28px 32px 45px rgba(0,0,0,0.35))"
                : "drop-shadow(16px 18px 28px rgba(0,0,0,0.22))",
            }}
          >
            {/* Back cover — dark, sits behind everything */}
            <div
              className="absolute inset-0 rounded-sm bg-[#1a1410]"
              style={{ transform: `translateZ(-${THICKNESS / 2}px) rotateY(180deg)` }}
            />

            {/* Spine — hinged at the left edge, sweeps back into depth */}
            <div
              className="absolute inset-y-0 left-0 rounded-l-sm bg-gradient-to-b from-[#2a1f16] via-[#1e1610] to-[#150f0a]"
              style={{
                width: `${THICKNESS}px`,
                transformOrigin: "left center",
                transform: "rotateY(-90deg)",
              }}
            />

            {/* Page edge — hinged at the right edge, off-white striped "pages" */}
            <div
              className="absolute inset-y-0 right-0 rounded-r-sm"
              style={{
                width: `${THICKNESS}px`,
                transformOrigin: "right center",
                transform: "rotateY(90deg)",
                background:
                  "repeating-linear-gradient(to bottom, #f4ecd8 0px, #f4ecd8 2px, #e2d6b8 2px, #e2d6b8 3px)",
              }}
            />

            {/* Front cover */}
            <div
              className="absolute inset-0 rounded-sm overflow-hidden border border-white/10 bg-cover bg-center"
              style={{
                backgroundImage: `url('${cover}')`,
                transform: `translateZ(${THICKNESS / 2}px)`,
              }}
            >
              {/* Sheen sweep — moves diagonally on hover */}
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

          {/* "+" zoom affordance — fades in on hover, sits above the 3D transform */}
          <button
            type="button"
            aria-label="View full cover"
            onClick={(e) => {
              e.stopPropagation();
              setLightboxOpen(true);
            }}
            className={`absolute bottom-3 right-3 z-10 w-10 h-10 rounded-full bg-black/60 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white transition-all duration-300 hover:bg-black/80 hover:scale-110 cursor-pointer ${
              hovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1 pointer-events-none"
            }`}
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Lightbox */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-sm p-6 animate-[fadeIn_0.2s_ease-out]"
          onClick={() => setLightboxOpen(false)}
        >
          <button
            type="button"
            aria-label="Close"
            onClick={() => setLightboxOpen(false)}
            className="absolute top-5 right-5 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element -- lightbox needs a plain, unconstrained img for arbitrary uploaded cover URLs */}
          <img
            src={cover}
            alt="Full book cover"
            onClick={(e) => e.stopPropagation()}
            className="max-h-[85vh] max-w-[90vw] object-contain rounded-md shadow-2xl animate-[zoomIn_0.25s_cubic-bezier(0.16,1,0.3,1)]"
          />
        </div>
      )}
    </>
  );
}
