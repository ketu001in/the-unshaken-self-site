import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://theunshakenself.com";
  const routes = [
    "",
    "/about-book",
    "/about-author",
    "/preview",
    "/reviews",
    "/blog",
    "/events",
    "/resources",
    "/preorder",
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: route === "" ? 1.0 : 0.8,
  }));
}
