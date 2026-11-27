import type { MetadataRoute } from "next";

export const dynamic = "force-static";
export const revalidate = 3600;

const categories = ["politics", "economy", "security", "education", "health", "society"];

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.SITE_URL || "https://www.massescoalitionfornigeria.com";
  const pages = ["", "/about", "/editorial-policy", "/corrections", "/privacy", "/terms", "/contact", "/latest", "/categories", "/search", "/access/activate", ...categories.map(c => `/category/${c}`)];
  return pages.map(path => ({
    url: `${base}${path}`,
    lastModified: new Date(),
    changeFrequency: path === "" ? "daily" : "weekly",
    priority: path === "" ? 1 : 0.7,
  }));
}
