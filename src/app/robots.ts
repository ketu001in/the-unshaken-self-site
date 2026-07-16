import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: "/admin", // Protect admin metrics page from crawlers
    },
    sitemap: "https://theunshakenself.com/sitemap.xml",
  };
}
