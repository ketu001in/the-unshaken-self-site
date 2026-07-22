import type { Metadata } from "next";
import { Outfit, Playfair_Display } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/context/ThemeContext";
import { SiteSettingsProvider } from "@/context/SiteSettingsContext";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "The Unshaken Self | KETUL SHAH",
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
    title: "The Unshaken Self | KETUL SHAH",
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
    title: "The Unshaken Self | KETUL SHAH",
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
      className={`${outfit.variable} ${playfair.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("theme");if(!t){t=window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";}document.documentElement.classList.toggle("dark",t==="dark");}catch(e){}})();`,
          }}
        />
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
          <SiteSettingsProvider>
            {children}
          </SiteSettingsProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
