import type { MetadataRoute } from "next";

export const dynamic = "force-static";
export const revalidate = 3600;

export default function robots(): MetadataRoute.Robots {
  const base = process.env.SITE_URL || "https://www.massescoalitionfornigeria.com";
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/newsroom/", "/api/"],
    },
    sitemap: `${base}/sitemap.xml`,
  };
}
