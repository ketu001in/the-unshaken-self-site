"use client";

// Full-screen zoom/pan viewer for a single image. Portaled to
// document.body (same reasoning as BuyNowButton's modal — a
// position:fixed element inside a transformed/overflow-hidden ancestor
// silently breaks, so this sidesteps that regardless of where the
// trigger is mounted).

import React, { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X, ZoomIn, ZoomOut } from "lucide-react";

type ImageLightboxProps = {
  src: string;
  alt: string;
  open: boolean;
  onClose: () => void;
};

const MIN_SCALE = 1;
const MAX_SCALE = 4;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export default function ImageLightbox({ src, alt, open, onClose }: ImageLightboxProps) {
  const [mounted, setMounted] = useState(false);
  const [scale, setScale] = useState(1);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const lastPointRef = useRef({ x: 0, y: 0 });
  const pinchStartDistRef = useRef<number | null>(null);
  const pinchStartScaleRef = useRef(1);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fresh zoom/pan state every time the lightbox is opened.
  useEffect(() => {
    if (open) {
      setScale(1);
      setPos({ x: 0, y: 0 });
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  const zoomBy = useCallback((delta: number) => {
    setScale((prev) => clamp(Math.round((prev + delta) * 100) / 100, MIN_SCALE, MAX_SCALE));
  }, []);

  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault();
      zoomBy(-e.deltaY * 0.0025);
    },
    [zoomBy]
  );

  const handleDoubleClick = useCallback(() => {
    setScale((prev) => (prev > 1 ? 1 : 2.5));
    setPos({ x: 0, y: 0 });
  }, []);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLImageElement>) => {
      if (scale <= 1) return;
      setIsDragging(true);
      lastPointRef.current = { x: e.clientX, y: e.clientY };
      e.currentTarget.setPointerCapture(e.pointerId);
    },
    [scale]
  );

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLImageElement>) => {
    if (!isDragging) return;
    const dx = e.clientX - lastPointRef.current.x;
    const dy = e.clientY - lastPointRef.current.y;
    lastPointRef.current = { x: e.clientX, y: e.clientY };
    setPos((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
  }, [isDragging]);

  const stopDragging = useCallback(() => setIsDragging(false), []);

  // Pinch-to-zoom for touch devices — Pointer Events deliver one stream
  // per finger, so a two-finger gesture is tracked via native touch
  // events instead, which report all active touches together.
  const handleTouchStart = useCallback(
    (e: React.TouchEvent<HTMLImageElement>) => {
      if (e.touches.length === 2) {
        const [a, b] = [e.touches[0], e.touches[1]];
        pinchStartDistRef.current = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
        pinchStartScaleRef.current = scale;
      }
    },
    [scale]
  );

  const handleTouchMove = useCallback((e: React.TouchEvent<HTMLImageElement>) => {
    if (e.touches.length === 2 && pinchStartDistRef.current) {
      const [a, b] = [e.touches[0], e.touches[1]];
      const dist = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
      const ratio = dist / pinchStartDistRef.current;
      setScale(clamp(pinchStartScaleRef.current * ratio, MIN_SCALE, MAX_SCALE));
    }
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent<HTMLImageElement>) => {
    if (e.touches.length < 2) pinchStartDistRef.current = null;
  }, []);

  if (!mounted || !open) return null;

  const modal = (
    <div
      className="fixed inset-0 z-[60] bg-black/90 backdrop-blur-sm flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-label={alt}
      onWheel={handleWheel}
    >
      <button
        onClick={onClose}
        className="absolute top-5 right-5 w-10 h-10 rounded-full flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer z-10"
        aria-label="Close"
      >
        <X className="w-5 h-5" />
      </button>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 z-10">
        <button
          onClick={() => zoomBy(-0.5)}
          className="w-9 h-9 rounded-full flex items-center justify-center text-white/80 hover:text-white bg-white/10 hover:bg-white/20 transition-colors cursor-pointer"
          aria-label="Zoom out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <span className="text-[10px] text-white/60 font-mono w-10 text-center">{Math.round(scale * 100)}%</span>
        <button
          onClick={() => zoomBy(0.5)}
          className="w-9 h-9 rounded-full flex items-center justify-center text-white/80 hover:text-white bg-white/10 hover:bg-white/20 transition-colors cursor-pointer"
          aria-label="Zoom in"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
      </div>

      {/* Backdrop click-to-close layer, sits behind the image */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* eslint-disable-next-line @next/next/no-img-element -- a plain
          <img> is needed: the pan/zoom transform on unconstrained
          natural size inside a fixed-viewport lightbox doesn't fit
          next/image's fill/sizes model. */}
      <img
        src={src}
        alt={alt}
        onDoubleClick={handleDoubleClick}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={stopDragging}
        onPointerLeave={stopDragging}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        draggable={false}
        className="relative max-w-[90vw] max-h-[85vh] object-contain rounded-lg select-none"
        style={{
          transform: `translate(${pos.x}px, ${pos.y}px) scale(${scale})`,
          transition: isDragging ? "none" : "transform 0.15s ease-out",
          cursor: scale > 1 ? "grab" : "zoom-in",
          touchAction: "none",
        }}
      />
    </div>
  );

  return createPortal(modal, document.body);
}
