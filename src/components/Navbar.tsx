"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import ThemeToggle from "./ThemeToggle";
import { Menu, X, BookOpen } from "lucide-react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "About Book", href: "/about-book" },
    { name: "About Author", href: "/about-author" },
    { name: "Preview", href: "/preview" },
    { name: "Blog", href: "/blog" },
    { name: "Resources", href: "/resources" },
    { name: "Events", href: "/events" },
  ];

  const isActive = (href: string) => pathname === href;

  // Next.js's Link is a no-op when you click through to the route you're
  // already on — so clicking the logo while on the homepage did nothing at
  // all (page stayed wherever it was scrolled to). Force a scroll-to-top in
  // that case; for every other page, Link's normal navigation already lands
  // at the top of the new page.
  const handleLogoClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (pathname === "/") {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <nav
      className={`fixed top-0 inset-x-0 z-40 transition-all duration-300 ${
        scrolled
          ? "bg-white/80 dark:bg-[#070b09]/80 backdrop-blur-md border-b border-border-custom py-3"
          : "bg-transparent py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-12">
          
          {/* Logo Section */}
          <div className="flex-shrink-0">
            <Link
              href="/"
              onClick={handleLogoClick}
              className="flex items-center space-x-2 text-primary font-serif tracking-widest text-base sm:text-lg uppercase hover:opacity-80 transition-opacity"
            >
              <BookOpen className="w-5 h-5 text-[#dfb15b]" />
              <span className="font-semibold text-foreground">The Unshaken Self</span>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={`text-xs uppercase tracking-widest transition-colors hover:text-foreground nav-link-hover ${
                  isActive(link.href)
                    ? "text-[#dfb15b] font-semibold"
                    : "text-muted-text"
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Desktop Actions Section */}
          <div className="hidden lg:flex items-center space-x-4">
            {/* Theme Toggle */}
            <ThemeToggle />
            
            {/* Preorder Call to Action */}
            <Link
              href="/preorder"
              className="px-5 py-2.5 rounded-full bg-[#1e3f20] dark:bg-[#dfb15b] hover:bg-[#142a15] dark:hover:bg-[#c49945] text-white dark:text-black font-sans text-xs uppercase tracking-widest font-semibold shadow-md transition-all hover:scale-105 active:scale-95 duration-200"
            >
              Pre-order
            </Link>
          </div>

          {/* Mobile Menu Actions (Toggle + Hamburger) */}
          <div className="flex items-center space-x-3 lg:hidden">
            <ThemeToggle />
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-md text-foreground hover:bg-black/5 dark:hover:bg-white/5 transition-colors focus:outline-none focus:ring-2 focus:ring-accent/40"
              aria-label="Toggle Navigation Menu"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isOpen && (
        <div className="lg:hidden absolute top-full left-0 w-full bg-white dark:bg-[#070b09] border-b border-border-custom shadow-2xl transition-all duration-300">
          <div className="px-4 pt-2 pb-6 space-y-3 flex flex-col">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={`px-3 py-2.5 rounded-lg text-sm font-medium tracking-wide transition-colors ${
                  isActive(link.href)
                    ? "bg-[#1e3f20]/10 dark:bg-[#dfb15b]/10 text-primary font-semibold"
                    : "text-muted-text hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5"
                }`}
              >
                {link.name}
              </Link>
            ))}
            
            {/* Mobile Pre-order CTA */}
            <div className="pt-4 border-t border-border-custom px-3">
              <Link
                href="/preorder"
                onClick={() => setIsOpen(false)}
                className="w-full block text-center py-3 rounded-full bg-[#1e3f20] dark:bg-[#dfb15b] text-white dark:text-black font-sans text-xs uppercase tracking-widest font-semibold shadow-md transition-all duration-200"
              >
                Pre-order Now
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
