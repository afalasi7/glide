import type { MetadataRoute } from "next";

const SITE = "https://glide.alfalasi.io";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${SITE}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE}/app`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE}/previews`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE}/terms`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE}/privacy`, changeFrequency: "yearly", priority: 0.3 },
  ];
}
