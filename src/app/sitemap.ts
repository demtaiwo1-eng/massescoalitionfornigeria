import type { MetadataRoute } from "next";
const categories = ["politics", "economy", "security", "education", "health", "society"];
export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.SITE_URL || "https://massescoalitionfornigeria.com";
  const pages = ["", "/about", "/editorial-policy", "/contact", "/latest", "/categories", ...categories.map(c => `/category/${c}`)];
  return pages.map(path => ({ url: `${base}${path}`, lastModified: new Date(), changeFrequency: path === "" ? "daily" : "weekly", priority: path === "" ? 1 : 0.7 }));
}
