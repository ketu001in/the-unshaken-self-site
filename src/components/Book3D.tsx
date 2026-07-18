"use client";

import React, { useEffect, useRef, useState } from "react";
import { Plus, X } from "lucide-react";
import { getCoverSliceStyle, DEFAULT_COVER_PROPORTIONS, type CoverLayout } from "@/lib/coverSlices";

const THICKNESS = 22; // px — spine/page-edge depth, independent of the front-face size
const BASE_TILT = { x: 2, y: -8 };
const PARALLAX_MAX = 18;
const DRAG_SENSITIVITY = 0.5;
const DRAG_CLAMP_Y = 100; // degrees — generous, so a full drag can swing round to the back
const DRAG_CLAMP_X = 28;

type Book3DProps = {
  /** Legacy single front-only image — used as a fallback when no wrap image is set. */
  coverImageUrl?: string | null;
  /** Full wraparound cover: back cover + spine + front cover in one image. */
  wrapUrl?: string | null;
  spinePct?: number;
  backPct?: number;
  layout?: CoverLayout;
};

export default function Book3D({ coverImageUrl, wrapUrl, spinePct, backPct, layout }: Book3DProps) {
  const [hovered, setHovered] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [rotation, setRotation] = useState(BASE_TILT);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const dragStartRotation = useRef(BASE_TILT);
  const hasDraggedRef = useRef(false);

  const proportions = {
    spinePct: spinePct ?? DEFAULT_COVER_PROPORTIONS.spinePct,
    backPct: backPct ?? DEFAULT_COVER_PROPORTIONS.backPct,
    layout: layout ?? DEFAULT_COVER_PROPORTIONS.layout,
  };

  const hasWrap = !!wrapUrl;
  const wrapSrc = wrapUrl || "";
  const legacyFront = coverImageUrl || "/book-cover-front.jpg";
  const frontImg = hasWrap ? wrapSrc : legacyFront;

  const frontFaceStyle = hasWrap
    ? { backgroundImage: `url('${wrapSrc}')`, ...getCoverSliceStyle("front", proportions) }
    : { backgroundImage: `url('${legacyFront}')`, backgroundSize: "cover", backgroundPosition: "center" };

  const spineFaceStyle = hasWrap
    ? { backgroundImage: `url('${wrapSrc}')`, ...getCoverSliceStyle("spine", proportions) }
    : undefined;

  const backFaceStyle = hasWrap
    ? { backgroundImage: `url('${wrapSrc}')`, ...getCoverSliceStyle("back", proportions) }
    : undefined;

  const resetToIdle = () => {
    setHovered(false);
    setDragging(false);
    hasDraggedRef.current = false;
    setRotation(BASE_TILT);
  };

  const handleMouseEnter = () => setHovered(true);

  const handleMouseLeave = () => {
    // While actively dragging, let the drag continue past the box edge — the
    // window-level mouseup handler below decides whether to reset once released.
    if (dragging) return;
    resetToIdle();
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (dragging) return; // handled by the window-level listener so the drag isn't clipped to the box
    if (hasDraggedRef.current) return; // manual control was taken this hover session — ambient tilt is off

    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const relX = (e.clientX - rect.left) / rect.width;
    const relY = (e.clientY - rect.top) / rect.height;
    setRotation({
      x: BASE_TILT.x - (relY - 0.5) * PARALLAX_MAX,
      y: BASE_TILT.y + (relX - 0.5) * PARALLAX_MAX * 2,
    });
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(true);
    hasDraggedRef.current = true;
    dragStartPos.current = { x: e.clientX, y: e.clientY };
    dragStartRotation.current = rotation;
  };

  // While dragging, track the mouse at the window level — not just within the
  // (fairly small) book box — so the spin isn't clipped the instant the
  // cursor crosses the box edge. On release, only snap back to the idle flat
  // cover if the pointer ended up outside the box; otherwise stay hovered.
  useEffect(() => {
    if (!dragging) return;

    const onMove = (e: MouseEvent) => {
      const dx = e.clientX - dragStartPos.current.x;
      const dy = e.clientY - dragStartPos.current.y;
      const nextY = clamp(
        dragStartRotation.current.y + dx * DRAG_SENSITIVITY,
        -DRAG_CLAMP_Y,
        DRAG_CLAMP_Y
      );
      const nextX = clamp(
        dragStartRotation.current.x - dy * DRAG_SENSITIVITY,
        -DRAG_CLAMP_X,
        DRAG_CLAMP_X
      );
      setRotation({ x: nextX, y: nextY });
    };

    const onUp = (e: MouseEvent) => {
      setDragging(false);
      const rect = containerRef.current?.getBoundingClientRect();
      const stillInside =
        !!rect &&
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom;
      if (!stillInside) resetToIdle();
    };

    document.body.style.cursor = "grabbing";
    document.body.style.userSelect = "none";
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [dragging]);

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
          onMouseDown={handleMouseDown}
          className="relative w-[240px] h-[360px] md:w-[280px] md:h-[420px]"
          style={{ perspective: "1400px", cursor: dragging ? "grabbing" : hovered ? "grab" : "default" }}
        >
          {/* Idle flat front cover — the resting state, no 3D at all */}
          <div
            className="absolute inset-0 rounded-sm overflow-hidden border border-white/10 shadow-[16px_18px_28px_rgba(0,0,0,0.22)] transition-opacity duration-300"
            style={{
              opacity: hovered ? 0 : 1,
              ...frontFaceStyle,
            }}
          />

          {/* Hover state — the real 3D book box: front, spine, page-edge, back */}
          <div
            className="absolute inset-0 transition-opacity duration-300"
            style={{ opacity: hovered ? 1 : 0, pointerEvents: hovered ? "auto" : "none" }}
          >
            <div
              className="relative w-full h-full"
              style={{
                transformStyle: "preserve-3d",
                transition: dragging
                  ? "transform 0.03s linear"
                  : "transform 0.15s ease-out",
                transform: `rotateY(${rotation.y}deg) rotateX(${rotation.x}deg)`,
                filter: "drop-shadow(28px 32px 45px rgba(0,0,0,0.35))",
              }}
            >
              {/* Back cover */}
              <div
                className="absolute inset-0 rounded-sm bg-[#1a1410] bg-cover bg-center"
                style={{
                  transform: `translateZ(-${THICKNESS / 2}px) rotateY(180deg)`,
                  ...backFaceStyle,
                }}
              />

              {/* Spine — hinged at the left edge, sweeps back into depth */}
              <div
                className="absolute inset-y-0 left-0 rounded-l-sm bg-gradient-to-b from-[#2a1f16] via-[#1e1610] to-[#150f0a] bg-cover bg-center"
                style={{
                  width: `${THICKNESS}px`,
                  transformOrigin: "left center",
                  transform: "rotateY(-90deg)",
                  ...spineFaceStyle,
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
                  transform: `translateZ(${THICKNESS / 2}px)`,
                  ...frontFaceStyle,
                }}
              >
                {/* Sheen sweep — moves diagonally while hovering, before a drag takes over */}
                <div
                  className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/15 to-transparent pointer-events-none transition-transform duration-700 ease-out"
                  style={{
                    transform: hovered && !dragging ? "translateX(120%) skewX(-20deg)" : "translateX(-120%) skewX(-20deg)",
                  }}
                />
              </div>
            </div>
          </div>

          {/* "+" zoom affordance — fades in on hover, sits above the 3D transform */}
          <button
            type="button"
            aria-label="View full cover"
            onMouseDown={(e) => e.stopPropagation()}
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

        {hovered && (
          <p className="mt-3 text-[9px] uppercase tracking-widest text-muted-text font-mono animate-[fadeIn_0.3s_ease-out]">
            Click &amp; hold to spin
          </p>
        )}
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
          {hasWrap ? (
            // Sliced crop of the wrap image — background-image, since object-position
            // can't isolate an arbitrary panel the way background-size/position can.
            <div
              onClick={(e) => e.stopPropagation()}
              className="w-[min(90vw,480px)] aspect-[2/3] rounded-md shadow-2xl animate-[zoomIn_0.25s_cubic-bezier(0.16,1,0.3,1)]"
              style={{ backgroundImage: `url('${wrapSrc}')`, ...getCoverSliceStyle("front", proportions) }}
              role="img"
              aria-label="Full book cover"
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element -- needs an unconstrained img for arbitrary uploaded cover URLs
            <img
              src={frontImg}
              alt="Full book cover"
              onClick={(e) => e.stopPropagation()}
              className="max-h-[85vh] max-w-[90vw] object-contain rounded-md shadow-2xl animate-[zoomIn_0.25s_cubic-bezier(0.16,1,0.3,1)]"
            />
          )}
        </div>
      )}
    </>
  );
}

function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v));
}
