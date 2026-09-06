// Compact, original brand-tile marks for the Buy Now modal and Preorder
// page store cards. These are simplified monogram/icon renditions in each
// brand's signature colors (not traced copies of the official trademarked
// artwork), sized to read clearly at small badge sizes. Each component
// paints its own rounded-square background so it stays legible regardless
// of the surrounding light/dark theme.

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

export function NotionPressLogo({ className = "w-11 h-11" }: LogoProps) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true">
      <rect width="40" height="40" rx="9" fill="#161821" />
      <text
        x="20"
        y="25"
        textAnchor="middle"
        fontFamily="Georgia, 'Times New Roman', serif"
        fontWeight="700"
        fontSize="15"
        fill="#ffffff"
        letterSpacing="0.5"
      >
        NP
      </text>
      <circle cx="30" cy="11" r="3.2" fill="#dfb15b" />
    </svg>
  );
}

export function FlipkartLogo({ className = "w-11 h-11" }: LogoProps) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true">
      <rect width="40" height="40" rx="9" fill="#2874F0" />
      <text
        x="19"
        y="26"
        textAnchor="middle"
        fontFamily="Georgia, 'Times New Roman', serif"
        fontWeight="700"
        fontStyle="italic"
        fontSize="19"
        fill="#ffffff"
      >
        f
      </text>
      <path
        d="M25.5 15.5l3 3-3 3"
        stroke="#FFE500"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}
