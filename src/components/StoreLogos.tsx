// Compact, original brand-tile marks for the Buy Now modal's store list.
// These are simplified monogram/icon renditions in each brand's signature
// colors (not traced copies of the official trademarked artwork), sized
// to read clearly at small badge sizes. Each component paints its own
// rounded-square background so it stays legible regardless of the
// surrounding light/dark theme.

import React from "react";

type LogoProps = {
  className?: string;
};

export function AmazonLogo({ className = "w-11 h-11" }: LogoProps) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true">
      <rect width="40" height="40" rx="9" fill="#131A22" />
      <text
        x="20"
        y="24"
        textAnchor="middle"
        fontFamily="Georgia, 'Times New Roman', serif"
        fontWeight="700"
        fontSize="20"
        fill="#ffffff"
      >
        a
      </text>
      <path
        d="M10 28.5c6 4.2 14 4.2 20 0"
        stroke="#FF9900"
        strokeWidth="2.4"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M28 27.2l2.6 1.6-1.2 2.7"
        stroke="#FF9900"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

export function FlipkartLogo({ className = "w-11 h-11" }: LogoProps) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true">
      <rect width="40" height="40" rx="9" fill="#2874F0" />
      <path
        d="M12 15h16l-1.7 15.3a2.6 2.6 0 0 1-2.6 2.3h-7.4a2.6 2.6 0 0 1-2.6-2.3L12 15z"
        fill="#ffffff"
      />
      <path
        d="M15.5 15v-1.8a4.5 4.5 0 0 1 9 0V15"
        stroke="#ffffff"
        strokeWidth="1.8"
        fill="none"
      />
      <text
        x="20"
        y="26.5"
        textAnchor="middle"
        fontFamily="Arial, Helvetica, sans-serif"
        fontWeight="800"
        fontSize="11"
        fill="#2874F0"
      >
        F
      </text>
    </svg>
  );
}

export function ZiffyBeeLogo({ className = "w-11 h-11" }: LogoProps) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true">
      <defs>
        <clipPath id="ziffybee-body">
          <ellipse cx="20" cy="23.5" rx="8.5" ry="6.5" />
        </clipPath>
      </defs>
      <rect width="40" height="40" rx="9" fill="#dfb15b" />
      <ellipse cx="13.5" cy="17" rx="5" ry="3.1" fill="#ffffff" fillOpacity="0.9" transform="rotate(-22 13.5 17)" />
      <ellipse cx="26.5" cy="17" rx="5" ry="3.1" fill="#ffffff" fillOpacity="0.9" transform="rotate(22 26.5 17)" />
      <g clipPath="url(#ziffybee-body)">
        <rect x="11" y="16.5" width="18" height="14" fill="#1a1a1a" />
        <rect x="11" y="20.2" width="18" height="2.4" fill="#ffffff" />
        <rect x="11" y="24.8" width="18" height="2.4" fill="#ffffff" />
      </g>
      <line x1="17.2" y1="18" x2="15.8" y2="13.5" stroke="#1a1a1a" strokeWidth="1.3" strokeLinecap="round" />
      <line x1="22.8" y1="18" x2="24.2" y2="13.5" stroke="#1a1a1a" strokeWidth="1.3" strokeLinecap="round" />
      <circle cx="15.8" cy="13" r="1" fill="#1a1a1a" />
      <circle cx="24.2" cy="13" r="1" fill="#1a1a1a" />
    </svg>
  );
}
