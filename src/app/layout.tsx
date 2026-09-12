import type { Metadata } from "next";
import { Inter, Fraunces } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/context/ThemeContext";
import { SiteSettingsProvider } from "@/context/SiteSettingsContext";
import { SoundProvider } from "@/context/SoundContext";

// "Modern editorial" pairing, chosen from the font options presented —
// Fraunces for headings/serif moments, Inter for body/UI copy.
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "The Unshaken Self — A Book By Ketul Shah",
  description: "Key Lessons from the Gita for a Life Without Doubt, Worry, and Fear. A premium book guide by KETUL SHAH.",
  keywords: [
    "Bhagavad Gita", 
    "The Unshaken Self", 
    "Ketul Shah", 
    "Mindfulness", 
    "Self Improvement", 
    "Resilience", 
    "Bhagavad Gita chapters", 
    "Spirituality", 
    "Overcoming worry"
  ],
  authors: [{ name: "KETUL SHAH" }],
  metadataBase: new URL("https://the-unshaken-self-site-hcp1.vercel.app"),
  openGraph: {
    title: "The Unshaken Self — A Book By Ketul Shah",
    description: "Key Lessons from the Gita for a Life Without Doubt, Worry, and Fear.",
    url: "https://the-unshaken-self-site-hcp1.vercel.app",
    siteName: "The Unshaken Self",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "The Unshaken Self Book Cover",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "The Unshaken Self — A Book By Ketul Shah",
    description: "Key Lessons from the Gita for a Life Without Doubt, Worry, and Fear.",
    images: ["/og-image.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${fraunces.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        {/* No theme-detection script here on purpose — the site always
            opens Light by default (see ThemeContext), so there is nothing
            to read from localStorage or the OS before paint. */}
        <script
          dangerouslySetInnerHTML={{
            // Browsers restore the previous scroll position on a plain reload
            // by default, which made a reload look like it "did nothing."
            // Disabling scroll restoration must happen this early (before the
            // browser applies it) so a reload always starts at the top, like
            // a genuinely fresh page load.
            __html: `(function(){try{if("scrollRestoration" in history){history.scrollRestoration="manual";}}catch(e){}})();`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col transition-colors duration-300">
        <ThemeProvider>
          <SoundProvider>
            <SiteSettingsProvider>
              {children}
            </SiteSettingsProvider>
          </SoundProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
